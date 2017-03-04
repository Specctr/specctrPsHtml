#!/bin/bash
VERSION=$1
if [ -z "$1" ]
  then
    echo "No version supplied."
    exit 1
fi

ROOT="/Users/mityaWork/Dropbox"
EXT_HOME=$ROOT/specctrPsHtml
MANIFEST=$EXT_HOME/ExtensionContent/CSXS/manifest.xml

PKG_REPO=$ROOT/specctrOSXpkg
PKG_BUILD=$PKG_REPO/signed_builds

EXE_REPO=$ROOT/winInstaller
EXE_BUILD=/Users/mityaWork/SharedVM/specctrWinBuild/specctrMaster/Output/
BASE_NAME=SpecctrMaster

# Overwrite manifest version.
sed -i '' -E "s/(ExtensionBundleVersion=\").*(\")/\\1$VERSION\\2/g" $MANIFEST
echo "Updated manifest to version ${VERSION} in place:"
head $MANIFEST

# Build.
$PKG_REPO/build.sh
$EXE_REPO/build.sh

# Stage and zip.
STAGING=$EXT_HOME/staging
VERSION_NAME=$BASE_NAME\_$VERSION
ZIP_DIR=$STAGING/$VERSION/$VERSION_NAME
MAC_DIR=$ZIP_DIR/MAC
WIN_DIR=$ZIP_DIR/WIN

mkdir -p $MAC_DIR
mkdir -p $WIN_DIR
cp $PKG_BUILD/$VERSION_NAME\.pkg $MAC_DIR/
cp $EXE_BUILD/$VERSION_NAME\.exe $WIN_DIR/

cp $EXT_HOME/changes.txt $ZIP_DIR
cp $EXT_HOME/tutorial_3_0.pdf $ZIP_DIR

cd $STAGING/$VERSION
zip -r $ZIP_DIR\.zip $VERSION_NAME
cd $EXT_HOME

# Upload to s3 with public perms for download.
aws s3 cp $ZIP_DIR\.zip s3://specctr-downloads/$VERSION_NAME\.zip --acl public-read --profile specctr
git tag -a v.$VERSION -m "packaged and uploaded version $VERSION to s3."
cd -

exit 0
