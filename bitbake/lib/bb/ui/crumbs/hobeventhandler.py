#
# BitBake Graphical GTK User Interface
#
# Copyright (C) 2011        Intel Corporation
#
# Authored by Joshua Lock <josh@linux.intel.com>
# Authored by Dongxiao Xu <dongxiao.xu@intel.com>
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

import gobject
import logging
import ast
from bb.ui.crumbs.runningbuild import RunningBuild

class HobHandler(gobject.GObject):

    """
    This object does BitBake event handling for the hob gui.
    """
    __gsignals__ = {
         "package-formats-updated" : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_PYOBJECT,)),
         "config-updated"          : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_STRING, gobject.TYPE_PYOBJECT,)),
         "command-succeeded"       : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_INT,)),
         "command-failed"          : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_STRING,)),
         "parsing-warning"         : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_STRING,)),
         "sanity-failed"           : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_STRING,)),
         "generating-data"         : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     ()),
         "data-generated"          : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     ()),
         "parsing-started"         : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_PYOBJECT,)),
         "parsing"                 : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_PYOBJECT,)),
         "parsing-completed"       : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     (gobject.TYPE_PYOBJECT,)),
         "recipe-populated"        : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     ()),
         "package-populated"       : (gobject.SIGNAL_RUN_LAST,
                                      gobject.TYPE_NONE,
                                     ()),
    }

    (GENERATE_CONFIGURATION, GENERATE_RECIPES, GENERATE_PACKAGES, GENERATE_IMAGE, POPULATE_PACKAGEINFO, SANITY_CHECK) = range(6)
    (SUB_FILES_MACH, SUB_PARSE_CONFIG, SUB_SANITY_CHECK, SUB_GNERATE_TGTS, SUB_GENERATE_PKGINFO, SUB_BUILD_RECIPES, SUB_BUILD_IMAGE) = range(7)

    def __init__(self, server, recipe_model, package_model):
        super(HobHandler, self).__init__()

        self.build = RunningBuild(sequential=True)

        self.recipe_model = recipe_model
        self.package_model = package_model

        self.commands_async = []
        self.generating = False
        self.current_phase = None
        self.building = False
        self.recipe_queue = []
        self.package_queue = []

        self.server = server
        self.error_msg = ""
        self.initcmd = None
        self.parsing = False

    def set_busy(self):
        if not self.generating:
            self.emit("generating-data")
            self.generating = True

    def clear_busy(self):
        if self.generating:
            self.emit("data-generated")
            self.generating = False

    def runCommand(self, commandline):
        try:
            result, error = self.server.runCommand(commandline)
            if error:
                raise Exception("Error running command '%s': %s" % (commandline, error))
            return result
        except Exception as e:
            self.commands_async = []
            self.clear_busy()
            self.emit("command-failed", "Hob Exception - %s" % (str(e)))
            return None

    def run_next_command(self, initcmd=None):
        if initcmd != None:
            self.initcmd = initcmd

        if self.commands_async:
            self.set_busy()
            next_command = self.commands_async.pop(0)
        else:
            self.clear_busy()
            if self.initcmd != None:
                self.emit("command-succeeded", self.initcmd)
            return

        if next_command == self.SUB_FILES_MACH:
            self.runCommand(["findConfigFiles", "MACHINE"])
        elif next_command == self.SUB_PARSE_CONFIG:
            self.runCommand(["enableDataTracking"])
            self.runCommand(["parseConfigurationFiles", "", ""])
            self.runCommand(["disableDataTracking"])
        elif next_command == self.SUB_GNERATE_TGTS:
            self.runCommand(["generateTargetsTree", "classes/image.bbclass", []])
        elif next_command == self.SUB_GENERATE_PKGINFO:
            self.runCommand(["triggerEvent", "bb.event.RequestPackageInfo()"])
        elif next_command == self.SUB_SANITY_CHECK:
            self.runCommand(["triggerEvent", "bb.event.SanityCheck()"])
        elif next_command == self.SUB_BUILD_RECIPES:
            self.clear_busy()
            self.building = True
            self.runCommand(["buildTargets", self.recipe_queue, self.default_task])
            self.recipe_queue = []
        elif next_command == self.SUB_BUILD_IMAGE:
            self.clear_busy()
            self.building = True
            target = self.image
            if target == "hob-image":
                hobImage = self.runCommand(["matchFile", "hob-image.bb"])
                if self.base_image != "Start with an empty image recipe":
                    baseImage = self.runCommand(["matchFile", self.base_image + ".bb"])
                    version = self.runCommand(["generateNewImage", hobImage, baseImage, self.package_queue, True, ""])
                    target += version
                    self.recipe_model.set_custom_image_version(version)

            targets = [target + ":do_rootfs"]
            if self.toolchain:
                targets.append(target + ":do_populate_sdk")
            self.runCommand(["buildTargets", targets, self.default_task])

    def display_error(self):
        self.clear_busy()
        self.emit("command-failed", self.error_msg)
        self.error_msg = ""
        if self.building:
            self.building = False

    def handle_event(self, event):
        if not event:
            return
        if self.building:
            self.current_phase = "building"
            self.build.handle_event(event)

        if isinstance(event, bb.event.PackageInfo):
            self.package_model.populate(event._pkginfolist)
            self.emit("package-populated")
            self.run_next_command()

        elif isinstance(event, bb.event.SanityCheckPassed):
            reparse = self.runCommand(["getVariable", "BB_INVALIDCONF"]) or None
            if reparse is True:
                self.set_var_in_file("BB_INVALIDCONF", False, "local.conf")
                self.runCommand(["parseConfigurationFiles", "", ""])
            self.run_next_command()

        elif isinstance(event, bb.event.SanityCheckFailed):
            self.emit("sanity-failed", event._msg)

        elif isinstance(event, logging.LogRecord):
            if not self.building:
                if event.levelno >= logging.ERROR:
                    formatter = bb.msg.BBLogFormatter()
                    msg = formatter.format(event)
                    self.error_msg += msg + '\n'
                elif event.levelno >= logging.WARNING and self.parsing == True:
                    formatter = bb.msg.BBLogFormatter()
                    msg = formatter.format(event)
                    warn_msg = msg + '\n'
                    self.emit("parsing-warning", warn_msg)

        elif isinstance(event, bb.event.TargetsTreeGenerated):
            self.current_phase = "data generation"
            if event._model:
                self.recipe_model.populate(event._model)
                self.emit("recipe-populated")
        elif isinstance(event, bb.event.ConfigFilesFound):
            self.current_phase = "configuration lookup"
            var = event._variable
            values = event._values
            values.sort()
            self.emit("config-updated", var, values)
        elif isinstance(event, bb.event.ConfigFilePathFound):
            self.current_phase = "configuration lookup"
        elif isinstance(event, bb.event.FilesMatchingFound):
            self.current_phase = "configuration lookup"
            # FIXME: hard coding, should at least be a variable shared between
            # here and the caller
            if event._pattern == "rootfs_":
                formats = []
                for match in event._matches:
                    classname, sep, cls = match.rpartition(".")
                    fs, sep, format = classname.rpartition("_")
                    formats.append(format)
                formats.sort()
                self.emit("package-formats-updated", formats)
        elif isinstance(event, bb.command.CommandCompleted):
            self.current_phase = None
            self.run_next_command()
        elif isinstance(event, bb.command.CommandFailed):
            self.commands_async = []
            self.display_error()
        elif isinstance(event, (bb.event.ParseStarted,
                 bb.event.CacheLoadStarted,
                 bb.event.TreeDataPreparationStarted,
                 )):
            message = {}
            message["eventname"] = bb.event.getName(event)
            message["current"] = 0
            message["total"] = None
            message["title"] = "Parsing recipes"
            self.emit("parsing-started", message)
            if isinstance(event, bb.event.ParseStarted):
                self.parsing = True
        elif isinstance(event, (bb.event.ParseProgress,
                bb.event.CacheLoadProgress,
                bb.event.TreeDataPreparationProgress)):
            message = {}
            message["eventname"] = bb.event.getName(event)
            message["current"] = event.current
            message["total"] = event.total
            message["title"] = "Parsing recipes"
            self.emit("parsing", message)
        elif isinstance(event, (bb.event.ParseCompleted,
                bb.event.CacheLoadCompleted,
                bb.event.TreeDataPreparationCompleted)):
            message = {}
            message["eventname"] = bb.event.getName(event)
            message["current"] = event.total
            message["total"] = event.total
            message["title"] = "Parsing recipes"
            self.emit("parsing-completed", message)
            if isinstance(event, bb.event.ParseCompleted):
                self.parsing = False

        if self.error_msg and not self.commands_async:
            self.display_error()

        return

    def init_cooker(self):
        self.runCommand(["initCooker"])

    def reset_cooker(self):
        self.runCommand(["enableDataTracking"])
        self.runCommand(["resetCooker"])
        self.runCommand(["disableDataTracking"])

    def set_distro(self, distro):
        self.set_var_in_file("DISTRO", distro, "local.conf")

    def request_package_info(self):
        self.commands_async.append(self.SUB_GENERATE_PKGINFO)
        self.run_next_command(self.POPULATE_PACKAGEINFO)

    def trigger_sanity_check(self):
        self.commands_async.append(self.SUB_SANITY_CHECK)
        self.run_next_command(self.SANITY_CHECK)

    def generate_configuration(self):
        self.commands_async.append(self.SUB_PARSE_CONFIG)
        self.commands_async.append(self.SUB_FILES_MACH)
        self.run_next_command(self.GENERATE_CONFIGURATION)

    def generate_recipes(self):
        self.commands_async.append(self.SUB_PARSE_CONFIG)
        self.commands_async.append(self.SUB_GNERATE_TGTS)
        self.run_next_command(self.GENERATE_RECIPES)

    def generate_packages(self, tgts, default_task="build"):
        targets = []
        targets.extend(tgts)
        self.recipe_queue = targets
        self.default_task = default_task
        self.commands_async.append(self.SUB_PARSE_CONFIG)
        self.commands_async.append(self.SUB_BUILD_RECIPES)
        self.run_next_command(self.GENERATE_PACKAGES)

    def generate_image(self, image, base_image, image_packages=[], toolchain=False, default_task="build"):
        self.image = image
        self.base_image = base_image
        self.toolchain = toolchain
        self.package_queue = image_packages
        self.default_task = default_task
        self.commands_async.append(self.SUB_PARSE_CONFIG)
        self.commands_async.append(self.SUB_BUILD_IMAGE)
        self.run_next_command(self.GENERATE_IMAGE)

    def generate_new_image(self, image, base_image, package_queue, description):
        base_image = self.runCommand(["matchFile", self.base_image + ".bb"])
        self.runCommand(["generateNewImage", image, base_image, package_queue, False, description])

    def ensure_dir(self, directory):
        self.runCommand(["ensureDir", directory])

    def build_succeeded_async(self):
        self.building = False

    def build_failed_async(self):
        self.initcmd = None
        self.commands_async = []
        self.building = False

    def cancel_parse(self):
        self.runCommand(["stateForceShutdown"])

    def cancel_build(self, force=False):
        if force:
            # Force the cooker to stop as quickly as possible
            self.runCommand(["stateForceShutdown"])
        else:
            # Wait for tasks to complete before shutting down, this helps
            # leave the workdir in a usable state
            self.runCommand(["stateShutdown"])

    def reset_build(self):
        self.build.reset()

    def _remove_redundant(self, string):
        ret = []
        for i in string.split():
            if i not in ret:
                ret.append(i)
        return " ".join(ret)

    def set_var_in_file(self, var, val, default_file=None):
        self.runCommand(["enableDataTracking"])
        self.runCommand(["setVarFile", var, val, default_file, "set"])
        self.runCommand(["disableDataTracking"])

    def early_assign_var_in_file(self, var, val, default_file=None):
        self.runCommand(["setVarFile", var, val, default_file, "earlyAssign"])
        self.runCommand(["disableDataTracking"])

    def remove_var_from_file(self, var):
        self.runCommand(["removeVarFile", var])

    def append_var_in_file(self, var, val, default_file=None):
        self.runCommand(["setVarFile", var, val, default_file, "append"])

    def append_to_bbfiles(self, val):
        bbfiles = self.runCommand(["getVariable", "BBFILES", "False"]) or ""
        bbfiles = bbfiles.split()
        if val not in bbfiles:
            self.append_var_in_file("BBFILES", val, "local.conf")

    def get_parameters(self):
        # retrieve the parameters from bitbake
        params = {}
        params["image_list"] = self.runCommand(["getVariable", "HOB_IMAGELIST"]) or ""
        params["image_addr"] = self.runCommand(["getVariable", "DEPLOY_DIR_IMAGE"]) or ""
        params["image_types"] = self._remove_redundant(self.runCommand(["getVariable", "IMAGE_TYPES"]) or "")
        params["runnable_image_types"] = self._remove_redundant(self.runCommand(["getVariable", "RUNNABLE_IMAGE_TYPES"]) or "")
        params["runnable_machine_patterns"] = self._remove_redundant(self.runCommand(["getVariable", "RUNNABLE_MACHINE_PATTERNS"]) or "")
        params["deployable_image_types"] = self._remove_redundant(self.runCommand(["getVariable", "DEPLOYABLE_IMAGE_TYPES"]) or "")
        params["kernel_image_type"] = self.runCommand(["getVariable", "KERNEL_IMAGETYPE"]) or ""
        params["core_base"] = self.runCommand(["getVariable", "COREBASE"]) or ""
        params["staging_dir_native"] = self.runCommand(["getVariable", "STAGING_DIR_NATIVE"]) or ""
        params["staging_kernel_dir"] = self.runCommand(["getVariable", "STAGING_KERNEL_DIR"]) or ""
        params["tmpdir"] = self.runCommand(["getVariable", "TMPDIR"]) or ""
        return params
