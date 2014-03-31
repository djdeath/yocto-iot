DESCRIPTION = "NoFlo UI: The Web UI for the NoFlo framework"
SECTION = "utils"

LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COREBASE}/meta/COPYING.MIT;md5=3da9cfbcb788c80a0384361b4de20420"

DEPENDS = "lighttpd noflo-iot"

SRC_URI = "file://noflo-${PV}.zip;subdir=noflo-ui"

SRC_URI[sha256] = "e142a91a63fd73248e413467587a71b7c4adff7a346963774a96a90b23046777"

S = "${WORKDIR}/noflo-ui"

do_configure () {
}

do_compile () {
}

do_install() {
    echo $PWD
    mkdir -p ${D}/www/pages
    echo "cp -a $PWD/* ${D}/www/pages/"
    cp -a $PWD/* ${D}/www/pages/
}

FILES_${PN} = "/www/pages/"
