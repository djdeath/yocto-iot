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

import gtk
import glib
import re
from bb.ui.crumbs.progressbar import HobProgressBar
from bb.ui.crumbs.hobcolor import HobColors
from bb.ui.crumbs.hobwidget import hic, HobImageButton, HobInfoButton, HobAltButton, HobButton
from bb.ui.crumbs.hoblistmodel import RecipeListModel
from bb.ui.crumbs.hobpages import HobPage
from bb.ui.crumbs.hig.retrieveimagedialog import RetrieveImageDialog

#
# ImageConfigurationPage
#
class ImageConfigurationPage (HobPage):

    def __init__(self, builder):
        super(ImageConfigurationPage, self).__init__(builder, "Image configuration")

        self.image_combo_id = None
        self.custom_image_selected = None
        self.create_visual_elements()

    def create_visual_elements(self):
        # create visual elements
        self.gtable = gtk.Table(40, 40, True)
        self.create_config_machine()
        self.create_config_baseimg()
        self.config_build_button = self.create_config_build_button()

    def _remove_all_widget(self):
        children = self.gtable.get_children() or []
        for child in children:
            self.gtable.remove(child)
        children = self.box_group_area.get_children() or []
        for child in children:
            self.box_group_area.remove(child)
        children = self.get_children() or []
        for child in children:
            self.remove(child)

    def _pack_components(self, pack_config_build_button = False):
        self._remove_all_widget()
        self.pack_start(self.group_align, expand=True, fill=True)

        self.box_group_area.pack_start(self.gtable, expand=True, fill=True)
        if pack_config_build_button:
            self.box_group_area.pack_end(self.config_build_button, expand=False, fill=False)
        else:
            box = gtk.HBox(False, 6)
            box.show()
            subbox = gtk.HBox(False, 0)
            subbox.set_size_request(205, 49)
            subbox.show()
            box.add(subbox)
            self.box_group_area.pack_end(box, False, False)

    def update_progress_bar(self, title, fraction, status=None):
        self.progress_bar.update(fraction)
        self.progress_bar.set_text(title)
        self.progress_bar.set_rcstyle(status)

    def show_info_populating(self):
        self._pack_components(pack_config_build_button = False)
        self.set_config_distro_layout(show_progress_bar = True)
        self.show_all()

    def show_info_populated(self):
        self.progress_bar.reset()
        self._pack_components(pack_config_build_button = True)
        self.set_config_distro_layout(show_progress_bar = False)
        self.set_config_baseimg_layout()
        self.show_all()

    def show_baseimg_selected(self):
        self.progress_bar.reset()
        self._pack_components(pack_config_build_button = True)
        self.set_config_distro_layout(show_progress_bar = False)
        self.set_config_baseimg_layout()
        self.show_all()

    def create_config_machine(self):
        self.progress_bar = HobProgressBar()

    def set_config_distro_layout(self, show_progress_bar = False):
        if show_progress_bar:
            self.gtable.attach(self.progress_bar, 0, 40, 12, 15)

    def create_config_baseimg(self):
        self.image_title = gtk.Label()
        self.image_title.set_alignment(0, 0)
        mark = "<span %s>Select an image to build</span>" % self.span_tag('x-large', 'bold')
        self.image_title.set_markup(mark)

        self.image_combo = gtk.combo_box_new_text()
        self.image_combo.set_row_separator_func(self.combo_separator_func, None)
        self.image_combo.set_tooltip_text("Select an image to see a description of it")
        self.image_combo_id = self.image_combo.connect("changed", self.image_combo_changed_cb)

        self.image_desc = gtk.Label()
        self.image_desc.set_alignment(0, 0)
        self.image_desc.set_justify(gtk.JUSTIFY_LEFT)
        self.image_desc.set_line_wrap(True)

        self.toolchain_checkbox = gtk.CheckButton("Build a matching toolchain")
        self.toolchain_checkbox.set_active(self.builder.configuration.toolchain_build)
        tooltip = "Check this box to generate a toolchain installer "
        tooltip += "that contains a sysroot for your selected image"
        self.toolchain_checkbox.set_tooltip_text(tooltip)

    def combo_separator_func(self, model, iter, user_data):
        name = model.get_value(iter, 0)
        if name == "--Separator--":
            return True

    def set_config_baseimg_layout(self):
        self.gtable.attach(self.image_title, 0, 40, 8, 11)
        self.gtable.attach(self.image_combo, 0, 20, 12, 15)
        self.gtable.attach(self.image_desc, 0, 40, 16, 20)
        self.gtable.attach(self.toolchain_checkbox, 0, 40, 21, 24)

    def create_config_build_button(self):
        # Create the "Build packages" and "Build image" buttons at the bottom
        button_box = gtk.HBox(False, 6)

        # create button "Build image"
        self.just_bake_button = HobButton("Build image")
        tooltip = "Build your selected image"
        self.just_bake_button.set_tooltip_text(tooltip)
        self.just_bake_button.connect("clicked", self.just_bake_button_clicked_cb)
        button_box.pack_end(self.just_bake_button, expand=False, fill=False)

        # create button "Edit packages"
        self.edit_image_button = HobAltButton("Edit packages")
        tooltip = "Customize the list of packages to be included in your image"
        self.edit_image_button.set_tooltip_text(tooltip)
        self.edit_image_button.connect("clicked", self.edit_image_button_clicked_cb)
        button_box.pack_end(self.edit_image_button, expand=False, fill=False)

        return button_box

    def update_image_desc(self):
        desc = ""
        selected_image = self.image_combo.get_active_text()
        if selected_image and selected_image in self.builder.recipe_model.pn_path.keys():
            image_path = self.builder.recipe_model.pn_path[selected_image]
            image_iter = self.builder.recipe_model.get_iter(image_path)
            desc = self.builder.recipe_model.get_value(image_iter, self.builder.recipe_model.COL_DESC)

        mark = ("<span %s>%s</span>\n") % (self.span_tag('small'), desc)
        self.image_desc.set_markup(mark)

    def image_combo_changed_idle_cb(self, selected_image, selected_recipes, selected_packages):
        self.builder.update_recipe_model(selected_image, selected_recipes)
        self.builder.update_package_model(selected_packages)
        self.builder.window_sensitive(True)

    def image_combo_changed_cb(self, combo):
        self.builder.window_sensitive(False)
        selected_image = self.image_combo.get_active_text()
        if selected_image:
            self.builder.customized = False

            selected_recipes = []

            image_path = self.builder.recipe_model.pn_path[selected_image]
            image_iter = self.builder.recipe_model.get_iter(image_path)
            selected_packages = self.builder.recipe_model.get_value(image_iter, self.builder.recipe_model.COL_INSTALL).split()
            self.update_image_desc()

            self.builder.recipe_model.reset()
            self.builder.package_model.reset()

            self.show_baseimg_selected()

            glib.idle_add(self.image_combo_changed_idle_cb, selected_image, selected_recipes, selected_packages)

    def _image_combo_connect_signal(self):
        if not self.image_combo_id:
            self.image_combo_id = self.image_combo.connect("changed", self.image_combo_changed_cb)

    def _image_combo_disconnect_signal(self):
        if self.image_combo_id:
            self.image_combo.disconnect(self.image_combo_id)
            self.image_combo_id = None

    def update_image_combo(self, selected_image):
        model = self.image_combo.get_model()
        model.clear()

        active = 0
        cnt = 0
        for image_name in self.builder.parameters.image_list.keys():
            self.image_combo.append_text(image_name)
            if image_name == selected_image:
                active = cnt
            cnt = cnt + 1
        self.image_combo.set_active(active)

    def update_conf(self):
        self.builder.configuration.toolchain_build = self.toolchain_checkbox.get_active()

    def just_bake_button_clicked_cb(self, button):
        self.update_conf()
        self.builder.build_image()

    def edit_image_button_clicked_cb(self, button):
        self.update_conf()
        self.builder.configuration.initial_selected_image = self.builder.configuration.selected_image
        self.builder.show_packages(ask=False)

