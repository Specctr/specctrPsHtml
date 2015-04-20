#!/usr/bin/env bash
ROOT="/Users/${USER}/Dropbox"
version="${1}m"

java  -jar "${ROOT}/signingtoolkit/ucf.jar" \
      -package \
      -storetype "PKCS12" \
      -keystore "${ROOT}/certs/ComodoSpecctr.p12" \
      -storepass "curses77" \
      -tsa "https://timestamp.geotrust.com/tsa" \
      "./Specctr-${version}.zxp" -C "./ExtensionContent" .
