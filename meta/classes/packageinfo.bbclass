python packageinfo_handler () {
    import oe.packagedata
    import cPickle as pickle

    pkginfolist = []

    pkgdata_dir = e.data.getVar("PKGDATA_DIR", True) + '/runtime/'
    # This is somewhat of a hack which is only suitable for locked configurations
    pkgdata_cache = e.data.getVar("PKGDATA_CACHE", True)
    if pkgdata_cache and os.path.exists(pkgdata_cache):
        with open(pkgdata_cache, 'rb') as f:
            pkginfolist = pickle.load(f)
    elif os.path.exists(pkgdata_dir):
        for root, dirs, files in os.walk(pkgdata_dir):
            for pkgname in files:
                if pkgname.endswith('.packaged'):
                    pkgname = pkgname[:-9]
                    pkgdatafile = root + pkgname
                    try:
                        sdata = oe.packagedata.read_pkgdatafile(pkgdatafile)
                        sdata['PKG'] = pkgname
                        pkginfolist.append(sdata)
                    except Exception as e:
                        bb.warn("Failed to read pkgdata file %s: %s: %s" % (pkgdatafile, e.__class__, str(e)))
        with open(pkgdata_cache, 'wb') as f:
            pickle.dump(pkginfolist, f)
    bb.event.fire(bb.event.PackageInfo(pkginfolist), e.data)
}

addhandler packageinfo_handler
packageinfo_handler[eventmask] = "bb.event.RequestPackageInfo"
