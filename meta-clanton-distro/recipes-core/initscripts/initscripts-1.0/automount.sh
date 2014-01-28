#!/bin/sh
#Krzysztof.M.Sywula@intel.com

dir=/media

auto_mount() {
  mkdir -p $dir/$1 || exit 1
  if ! mount -t auto -o sync "/dev/$1" "$dir/$1"; then
    rmdir "$dir/$1"
    exit 1
  fi
}

auto_umount() {
  mount | grep -q $dir/$1 && umount $dir/$1
  [ -d "$dir/$1" ] && rmdir "$dir/$1"
}

main() {
  case "$ACTION" in
  add|"")
    auto_umount "$MDEV"
    auto_mount "$MDEV"
    ;;
  remove)
    auto_umount "$MDEV"
    ;;
  esac
}

main "$@"
