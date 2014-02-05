module_autoload_iwlwifi = "iwlwifi"
module_autoload_btusb = "btusb"

# find defconfig path
FILESEXTRAPATHS := "${THISDIR}/${PN}"

SRC_URI += "file://devkitcamera.cfg"
