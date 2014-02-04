#!/bin/bash

# Devkit release tarball creation script
# Copyright 2014 Intel Corporation

if [ "$1" = "" ] ; then
    echo "Please specify an output directory"
    exit 1
fi

if [ ! -f iot-devkit-init-build-env ] ; then
    echo "Please execute this script from the base devkit directory"
    exit 1
fi

set -e

OUTDIR="$1"
shift

if [ "$OUTDIR" != "." ] ; then
    git clone . $OUTDIR
    cd $OUTDIR
fi

. ./iot-devkit-init-build-env

ENVDATA_FILE=`mktemp`
bitbake -e > $ENVDATA_FILE

LOWEST_DISTRO="Ubuntu-12.04"
CURRENT_DISTRO=`grep ^NATIVELSBSTRING= $ENVDATA_FILE | sed -e 's/[^"]*"\([^"]*\)".*/\1/'`

if [ "$CURRENT_DISTRO" != "$LOWEST_DISTRO" ] ; then
    echo "You are not using $LOWEST_DISTRO - the current host distribution $CURRENT_DISTRO cannot be used to create host sstate packages that will work on all supported distros"
    #exit 1
fi

SANITY_TESTED_DISTROS=`grep ^SANITY_TESTED_DISTROS= $ENVDATA_FILE | sed -e 's/[^"]*"\([^"]*\)".*/\1/' -e 's/\\\n//g'`

TMPDIR=`grep ^TMPDIR= $ENVDATA_FILE | sed -e 's/[^"]*"\([^"]*\)".*/\1/'`

generate_cache_data() {
    echo > $LOCKED_SIGS_FILE
    rm -rf $TMPDIR
    bitbake $TARGETS
    bitbake -S $TARGETS
    cat locked-sigs.inc | sed -e '/do_rootfs/d' -e '/do_bootimg/d' -e '/do_populate_sdk/d' > $LOCKED_SIGS_FILE
    rm locked-sigs.inc
    echo "Launching Hob to populate caches, will close automatically"
    HOB_POPULATE_CACHES_ONLY=1 hob-iot
}

# Full distro
LOCKED_SIGS_FILE="../meta-iot-devkit/conf/distro/include/iot-devkit-locked-sigs.inc"
export DISTRO="iot-devkit-locked"
TARGETS="iot-devkit-image:do_rootfs iot-devkit-image:do_populate_sdk iot-devkit-prof-dev-image:do_rootfs iot-devkit-prof-dev-image:do_populate_sdk iot-devkit-prof-dev-image:do_rootfs iot-devkit-prof-dev-image:do_populate_sdk"
generate_cache_data

# SPI distro
LOCKED_SIGS_FILE="../meta-iot-devkit/conf/distro/include/iot-devkit-spi-locked-sigs.inc"
export DISTRO="iot-devkit-spi-locked"
TARGETS="iot-devkit-spi-image:do_rootfs iot-devkit-spi-image:do_populate_sdk"
generate_cache_data

# Symlink all other distros host sstate subdirs to the current distro
SSTATE_DIR=`grep ^SSTATE_DIR= $ENVDATA_FILE | sed -e 's/[^"]*"\([^"]*\)".*/\1/'`
for distro in $SANITY_TESTED_DISTROS; do
    if [ "$distro" != "$CURRENT_DISTRO" ] ; then
        ln -s $CURRENT_DISTRO $SSTATE_DIR/$distro
    fi
done

rm $ENVDATA_FILE

if [ "$OUTDIR" != "." ] ; then
    # Tidy up repository
    git remote rm origin
    git gc
    cd ..
    rm -rf build
fi
