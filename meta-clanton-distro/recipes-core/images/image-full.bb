DESCRIPTION = "A fully functional image to be placed on SD card"

IMAGE_INSTALL = "packagegroup-core-boot ${ROOTFS_PKGMANAGE_BOOTSTRAP} ${CORE_IMAGE_EXTRA_INSTALL}"

IMAGE_LINGUAS = " "

LICENSE = "GPLv2"

IMAGE_FSTYPES = "ext3 live"

inherit core-image

IMAGE_ROOTFS_SIZE = "2048"

#IMAGE_FSTYPES_remove = "cpio.lzma"
NOISO = "1"
NOHDD = "1"
IMAGE_ROOTFS_SIZE = "307200"

EXTRA_IMAGECMD_append_ext2 = " -N 2000"

IMAGE_FEATURES += "package-management"
#ROOTFS_POSTPROCESS_COMMAND += "remove_packaging_data_files ; "

IMAGE_INSTALL += "kernel-modules"
IMAGE_INSTALL += "ethtool"
IMAGE_INSTALL += "strace"
IMAGE_INSTALL += "ppp"
IMAGE_INSTALL += "linuxptp"
IMAGE_INSTALL += "libstdc++"

IMAGE_INSTALL += "python python-modules python-numpy"
IMAGE_INSTALL += "alsa-lib alsa-utils alsa-tools"
IMAGE_INSTALL += "wireless-tools"
IMAGE_INSTALL += "wpa-supplicant"
IMAGE_INSTALL += "openssh"
IMAGE_INSTALL += "nodejs"

IMAGE_INSTALL += "linux-firmware-iwlwifi-6000g2a-6"
IMAGE_INSTALL += "linux-firmware-iwlwifi-135-6"
IMAGE_INSTALL += "bluez4"

# Opencv relies on libav which has a commercial license restriction,
# so we can't just build without adding LICENSE_FLAGS_WHITELIST = "commercial"
# to our local.conf
#IMAGE_INSTALL += "opencv python-opencv"

EXTRA_IMAGEDEPENDS = "grub-conf"
