#!/bin/bash

# Devkit release tarball creation script
# Copyright 2014 Intel Corporation

usage() {
    echo "usage: `basename $0` <outputdir> [--keep-tmpdir] [--dldir <downloads-dir>]"
}

if [ ! -f iot-devkit-init-build-env ] ; then
    echo "Please execute this script from the base devkit directory"
    exit 1
fi

set -e

unset OUTDIR
unset DL_DIR
unset SKIPDELETE

while [ "$1" != "" ] ; do
    case "$1" in
        --help )
            usage
            exit
            ;;
        --keep-tmpdir )
            SKIPDELETE=1
            ;;
        --dldir )
            if [ "$2" = "" ] ; then
                echo "You must specify a directory for the --dldir option"
                usage
                exit 1
            fi
            DL_DIR=$2
            shift
            ;;
        -* )
            echo "Invalid option $1"
            usage
            exit 1
            ;;
        * )
            if [ "$OUTDIR" = "" ] ; then
                OUTDIR="$1"
            else
                echo "Invalid parameter $1"
                usage
                exit 1
            fi
    esac
    shift
done

if [ "$OUTDIR" = "" ] ; then
    echo "Please specify an output directory"
    usage
    exit 1
fi


if [ "$OUTDIR" != "." ] ; then
    if [ ! -d $OUTDIR ] ; then
        git clone . $OUTDIR
    fi
    cd $OUTDIR
fi

if [ -d "$OUTDIR" ] ; then
    echo
    echo "WARNING: using existing output directory"
    echo
fi

if [ "$DL_DIR" = "" ] ; then
    DL_DIR="$OUTDIR/downloads"
fi

. ./iot-devkit-init-build-env

VARSET="1"
grep -q ^DL_DIR conf/local.conf || VARSET="0"
if [ "$VARSET" = "1" ] ; then
    sed -i "s,^DL_DIR =.*,DL_DIR = \"$DL_DIR\"," conf/local.conf
else
    echo "DL_DIR = \"$DL_DIR\"" >> conf/local.conf
fi

ENVDATA_FILE=`mktemp`
bitbake -e > $ENVDATA_FILE

LOWEST_DISTRO="Ubuntu-12.04"
CURRENT_DISTRO=`grep ^NATIVELSBSTRING= $ENVDATA_FILE | sed -e 's/[^"]*"\([^"]*\)".*/\1/'`

if [ "$CURRENT_DISTRO" != "$LOWEST_DISTRO" ] ; then
    echo
    echo "WARNING: you are not using $LOWEST_DISTRO - the current host distribution $CURRENT_DISTRO cannot be used to create host sstate packages that will work on all supported distros"
    echo
    #exit 1
fi

SANITY_TESTED_DISTROS=`grep ^SANITY_TESTED_DISTROS= $ENVDATA_FILE | sed -e 's/[^"]*"\([^"]*\)".*/\1/' -e 's/\\\n//g'`

TMPDIR=`grep ^TMPDIR= $ENVDATA_FILE | sed -e 's/[^"]*"\([^"]*\)".*/\1/'`

generate_cache_data() {
    if [ "$SKIPDELETE" = "" ] ; then
        for n in {10..1}; do
            printf "\rAbout to delete TMPDIR %s... %s " "$TMPDIR" $n
            sleep 1
        done
        echo
        rm -rf $TMPDIR
    else
        # We need to delete it the second time
        unset SKIPDELETE
    fi
    echo > $LOCKED_SIGS_FILE
    bitbake $TARGETS
    bitbake -S $TARGETS
    cat locked-sigs.inc | sed -e '/do_rootfs/d' -e '/do_bootimg/d' -e '/do_populate_sdk/d' -e '/do_build/d' > $LOCKED_SIGS_FILE
    rm locked-sigs.inc
    echo "Launching Hob to populate caches, will close automatically"
    HOB_POPULATE_CACHES_ONLY=1 hob-iot
}

# Full distro
LOCKED_SIGS_FILE="../meta-iot-devkit/conf/distro/include/iot-devkit-locked-sigs.inc"
export DISTRO="iot-devkit-locked"
TARGETS="iot-devkit-image:do_build iot-devkit-image:do_populate_sdk iot-devkit-prof-image:do_build iot-devkit-prof-dev-image:do_build iot-devkit-prof-dev-image:do_populate_sdk"
generate_cache_data

# SPI distro
LOCKED_SIGS_FILE="../meta-iot-devkit/conf/distro/include/iot-devkit-spi-locked-sigs.inc"
export DISTRO="iot-devkit-spi-locked"
TARGETS="iot-devkit-spi-image:do_build iot-devkit-spi-image:do_populate_sdk"
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
    BRANCHNAME=devkit-mwc
    git remote rm origin
    git remote add origin git://git.yoctoproject.org/meta-intel-iot-devkit
    git checkout -b $BRANCHNAME
    git config --remove-section branch.master > /dev/null 2>&1 || true
    git config --replace-all branch.master.remote origin
    git config --replace-all branch.master.merge refs/heads/master
    git config --replace-all branch.$BRANCHNAME.remote origin
    git config --replace-all branch.$BRANCHNAME.merge refs/heads/$BRANCHNAME
    git gc
    cd ..
    rm -rf build
fi
