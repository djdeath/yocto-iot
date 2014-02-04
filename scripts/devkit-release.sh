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

# Clear out locked sigs files (we're going to create them)
echo > ../meta-iot-devkit/conf/distro/include/iot-devkit-locked-sigs.inc
echo > ../meta-iot-devkit/conf/distro/include/iot-devkit-spi-locked-sigs.inc

DISTRO=iot-devkit-locked bitbake iot-devkit-image:do_rootfs iot-devkit-image:do_populate_sdk

DISTRO=iot-devkit-locked bitbake -S iot-devkit-image:do_rootfs iot-devkit-image:do_populate_sdk
cat locked-sigs.inc | sed -e '/do_rootfs/d' -e '/do_bootimg/d' -e '/do_populate_sdk/d' > ../meta-iot-devkit/conf/distro/include/iot-devkit-locked-sigs.inc
rm locked-sigs.inc

# Prime Hob cache (Hob has extra caches and we need the pkgdata cache as well)
# FIXME this needs to be non-interactive or we can't practically do this for the -spi distro as well
echo "Launching hob - once the cache has been populated, exit out"
DISTRO=iot-devkit-locked hob-iot

#rm -rf tmp
#DISTRO=iot-devkit-spi-locked bitbake iot-devkit-spi-image iot-devkit-spi-image:do_populate_sdk
#rm -rf tmp

#DISTRO=iot-devkit-spi-locked bitbake -S iot-devkit-spi-image
#cat locked-sigs.inc | sed -e '/do_rootfs/d' -e '/do_bootimg/d' -e '/do_populate_sdk/d' > ../meta-iot-devkit/conf/distro/include/iot-devkit-spi-locked-sigs.inc
#rm locked-sigs.inc

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
