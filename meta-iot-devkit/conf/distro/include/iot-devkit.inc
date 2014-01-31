SANITY_TESTED_DISTROS = " \
            Poky-1.5 \n \
            Ubuntu-12.04 \n \
            Ubuntu-13.10 \n \
            Fedora-19 \n \
            Debian-7.0 \n \
            Debian-7.1 \n \
            Debian-7.2 \n \
            Debian-7.3 \n \
            openSUSE-project-12.3 \n \
            "

DISTRO_VERSION = "1.0"
DISTRO_CODENAME = "monkey"
DISTRO_NAME = "iot-devkit (Intel IoT Development Kit)"
MAINTAINER = "Yocto Devkit <yocto-devkit@linux.intel.com>"

TARGET_VENDOR = "-iotkit"
SDK_VENDOR = "-iotkit"

SSTATE_DIR = "${TOPDIR}/../devkit-cache/sstate-cache"
CACHE_forcevariable = "${TOPDIR}/../devkit-cache/cache"
PERSISTENT_DIR = "${TOPDIR}/../devkit-cache/persistent"
