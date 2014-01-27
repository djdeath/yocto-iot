require iot-devkit-prof-image.bb

DESCRIPTION = "A fully functional image to be placed on SD card with full profiling and dev tools"

IMAGE_INSTALL += "cmake"
IMAGE_INSTALL += "binutils"
IMAGE_INSTALL += "packagegroup-core-tools-profile"
IMAGE_INSTALL += "packagegroup-core-buildessential"
