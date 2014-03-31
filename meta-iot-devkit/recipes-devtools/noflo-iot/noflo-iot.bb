DESCRIPTION = "NoFlo IoT runtime"
HOMEPAGE = "https://github.com/djdeath/noflo-iot"
LICENSE = "MIT"

LIC_FILES_CHKSUM = "file://${COREBASE}/meta/COPYING.MIT;md5=3da9cfbcb788c80a0384361b4de20420"

NODE_VERSION = "0.10.22"

SRC_URI = "http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}.tar.gz"

SRC_URI[md5sum] = "1f1948de2ef50a1d8e2303a6ed6c0e45"
SRC_URI[sha256sum] = "157fc58b3f1d109baefac4eb1d32ae747de5e6d55d87d0e9bec8f8dd10679e7e"

SRC_URI += "file://noflo-iot"
SRC_URI += "file://noflo-iot-bin.js"

DEPENDS = "openssl nodejs-native"

S = "${WORKDIR}/node-v${NODE_VERSION}"

# v8 errors out if you have set CCACHE
CCACHE = ""

ARCHFLAGS_arm = "${@bb.utils.contains('TUNE_FEATURES', 'callconvention-hard', '--with-arm-float-abi=hard', '--with-arm-float-abi=softfp', d)}"
ARCHFLAGS ?= ""

NOFLO_COMMON_DEPS = "fs.extra \
		     git://github.com/djdeath/GpiO.git \
		     mimetype \
		     pwm \
		     owl-deepcopy \
		     websocket"

do_configure () {
}

do_compile () {
}

do_install () {
    npm install ${NOFLO_COMMON_DEPS} -g --prefix ${D}/noflo 

    install -d ${D}${sysconfdir}/init.d/
    install -m 0755 ${WORKDIR}/noflo-iot ${D}${sysconfdir}/init.d/

    install -d ${D}/noflo
    install ${WORKDIR}/noflo-iot-bin.js ${D}/noflo
}

RDEPENDS_${PN} = "nodejs"
RDEPENDS_${PN}_class-native = ""

inherit update-rc.d

INITSCRIPT_NAME = "noflo-nodejs"
INITSCRIPT_PARAMS = "defaults 99"

FILES_${PN} += "/noflo \
		${sysconfdir}/init.d/"
