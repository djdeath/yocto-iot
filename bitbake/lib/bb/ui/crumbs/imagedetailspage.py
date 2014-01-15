#!/usr/bin/env python
#
# BitBake Graphical GTK User Interface
#
# Copyright (C) 2012        Intel Corporation
#
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

import gobject
import gtk
from bb.ui.crumbs.hobcolor import HobColors
from bb.ui.crumbs.hobwidget import hic, HobViewTable, HobAltButton, HobButton
from bb.ui.crumbs.hobpages import HobPage
import subprocess
from bb.ui.crumbs.hig.crumbsdialog import CrumbsDialog
from bb.ui.crumbs.hig.saveimagedialog import SaveImageDialog

#
# ImageDetailsPage
#
class ImageDetailsPage (HobPage):

    class BuildDetailBox (gtk.EventBox):
        def __init__(self, varlist = None, vallist = None, icon = None, color = HobColors.LIGHT_GRAY):
            gtk.EventBox.__init__(self)

            # set color
            style = self.get_style().copy()
            style.bg[gtk.STATE_NORMAL] = self.get_colormap().alloc_color(color, False, False)
            self.set_style(style)

            self.hbox = gtk.HBox()
            self.hbox.set_border_width(10)
            self.add(self.hbox)

            total_rows = 0
            if varlist and vallist:
                # pack the icon and the text on the left
                total_rows += len(varlist)
            self.table = gtk.Table(total_rows, 20, True)
            self.table.set_row_spacings(6)
            self.table.set_size_request(100, -1)
            self.hbox.pack_start(self.table, expand=True, fill=True, padding=15)

            colid = 0
            rowid = 0
            self.line_widgets = {}
            if icon:
                self.table.attach(icon, colid, colid + 2, 0, 1)
                colid = colid + 2
            if varlist and vallist:
                for row in range(rowid, total_rows):
                    index = row - rowid
                    self.line_widgets[varlist[index]] = self.text2label(varlist[index], vallist[index])
                    self.table.attach(self.line_widgets[varlist[index]], colid, 20, row, row + 1)
                
        def update_line_widgets(self, variable, value):
            if len(self.line_widgets) == 0:
                return
            if not isinstance(self.line_widgets[variable], gtk.Label):
                return
            self.line_widgets[variable].set_markup(self.format_line(variable, value))

        def wrap_line(self, inputs):
            # wrap the long text of inputs
            wrap_width_chars = 75
            outputs = ""
            tmps = inputs
            less_chars = len(inputs)
            while (less_chars - wrap_width_chars) > 0:
                less_chars -= wrap_width_chars
                outputs += tmps[:wrap_width_chars] + "\n               "
                tmps = inputs[less_chars:]
            outputs += tmps
            return outputs

        def format_line(self, variable, value):
            wraped_value = self.wrap_line(value)
            markup = "<span weight=\'bold\'>%s</span>" % variable
            markup += "<span weight=\'normal\' foreground=\'#1c1c1c\' font_desc=\'14px\'>%s</span>" % wraped_value
            return markup

        def text2label(self, variable, value):
            # append the name:value to the left box
            # such as "Name: hob-core-minimal-variant-2011-12-15-beagleboard"
            label = gtk.Label()
            label.set_alignment(0.0, 0.5)
            label.set_markup(self.format_line(variable, value))
            return label

    def __init__(self, builder):
        super(ImageDetailsPage, self).__init__(builder, "Image details")

        self.image_store = []
        self.button_ids = {}
        self.details_bottom_buttons = gtk.HBox(False, 6)
        self.image_saved = False
        self.create_visual_elements()
        self.name_field_template = ""
        self.description_field_template = ""

    def create_visual_elements(self):
        # create visual elements
        # create the toolbar
        self.toolbar = gtk.Toolbar()
        self.toolbar.set_orientation(gtk.ORIENTATION_HORIZONTAL)
        self.toolbar.set_style(gtk.TOOLBAR_BOTH)

    def _remove_all_widget(self):
        children = self.get_children() or []
        for child in children:
            self.remove(child)
        children = self.box_group_area.get_children() or []
        for child in children:
            self.box_group_area.remove(child)
        children = self.details_bottom_buttons.get_children() or []
        for child in children:
            self.details_bottom_buttons.remove(child)

    def create_label(self, text):
        label = gtk.Label()
        label.set_use_markup(True)
        label.set_alignment(0.0, 0.5)
        label.set_markup(text)
        return label

    def show_page(self, step):
        self.build_succeeded = (step == self.builder.IMAGE_GENERATED)
        image_addr = self.builder.parameters.image_addr
        image_names = self.builder.parameters.image_names
        if self.build_succeeded:
            machine = self.builder.configuration.curr_mach
            base_image = self.builder.recipe_model.get_selected_image()
            pkg_num = "%s" % len(self.builder.package_model.get_selected_packages())
            log_file = self.builder.current_logfile
        else:
            pkg_num = "N/A"
            log_file = None

        # remove
        for button_id, button in self.button_ids.items():
            button.disconnect(button_id)
        self._remove_all_widget()

        # repack
        self.pack_start(self.group_align, expand=True, fill=True)

        self.build_result = None
        if self.image_saved or (self.build_succeeded and self.builder.current_step == self.builder.IMAGE_GENERATING):
            # building is the previous step
            icon = gtk.Image()
            pixmap_path = hic.ICON_INDI_CONFIRM_FILE
            color = HobColors.RUNNING
            pix_buffer = gtk.gdk.pixbuf_new_from_file(pixmap_path)
            icon.set_from_pixbuf(pix_buffer)
            varlist = [""]
            if self.image_saved:
                vallist = ["Your image recipe has been saved"]
            else:
                vallist = ["Your image is ready"]
            self.build_result = self.BuildDetailBox(varlist=varlist, vallist=vallist, icon=icon, color=color)
            self.box_group_area.pack_start(self.build_result, expand=False, fill=False)

        self.buttonlist = ["New image", "Edit packages", "Deploy image"]

        # Name
        self.image_store = []
        self.toggled_image = ""
        default_image_size = 0
        self.num_toggled = 0
        i = 0
        for image_name in image_names:
            image_size = HobPage._size_to_string(os.stat(os.path.join(image_addr, image_name)).st_size)

            image_attr = ("run" if (self.test_type_runnable(image_name) and self.test_mach_runnable(image_name)) else \
                          ("deploy" if self.test_deployable(image_name) else ""))
            is_toggled = (image_attr != "")

            if not self.toggled_image:
                if i == (len(image_names) - 1):
                    is_toggled = True
                if is_toggled:
                    default_image_size = image_size
                    self.toggled_image = image_name

            split_stuff = image_name.split('.')
            if "rootfs" in split_stuff:
                image_type = image_name[(len(split_stuff[0]) + len(".rootfs") + 1):]
            else:
                image_type = image_name[(len(split_stuff[0]) + 1):]

            self.image_store.append({'name': image_name,
                                    'type': image_type,
                                    'size': image_size,
                                    'is_toggled': is_toggled,
                                    'action_attr': image_attr,})

            i = i + 1
            self.num_toggled += is_toggled

        is_runnable = self.create_bottom_buttons(self.buttonlist, self.toggled_image)

        label = self.create_label("<span weight='bold' font_desc='15'>Image information</span>")
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span weight='bold' font_desc='12'>Image</span>")
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span font_desc='12'>%s</span>" % image_name)
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span weight='bold' font_desc='12'>Distro</span>")
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span weight='bold' font_desc='12'>Packages included</span>")
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span font_desc='12'>%s</span>" % pkg_num)
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span weight='bold' font_desc='12'>Root file system files</span>")
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span font_desc='12'>" + image_name + " (" + default_image_size + ")</span>")
        self.box_group_area.pack_start(label, expand=False, fill=True)

        label = self.create_label("<span font_desc='12'>Root file system files are stored in\t%s</span>" % image_addr)
        self.box_group_area.pack_start(label, expand=False, fill=True)

        self.box_group_area.pack_end(self.details_bottom_buttons, expand=False, fill=False)

        self.show_all()
        if self.kernel_detail and (not is_runnable):
            self.kernel_detail.hide()
        self.image_saved = False

    def refresh_package_detail_box(self, image_size):
        self.package_detail.update_line_widgets("Total image size: ", image_size)

    def test_type_runnable(self, image_name):
        type_runnable = False
        for t in self.builder.parameters.runnable_image_types:
            if image_name.endswith(t):
                type_runnable = True
                break
        return type_runnable

    def test_mach_runnable(self, image_name):
        mach_runnable = False
        for t in self.builder.parameters.runnable_machine_patterns:
            if t in image_name:
                mach_runnable = True
                break
        return mach_runnable

    def test_deployable(self, image_name):
        if self.builder.configuration.curr_mach.startswith("qemu"):
            return False
        deployable = False
        for t in self.builder.parameters.deployable_image_types:
            if image_name.endswith(t):
                deployable = True
                break
        return deployable

    def get_kernel_file_name(self, kernel_addr=""):
        kernel_name = ""

        if not kernel_addr:
            kernel_addr = self.builder.parameters.image_addr

        files = [f for f in os.listdir(kernel_addr) if f[0] <> '.']
        for check_file in files:
            if check_file.endswith(".bin"):
                name_splits = check_file.split(".")[0]
                if self.builder.parameters.kernel_image_type in name_splits.split("-"):
                    kernel_name = check_file
                    break

        return kernel_name

    def show_builded_images_dialog(self, widget, primary_action=""):
        title = primary_action if primary_action else "Your builded images"
        dialog = CrumbsDialog(title, self.builder,
                              gtk.DIALOG_MODAL | gtk.DIALOG_DESTROY_WITH_PARENT)
        dialog.set_border_width(12)

        label = gtk.Label()
        label.set_use_markup(True)
        label.set_alignment(0.0, 0.5)
        label.set_padding(12,0)
        if primary_action == "Run image":
            label.set_markup("<span font_desc='12'>Select the image file you want to run:</span>")
        elif primary_action == "Deploy image":
            label.set_markup("<span font_desc='12'>Select the image file you want to deploy:</span>")
        else:
            label.set_markup("<span font_desc='12'>Select the image file you want to %s</span>" % primary_action)
        dialog.vbox.pack_start(label, expand=False, fill=False)

        # filter created images as action attribution (deploy or run)
        action_attr = ""
        action_images = []
        for fileitem in self.image_store:
            action_attr = fileitem['action_attr']
            if  (action_attr == 'run' and primary_action == "Run image") \
             or (action_attr == 'deploy' and primary_action == "Deploy image"):
                action_images.append(fileitem)

        # pack the corresponding 'runnable' or 'deploy' radio_buttons, if there has no more than one file.
        # assume that there does not both have 'deploy' and 'runnable' files in the same building result
        # in possible as design.
        curr_row = 0
        rows = (len(action_images)) if len(action_images) < 10 else 10
        table = gtk.Table(rows, 10, True)
        table.set_row_spacings(6)
        table.set_col_spacing(0, 12)
        table.set_col_spacing(5, 12)

        sel_parent_btn = None
        for fileitem in action_images:
            sel_btn = gtk.RadioButton(sel_parent_btn, fileitem['type'])
            sel_parent_btn = sel_btn if not sel_parent_btn else sel_parent_btn
            sel_btn.set_active(fileitem['is_toggled'])
            sel_btn.connect('toggled', self.table_selected_cb, fileitem)
            if curr_row < 10:
                table.attach(sel_btn, 0, 4, curr_row, curr_row + 1, xpadding=24)
            else:
                table.attach(sel_btn, 5, 9, curr_row - 10, curr_row - 9, xpadding=24)
            curr_row += 1

        dialog.vbox.pack_start(table, expand=False, fill=False, padding=6)

        button = dialog.add_button("Cancel", gtk.RESPONSE_CANCEL)
        HobAltButton.style_button(button)

        if primary_action:
            button = dialog.add_button(primary_action, gtk.RESPONSE_YES)
            HobButton.style_button(button)

        dialog.show_all()

        response = dialog.run()
        dialog.destroy()

        if response != gtk.RESPONSE_YES:
            return

        for fileitem in self.image_store:
            if fileitem['is_toggled']:
                if fileitem['action_attr'] == 'run':
                    self.builder.runqemu_image(fileitem['name'], self.sel_kernel)
                elif fileitem['action_attr'] == 'deploy':
                    self.builder.deploy_image(fileitem['name'])

    def table_selected_cb(self, tbutton, image):
        image['is_toggled'] = tbutton.get_active()
        if image['is_toggled']:
            self.toggled_image = image['name']

    def change_kernel_cb(self, widget):
        kernel_path = self.builder.show_load_kernel_dialog()
        if kernel_path and self.kernel_detail:
            import os.path
            self.sel_kernel = os.path.basename(kernel_path)
            markup = self.kernel_detail.format_line("Kernel: ", self.sel_kernel)
            label = ((self.kernel_detail.get_children()[0]).get_children()[0]).get_children()[0]
            label.set_markup(markup)

    def create_bottom_buttons(self, buttonlist, image_name):
        # Create the buttons at the bottom
        created = False
        packed = False
        self.button_ids = {}
        is_runnable = False

        # create button "Deploy image"
        name = "Deploy image"
        if name in buttonlist:  # and self.test_deployable(image_name):
            deploy_button = HobButton('Deploy image')
            deploy_button.set_tooltip_text("Burn a live image to a USB drive or flash memory")
            deploy_button.set_flags(gtk.CAN_DEFAULT)
            button_id = deploy_button.connect("clicked", self.deploy_button_clicked_cb)
            self.button_ids[button_id] = deploy_button
            self.details_bottom_buttons.pack_end(deploy_button, expand=False, fill=False)
            created = True
            packed = True

        name = "Edit packages"
        if name in buttonlist:
            # create button "Edit packages"
            edit_packages_button = HobAltButton("Edit packages")
            edit_packages_button.set_tooltip_text("Edit the packages included in your image")
            edit_packages_button.connect("clicked", self.edit_packages_button_clicked_cb)

            self.details_bottom_buttons.pack_end(edit_packages_button, expand=False, fill=False)
            button_id = edit_packages_button.connect("clicked", self.edit_packages_button_clicked_cb)
            self.button_ids[button_id] = edit_packages_button

        name = "New image"
        if name in buttonlist:
            # create button "Build new image"
            if packed:
                build_new_button = HobAltButton("New image")
            else:
                build_new_button = HobButton("New image")
                build_new_button.set_flags(gtk.CAN_DEFAULT)
            self.details_bottom_buttons.pack_end(build_new_button, expand=False, fill=False)
            build_new_button.set_tooltip_text("Create a new image from scratch")
            button_id = build_new_button.connect("clicked", self.build_new_button_clicked_cb)
            self.button_ids[button_id] = build_new_button

        return is_runnable

    def deploy_button_clicked_cb(self, button):
        if self.toggled_image:
            if self.num_toggled > 1:
                self.set_sensitive(False)
                self.show_builded_images_dialog(None, "Deploy image")
                self.set_sensitive(True)
            else:
                self.builder.deploy_image(self.toggled_image)

    def build_new_button_clicked_cb(self, button):
        self.builder.initiate_new_build_async()

    def edit_packages_button_clicked_cb(self, button):
        self.builder.show_packages(ask=False)

