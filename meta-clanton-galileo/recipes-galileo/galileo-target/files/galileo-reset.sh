#!/bin/sh
tty=/dev/ttyS1
pdat=/sys/firmware/board_data/PlatformID
fabdid=6

main()
{
    [ -f "$pdat" ] || die "$pdat doesn't exist"
    [ $fabdid -eq $(($(cat $pdat))) ] || die "not fabd"

    while true; do
     /opt/cln/galileo/galileo_sketch_reset -v
     usleep 200000
    done & exit 0
}

die()
{
    [ -c "$tty" ] && echo "exiting: $@" > $tty
    exit 1
}

main "$@"


