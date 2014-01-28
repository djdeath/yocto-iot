DESCRIPTION = "grub.conf"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

GRUB_CONF = "grub.conf"
GRUB_PATH = "boot/grub/"
SRC_URI = "file://${GRUB_CONF}"

do_grub() {
  install -d ${DEPLOY_DIR_IMAGE}/${GRUB_PATH}
  install -m 0755 ${WORKDIR}/${GRUB_CONF} ${DEPLOY_DIR_IMAGE}/${GRUB_PATH}/${GRUB_CONF}
}

do_grub[nostamp] = "1"

addtask grub before do_build after do_compile
