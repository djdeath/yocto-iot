import bb.siggen

def sstate_rundepfilter(siggen, fn, recipename, task, dep, depname, dataCache):
    # Return True if we should keep the dependency, False to drop it
    def isNative(x):
        return x.endswith("-native")
    def isCross(x):
        return x.endswith("-cross") or x.endswith("-cross-initial") or x.endswith("-cross-intermediate")
    def isNativeSDK(x):
        return x.startswith("nativesdk-")
    def isKernel(fn):
        inherits = " ".join(dataCache.inherits[fn])
        return inherits.find("module-base.bbclass") != -1 or inherits.find("linux-kernel-base.bbclass") != -1

    # Always include our own inter-task dependencies
    if recipename == depname:
        return True

    # Quilt (patch application) changing isn't likely to affect anything
    excludelist = ['quilt-native', 'subversion-native', 'git-native']
    if depname in excludelist and recipename != depname:
        return False

    # Don't change native/cross/nativesdk recipe dependencies any further
    if isNative(recipename) or isCross(recipename) or isNativeSDK(recipename):
        return True

    # Only target packages beyond here

    # Drop native/cross/nativesdk dependencies from target recipes
    if isNative(depname) or isCross(depname) or isNativeSDK(depname):
        return False

    # Exclude well defined machine specific configurations which don't change ABI
    if depname in siggen.abisaferecipes:
        return False

    # Exclude well defined recipe->dependency
    if "%s->%s" % (recipename, depname) in siggen.saferecipedeps:
        return False

    # Kernel modules are well namespaced. We don't want to depend on the kernel's checksum
    # if we're just doing an RRECOMMENDS_xxx = "kernel-module-*", not least because the checksum
    # is machine specific.
    # Therefore if we're not a kernel or a module recipe (inheriting the kernel classes)
    # and we reccomend a kernel-module, we exclude the dependency.
    depfn = dep.rsplit(".", 1)[0]
    if dataCache and isKernel(depfn) and not isKernel(fn):
        for pkg in dataCache.runrecs[fn]:
            if " ".join(dataCache.runrecs[fn][pkg]).find("kernel-module-") != -1:
                return False

    # Default to keep dependencies
    return True

def sstate_lockedsigs(d):
    sigs = {}
    lockedsigs = (d.getVar("SIGGEN_LOCKEDSIGS", True) or "").split()
    for ls in lockedsigs:
        pn, task, h = ls.split(":", 2)
        if pn not in sigs:
            sigs[pn] = {}
        sigs[pn][task] = h
    return sigs

class SignatureGeneratorOEBasic(bb.siggen.SignatureGeneratorBasic):
    name = "OEBasic"
    def init_rundepcheck(self, data):
        self.abisaferecipes = (data.getVar("SIGGEN_EXCLUDERECIPES_ABISAFE", True) or "").split()
        self.saferecipedeps = (data.getVar("SIGGEN_EXCLUDE_SAFE_RECIPE_DEPS", True) or "").split()
        pass
    def rundep_check(self, fn, recipename, task, dep, depname, dataCache = None):
        return sstate_rundepfilter(self, fn, recipename, task, dep, depname, dataCache)

class SignatureGeneratorOEBasicHash(bb.siggen.SignatureGeneratorBasicHash):
    name = "OEBasicHash"
    def init_rundepcheck(self, data):
        self.abisaferecipes = (data.getVar("SIGGEN_EXCLUDERECIPES_ABISAFE", True) or "").split()
        self.saferecipedeps = (data.getVar("SIGGEN_EXCLUDE_SAFE_RECIPE_DEPS", True) or "").split()
        self.lockedsigs = sstate_lockedsigs(data)
        self.lockedhashes = {}
        pass
    def rundep_check(self, fn, recipename, task, dep, depname, dataCache = None):
        return sstate_rundepfilter(self, fn, recipename, task, dep, depname, dataCache)
    def dump_sigs(self, dataCache):
        sigs = []
        for fn in self.taskdeps:
            for task in self.taskdeps[fn]:
                k = fn + "." + task
                if k not in self.taskhash:
                    continue
                sigs.append("    " + dataCache.pkg_fn[fn] + ":" + task + ":" + self.taskhash[k] + " \\\n")
        sigs.sort()
        with open("locked-sigs.inc", "w") as f:
            f.write('SIGGEN_LOCKEDSIGS = "\\\n')
            for s in sigs:
                f.write(s)
            f.write('    "\n')
        return super(bb.siggen.SignatureGeneratorBasicHash, self).dump_sigs(dataCache)
    def get_taskhash(self, fn, task, deps, dataCache):
        recipename = dataCache.pkg_fn[fn]
        if recipename in self.lockedsigs:
            if task in self.lockedsigs[recipename]:
                k = fn + "." + task
                h = self.lockedsigs[recipename][task]
                self.lockedhashes[k] = h
                self.taskhash[k] = h
                #bb.warn("Using %s %s %s" % (recipename, task, h))
                return h
        h = super(bb.siggen.SignatureGeneratorBasicHash, self).get_taskhash(fn, task, deps, dataCache)
        #bb.warn("%s %s %s" % (recipename, task, h))
        return h
    def dump_sigtask(self, fn, task, stampbase, runtime):
        k = fn + "." + task
        if k in self.lockedhashes:
            return
        super(bb.siggen.SignatureGeneratorBasicHash, self).dump_sigtask(fn, task, stampbase, runtime)

# Insert these classes into siggen's namespace so it can see and select them
bb.siggen.SignatureGeneratorOEBasic = SignatureGeneratorOEBasic
bb.siggen.SignatureGeneratorOEBasicHash = SignatureGeneratorOEBasicHash


def find_siginfo(pn, taskname, taskhashlist, d):
    """ Find signature data files for comparison purposes """

    import fnmatch
    import glob

    if taskhashlist:
        hashfiles = {}

    if not taskname:
        # We have to derive pn and taskname
        key = pn
        splitit = key.split('.bb.')
        taskname = splitit[1]
        pn = os.path.basename(splitit[0]).split('_')[0]
        if key.startswith('virtual:native:'):
            pn = pn + '-native'

    filedates = {}

    # First search in stamps dir
    localdata = d.createCopy()
    localdata.setVar('MULTIMACH_TARGET_SYS', '*')
    localdata.setVar('PN', pn)
    localdata.setVar('PV', '*')
    localdata.setVar('PR', '*')
    localdata.setVar('EXTENDPE', '')
    stamp = localdata.getVar('STAMP', True)
    filespec = '%s.%s.sigdata.*' % (stamp, taskname)
    foundall = False
    import glob
    for fullpath in glob.glob(filespec):
        match = False
        if taskhashlist:
            for taskhash in taskhashlist:
                if fullpath.endswith('.%s' % taskhash):
                    hashfiles[taskhash] = fullpath
                    if len(hashfiles) == len(taskhashlist):
                        foundall = True
                        break
        else:
            filedates[fullpath] = os.stat(fullpath).st_mtime

    if len(filedates) < 2 and not foundall:
        # That didn't work, look in sstate-cache
        hashes = taskhashlist or ['*']
        localdata = bb.data.createCopy(d)
        for hashval in hashes:
            localdata.setVar('PACKAGE_ARCH', '*')
            localdata.setVar('TARGET_VENDOR', '*')
            localdata.setVar('TARGET_OS', '*')
            localdata.setVar('PN', pn)
            localdata.setVar('PV', '*')
            localdata.setVar('PR', '*')
            localdata.setVar('BB_TASKHASH', hashval)
            if pn.endswith('-native') or pn.endswith('-crosssdk') or pn.endswith('-cross'):
                localdata.setVar('SSTATE_EXTRAPATH', "${NATIVELSBSTRING}/")
            sstatename = d.getVarFlag(taskname, "sstate-name")
            if not sstatename:
                sstatename = taskname
            filespec = '%s_%s.*.siginfo' % (localdata.getVar('SSTATE_PKG', True), sstatename)

            if hashval != '*':
                sstatedir = "%s/%s" % (d.getVar('SSTATE_DIR', True), hashval[:2])
            else:
                sstatedir = d.getVar('SSTATE_DIR', True)

            filedates = {}
            for root, dirs, files in os.walk(sstatedir):
                for fn in files:
                    fullpath = os.path.join(root, fn)
                    if fnmatch.fnmatch(fullpath, filespec):
                        if taskhashlist:
                            hashfiles[hashval] = fullpath
                        else:
                            filedates[fullpath] = os.stat(fullpath).st_mtime

    if taskhashlist:
        return hashfiles
    else:
        return filedates

bb.siggen.find_siginfo = find_siginfo
