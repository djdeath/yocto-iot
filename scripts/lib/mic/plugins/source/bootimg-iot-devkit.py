# ex:ts=4:sw=4:sts=4:et
# -*- tab-width: 4; c-basic-offset: 4; indent-tabs-mode: nil -*-
#
# Copyright (c) 2014, Intel Corporation.
# All rights reserved.
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
#
# DESCRIPTION
# This implements the 'bootimg-iot-devkit' source plugin class for 'wic'
#
# AUTHORS
# Tom Zanussi <tom.zanussi (at] linux.intel.com>
#

import os
import shutil
import re
import tempfile

from mic import chroot, msger
from mic.utils import misc, fs_related, errors, runner, cmdln
from mic.conf import configmgr
from mic.plugin import pluginmgr
from mic.utils.partitionedfs import PartitionedMount
import mic.imager.direct as direct
from mic.pluginbase import SourcePlugin
from mic.utils.oe.misc import *

class IOTDevkitPlugin(SourcePlugin):
    name = 'iot-devkit'

    @classmethod
    def do_stage_partition(self, part, cr, workdir, oe_builddir, bootimg_dir,
                           kernel_dir, native_sysroot):
        """
        Special content staging hook called before do_prepare_partition(),
        normally empty.

        For the iot-devkit, we need to stage just the boot/ dir in the
        deploy dir.
        """
        bootimg_dir = get_bitbake_var("DEPLOY_DIR_IMAGE")
        if not bootimg_dir:
            msger.error("Couldn't find DEPLOY_DIR_IMAGE, exiting\n")

        # just so the result notes display it
        cr.set_bootimg_dir(bootimg_dir)

        hdddir = "%s/hdd/boot" % workdir
        boot_dir = "%s/boot" % bootimg_dir
        rm_cmd = "rm -rf %s" % workdir
        exec_cmd(rm_cmd)

        msger.debug("Copying %s to %s" % (boot_dir, hdddir))
        shutil.copytree(bootimg_dir+"/boot/", hdddir)

    @classmethod
    def do_prepare_partition(self, part, cr, cr_workdir, oe_builddir, bootimg_dir,
                             kernel_dir, native_sysroot):
        """
        Called to do the actual content population for a partition i.e. it
        'prepares' the partition to be incorporated into the image.
        In this case, prepare content for the special iot-devkit boot
        partition.
        """
        staging_kernel_dir = kernel_dir
        staging_data_dir = bootimg_dir

        hdddir = "%s/hdd" % cr_workdir

        install_cmd = "install -m 0644 %s/bzImage %s/bzImage" % \
            (staging_kernel_dir, hdddir)
        tmp = exec_cmd(install_cmd)

        du_cmd = "du -bks %s" % hdddir
        rc, out = exec_cmd(du_cmd)
        blocks = int(out.split()[0])

        blocks += BOOTDD_EXTRA_SPACE

        # Ensure total sectors is an integral number of sectors per
        # track or mcopy will complain. Sectors are 512 bytes, and we
        # generate images with 32 sectors per track. This calculation is
        # done in blocks, thus the mod by 16 instead of 32.
        blocks += (16 - (blocks % 16))

        # dosfs image, created by mkdosfs
        bootimg = "%s/boot.img" % cr_workdir

        dosfs_cmd = "mkdosfs -C %s %d" % (bootimg, blocks)
        exec_native_cmd(dosfs_cmd, native_sysroot)

        mcopy_cmd = "mcopy -i %s -s %s/* ::/" % (bootimg, hdddir)
        exec_native_cmd(mcopy_cmd, native_sysroot)

        chmod_cmd = "chmod 644 %s" % bootimg
        exec_cmd(chmod_cmd)

        du_cmd = "du -Lbms %s" % bootimg
        rc, out = exec_cmd(du_cmd)
        bootimg_size = out.split()[0]

        part.set_size(bootimg_size)
        part.set_source_file(bootimg)
