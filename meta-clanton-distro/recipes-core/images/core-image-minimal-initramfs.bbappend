FILESEXTRAPATHS_prepend := "${THISDIR}/files:"

# modules.conf file is missing
#SRC_URI += "file://modules.conf"

IMAGE_INSTALL = "initramfs-live-boot busybox base-passwd udev"

IMAGE_INSTALL += "kernel-module-usb-storage"
IMAGE_INSTALL += "kernel-module-ehci-hcd kernel-module-ehci-pci kernel-module-ohci-hcd"
IMAGE_INSTALL += "kernel-module-stmmac"

