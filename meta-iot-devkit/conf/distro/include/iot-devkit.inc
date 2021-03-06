SANITY_TESTED_DISTROS = " \
            Poky-1.5 \n \
            Ubuntu-12.04 \n \
            Ubuntu-13.10 \n \
            Fedora-19 \n \
            Fedora-20 \n \
            Debian-7.3 \n \
            Debian-7.4 \n \
            openSUSE-project-12.3 \n \
            "

DISTRO_VERSION = "1.0"
DISTRO_CODENAME = "monkey"
DISTRO_NAME = "iot-devkit (Intel IoT Development Kit)"
MAINTAINER = "Yocto Devkit <yocto-devkit@linux.intel.com>"

# Changing these currently breaks the Eclipse plugin
#TARGET_VENDOR = "-iotkit"
#SDK_VENDOR = "-iotkit"

SDKMACHINE ?= "i686"

SSTATE_DIR ?= "${TOPDIR}/../devkit-cache/sstate-cache"
CACHE_forcevariable = "${TOPDIR}/../devkit-cache/cache"
PERSISTENT_DIR = "${TOPDIR}/../devkit-cache/persistent"
