#!/usr/bin/env bash
version="${1}.m"

~/Dropbox/certs/ZXPSignCmd_debug -sign ./ExtensionContent ./Specctr-${version}.zxp ~/Dropbox/certs/FFComodoCodeCertSpecctr.p12 vaibhav 
