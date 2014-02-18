#
# BitBake Graphical GTK User Interface
#
# Copyright (C) 2011-2012   Intel Corporation
#
# Authored by Joshua Lock <josh@linux.intel.com>
# Authored by Dongxiao Xu <dongxiao.xu@intel.com>
# Authored by Shane Wang <shane.wang@intel.com>
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

import glob
import gtk
import gobject
import os
import re
import shlex
import subprocess
import tempfile
import time
from bb.ui.crumbs.hobwidget import hic, HobButton
from bb.ui.crumbs.progressbar import HobProgressBar
import bb.ui.crumbs.utils
import bb.process
from bb.ui.crumbs.hig.crumbsdialog import CrumbsDialog
from bb.ui.crumbs.hig.crumbsmessagedialog import CrumbsMessageDialog
from bb.ui.crumbs.hobwidget import HobAltButton
from bb.ui.crumbs.hobwidget import HobIconChecker
import glib

"""
The following are convenience classes for implementing GNOME HIG compliant
BitBake GUI's
In summary: spacing = 12px, border-width = 6px
"""

class DeployImageDialog (CrumbsDialog):

    __dummy_usb__ = "--select a usb drive--"

    def __init__(self, builder, title, image, parent, flags, buttons=None, standalone=False):
        super(DeployImageDialog, self).__init__(title, parent, flags, buttons)

        self.image = image.split("-clanton-")[0]
        self.builder = builder
        self.standalone = standalone

        self.devices = self.find_all_external_devices()
        self.create_visual_elements()
        self.connect("response", self.response_cb)

    def create_visual_elements(self):
        if not self.devices:
            self.set_size_request(400, 200)
            first_column = gtk.HBox(spacing=6)
            first_column.set_property("border-width", 6)
            first_column.show()
            self.vbox.add(first_column)
            icon = gtk.Image()
            icon_chk = HobIconChecker()
            icon.set_from_stock(icon_chk.check_stock_icon(gtk.STOCK_DIALOG_WARNING), gtk.ICON_SIZE_DIALOG)
            icon.set_property("xalign", 0.00)
            first_column.pack_start(icon, expand=False, fill=True, padding=0)

            label = gtk.Label()
            label.set_use_markup(True)
            label.set_line_wrap(True)
            label.set_markup("<span font_desc='17' weight=\'bold\'>No external storage\ndevice found</span>")
            label.set_property("xalign", 0.00)
            first_column.add(label)

            label = gtk.Label()
            label.set_use_markup(True)
            label.set_line_wrap(True)
            label.set_markup("<span font_desc='12'>Insert an SD card or USB drive before\ndeploying your image</span>")
            label.set_property("yalign", 0.00)
            self.vbox.add(label)

            button = self.add_button("OK", gtk.RESPONSE_CANCEL)
            HobAltButton.style_button(button)

        else:
            self.set_size_request(350, 300)
            label = gtk.Label()
            label.set_alignment(0.0, 0.5)
            markup = "<span font_desc='17' weight=\'bold\'>External storage device</span>"
            label.set_markup(markup)
            self.vbox.pack_start(label, expand=False, fill=False, padding=2)

            self.device_vendor = gtk.Label()
            self.device_vendor.set_alignment(0.0, 0.5)
            vendor = self.get_vendor_info(self.devices[0])
            if vendor is None:
                vendor = "Not known"
            markup = "<span font_desc='12'>Vendor: %s</span>" % vendor
            self.device_vendor.set_markup(markup)

            self.device_model = gtk.Label()
            self.device_model.set_alignment(0.0, 0.5)
            model = self.get_model_info(self.devices[0])
            if model is None:
                model = "Not known"
            markup = "<span font_desc='12'>Model: %s</span>" % model
            self.device_model.set_markup(markup)

            self.device_size = gtk.Label()
            self.device_size.set_alignment(0.0, 0.5)
            size = float(self.get_size_info(self.devices[0])) * 512 / 1024 / 1024
            if size > 1024:
                size = size/1024
                markup = "<span font_desc='12'>Size: %.2f GB</span>" % size
            else:
                markup = "<span font_desc='12'>Size: %.2f MB</span>" % size
            self.device_size.set_markup(markup)

            if len(self.devices) == 1:
                label = gtk.Label()
                label.set_alignment(0.0, 0.5)
                markup = "<span font_desc='12'>/dev/%s</span>" % self.devices[0]
                label.set_markup(markup)
                self.vbox.pack_start(label, expand=False, fill=False, padding=2)
            else:
                self.usb_combo = gtk.combo_box_new_text()
                self.usb_combo.connect("changed", self.usb_combo_changed_cb)
                model = self.usb_combo.get_model()
                model.clear()
                for usb in self.devices:
                    self.usb_combo.append_text("/dev/" + usb)
                self.usb_combo.set_active(0)
                self.vbox.pack_start(self.usb_combo, expand=False, fill=False)

            label = gtk.Label()
            label.set_alignment(0.0, 0.5)
            markup = "<span font_desc='17' weight=\'bold\'>Device details</span>"
            label.set_markup(markup)
            self.vbox.pack_start(label, expand=False, fill=False, padding=2)

            self.vbox.pack_start(self.device_vendor, expand=False, fill=False, padding=2)
            self.vbox.pack_start(self.device_model, expand=False, fill=False, padding=2)
            self.vbox.pack_start(self.device_size, expand=False, fill=False, padding=2)

            button = self.add_button("Cancel", gtk.RESPONSE_NO)
            HobAltButton.style_button(button)
            button = self.add_button("Deploy image", gtk.RESPONSE_YES)
            tooltip = "Burn your image to an external storage device"
            button.set_tooltip_text(tooltip)
            HobButton.style_button(button)

        self.progress_bar = HobProgressBar()
        self.vbox.pack_start(self.progress_bar, expand=False, fill=False)

        self.vbox.show_all()
        self.progress_bar.hide()

    def popen_read(self, cmd):
        tmpout, errors = bb.process.run("%s" % cmd)
        return tmpout.strip()

    def find_all_external_devices(self):
        devices = glob.glob('/dev/disk/by-id/usb*')
        devices.extend(glob.glob('/dev/disk/by-id/mmc*'))
        ext_devs = [ os.readlink(u)
            for u in devices
            if not re.search(r'part\d+', u) ]
        return [ '%s' % u[u.rfind('/')+1:] for u in ext_devs ]

    def get_vendor_info(self, dev):
        try:
            return "%s" % self.popen_read('/sys/class/block/%s/device/vendor' % dev)
        except bb.process.ExecutionError:
            return ''

    def get_model_info(self, dev):
        try:
            return "%s" % self.popen_read('cat /sys/class/block/%s/device/model' % dev)
        except bb.process.ExecutionError:
            try:
                return "%s" % self.popen_read('cat /sys/class/block/%s/device/name' % dev)
            except bb.process.ExecutionError:
                return ''

    def get_size_info(self, dev):
        return "%s" % self.popen_read('cat /sys/class/block/%s/size' % dev)

    def select_image_button_clicked_cb(self, button):
        self.emit('select_image_clicked')

    def usb_combo_changed_cb(self, usb_combo):
        combo_item = self.usb_combo.get_active_text()
        vendor = self.get_vendor_info(combo_item.lstrip("/dev/"))
        if vendor is None:
            vendor = "Not known"
        markup = "<span font_desc='12'>Vendor: %s</span>" % vendor
        self.device_vendor.set_markup(markup)
        model = self.get_model_info(combo_item.lstrip("/dev/"))
        if model is None:
            model = "Not known"
        markup = "<span font_desc='12'>Model: %s</span>" % model
        self.device_model.set_markup(markup)
        size = float(self.get_size_info(combo_item.lstrip("/dev/"))) * 512 / 1024 / 1024
        if size > 1024:
            size = size/1024
            markup = "<span font_desc='12'>Size: %.2f GB</span>" % size
        else:
            markup = "<span font_desc='12'>Size: %.2f MB</span>" % size
        self.device_size.set_markup(markup)

    def response_cb(self, dialog, response_id):
        if response_id == gtk.RESPONSE_YES:
            lbl = ''
            dialogtype = gtk.STOCK_DIALOG_INFO
            if len(self.devices) == 1:
                item = "/dev/" + str(self.devices[0])
            else:
                item = self.usb_combo.get_active_text()
            if item and self.image:
                cmdline = bb.ui.crumbs.utils.which_terminal()

                f = tempfile.NamedTemporaryFile(delete=False)
                resultfn = f.name
                f.close()

                logpath = os.path.join(self.builder.parameters.tmpdir, 'log', 'hob-iot')
                bb.utils.mkdirhier(logpath)
                logfn = os.path.join(logpath, 'deploy-%s-%d.log' % (os.path.basename(item), int(time.time())))

                outimage = ''

                if cmdline:
                    cmdline += "\"source " + self.builder.parameters.core_base +"/iot-devkit-init-build-env " + \
                                self.builder.parameters.build_dir + \
                                " && { printf '\nCreating an image suitable for the device using wic:\n'" + \
                                " ; export PYTHONUNBUFFERED=1 " + \
                                " ; wic create iot-devkit " + \
                                " -r " + self.builder.parameters.tmpdir + "/work/clanton-poky-linux/" + self.image + "/1.0-r0/rootfs" + \
                                " -k " + self.builder.parameters.staging_kernel_dir + \
                                " -n " + self.builder.parameters.staging_dir_native + \
                                " -b " + self.builder.parameters.image_addr + \
                                " 2>&1 ; echo $? > " + resultfn + " ; } | tee " + logfn + "\""

                    dialog.window.set_cursor(gtk.gdk.Cursor(gtk.gdk.WATCH))
                    bb.ui.crumbs.utils.wait(0.1)
                    subprocess.call(shlex.split(cmdline))

                    with open(logfn, 'r') as f:
                        output = f.read()

                    with open(resultfn, 'r') as f:
                        result = f.readline().strip()
                        if result != '0':
                            lbl = "<b>Failed to create final image to deploy:</b>\n\n%s" % glib.markup_escape_text(output)
                            dialogtype = gtk.STOCK_DIALOG_ERROR
                        else:
                            for line in output.splitlines():
                                if '.direct' in line:
                                    outimage = line.strip()
                                    break

                    with open(logfn, 'a') as f:
                        f.write('\n\nwic command was:\n%s\n' % cmdline)

                    if not outimage:
                        lbl = "<b>Unable to determine output image from wic output:</b>\n\n%s" % glib.markup_escape_text(output)
                        dialogtype = gtk.STOCK_DIALOG_ERROR
                else:
                    lbl = "<b>Failed to find terminal to run</b>"
                    dialogtype = gtk.STOCK_DIALOG_ERROR

                if not lbl:
                    cmdline = bb.ui.crumbs.utils.which_terminal()
                    if cmdline:
                        tmpfile = tempfile.NamedTemporaryFile()
                        cmdline += "\"printf 'Writing final image:\n  " + outimage + "\nto storage device:\n  " + item + \
                                    "\n\n(This requires elevated privileges - you may be prompted for your password.)\n\n'" + \
                                    " ; sudo dd if=" + outimage + " of=" + item + "; echo $? > " + tmpfile.name + "\""
                        subprocess.call(shlex.split(cmdline))
                        dialog.window.set_cursor(None)

                        result = tmpfile.readline().strip()

                        if result == '0':
                            lbl = "<b>Image deployed to external storage device</b>"
                        elif not result:
                            lbl = "<b>Image writing cancelled</b>"
                            dialogtype = gtk.STOCK_DIALOG_WARNING
                        else:
                            lbl = "<b>Failed to deploy image.</b>\nPlease check image <b>%s</b> exists and storage device <b>%s</b> is writable." % (self.image, item)
                            dialogtype = gtk.STOCK_DIALOG_ERROR
                        tmpfile.close()
            if len(lbl):
                crumbs_dialog = CrumbsMessageDialog(self, lbl, dialogtype)
                button = crumbs_dialog.add_button("Close", gtk.RESPONSE_OK)
                HobButton.style_button(button)
                crumbs_dialog.run()
                crumbs_dialog.destroy()

    def update_progress_bar(self, title, fraction, status=None):
        self.progress_bar.update(fraction)
        self.progress_bar.set_title(title)
        self.progress_bar.set_rcstyle(status)

    def write_file(self, ifile, ofile):
        self.progress_bar.reset()
        self.progress_bar.show()

        f_from = os.open(ifile, os.O_RDONLY)
        f_to = os.open(ofile, os.O_WRONLY)

        total_size = os.stat(ifile).st_size
        written_size = 0

        while True:
            buf = os.read(f_from, 1024*1024)
            if not buf:
                break
            os.write(f_to, buf)
            written_size += 1024*1024
            self.update_progress_bar("Writing to usb:", written_size * 1.0/total_size)

        self.update_progress_bar("Writing completed:", 1.0)
        os.close(f_from)
        os.close(f_to)
        self.progress_bar.hide()
