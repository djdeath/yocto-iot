IMAGE_INSTALL += "galileo-target"
IMAGE_INSTALL += "mtd-utils-jffs2"

ROOTFS_POSTPROCESS_COMMAND += "install_sketch ; "

install_sketch() {
        install -d ${IMAGE_ROOTFS}/sketch
}
