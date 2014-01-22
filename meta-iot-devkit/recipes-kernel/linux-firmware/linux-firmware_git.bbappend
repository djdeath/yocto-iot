
PACKAGES =+ "${PN}-iwlwifi-6000g2a-6 \
             ${PN}-iwlwifi-135-6"


RDEPENDS_${PN}-iwlwifi-6000g2a-6 = "${PN}-iwlwifi-license"
RDEPENDS_${PN}-iwlwifi-135-6 = "${PN}-iwlwifi-license"

FILES_${PN}-iwlwifi-6000g2a-6 = "/lib/firmware/iwlwifi-6000g2a-6.ucode"
FILES_${PN}-iwlwifi-135-6 =     "/lib/firmware/iwlwifi-135-6.ucode"
