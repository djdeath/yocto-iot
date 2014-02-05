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
from bb.ui.crumbs.hobwidget import hic, HobButton
from bb.ui.crumbs.progressbar import HobProgressBar
import bb.ui.crumbs.utils
import bb.process
from bb.ui.crumbs.hig.crumbsdialog import CrumbsDialog
from bb.ui.crumbs.hig.crumbsmessagedialog import CrumbsMessageDialog
from bb.ui.crumbs.hobwidget import HobAltButton
from bb.ui.crumbs.hobwidget import HobIconChecker

"""
The following are convenience classes for implementing GNOME HIG compliant
BitBake GUI's
In summary: spacing = 12px, border-width = 6px
"""

class DeployImageDialog (CrumbsDialog):

    __dummy_usb__ = "--select a usb drive--"

    def __init__(self, title, image_path, parent, flags, buttons=None, standalone=False):
        super(DeployImageDialog, self).__init__(title, parent, flags, buttons)

        self.image_path = image_path
        self.standalone = standalone

        self.devices = self.find_all_usb_devices()
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

    def set_image_text_buffer(self, image_path):
        self.buf.set_text(image_path)

    def set_image_path(self, image_path):
        self.image_path = image_path

    def popen_read(self, cmd):
        tmpout, errors = bb.process.run("%s" % cmd)
        return tmpout.strip()

    def find_all_usb_devices(self):
        usb_devs = [ os.readlink(u)
            for u in glob.glob('/dev/disk/by-id/usb*')
            if not re.search(r'part\d+', u) ]
        return [ '%s' % u[u.rfind('/')+1:] for u in usb_devs ]

    def get_vendor_info(self, dev):
        return "%s" % self.popen_read('cat /sys/class/block/%s/device/vendor' % dev)

    def get_model_info(self, dev):
        return "%s" % self.popen_read('cat /sys/class/block/%s/device/model' % dev)

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
            if len(self.devices) == 1:
                item = "/dev/" + str(self.devices[0])
            else:
                item = self.usb_combo.get_active_text()
            if item and self.image_path:
                cmdline = bb.ui.crumbs.utils.which_terminal()
                if cmdline:
                    tmpfile = tempfile.NamedTemporaryFile()
                    cmdline += "\"sudo dd if=" + self.image_path + \
                                " of=" + item + "; echo $? > " + tmpfile.name + "\""
                    subprocess.call(shlex.split(cmdline))

                    if int(tmpfile.readline().strip()) == 0:
                        lbl = "<b>Image deployed to external storage device</b>"
                    else:
                        lbl = "<b>Failed to deploy image.</b>\nPlease check image <b>%s</b> exists and USB device <b>%s</b> is writable." % (self.image_path, item)
                    tmpfile.close()
            else:
                if not self.image_path:
                    lbl = "<b>No selection made.</b>\nYou have not selected an image to deploy."
                else:
                    lbl = "<b>No selection made.</b>\nYou have not selected a USB device."
            if len(lbl):
                crumbs_dialog = CrumbsMessageDialog(self, lbl, gtk.STOCK_DIALOG_INFO)
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
