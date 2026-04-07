#!/bin/bash
VERSION=$(grep -Po '<version>(?<version>.*)</version>' ./manifest.xml|grep -Po '(\d|\.)+' $VERSION)
RED='\033[0;31m'
GREEN='\033[0;32m'
RESET='\033[0m'

if printf -- '%s' "$(cat ./CHANGELOG.md)" | egrep -q -- "$VERSION"; then
     echo "${GREEN}Verified CHANGELOG.md contains note for current version...${RESET}"
else
    echo "${RED}CHANGELOG.md is missing change notes for current version! Exiting...${RESET}"
    exit 1;
fi

if printf -- '%s' "$(cat ./CHANGELOG_de-DE.md)" | egrep -q -- "$VERSION"; then
     echo "${GREEN}Verified CHANGELOG_de-DE.md contains note for current version...${RESET}"
else
    echo "${RED}CHANGELOG.md is missing change notes for current version! Exiting...${RESET}"
    exit 1;
fi

PLUGIN_NAME=${PWD##*/}

echo "${GREEN}Building $PLUGIN_NAME distribution $VERSION...${RESET}"

mkdir ./$PLUGIN_NAME

cp -r manifest.xml ./$PLUGIN_NAME/manifest.xml
cp -r Resources ./$PLUGIN_NAME/Resources
cp -r CHANGELOG.md ./$PLUGIN_NAME/CHANGELOG.MD
cp -r CHANGELOG_de-DE.md ./$PLUGIN_NAME/CHANGELOG_de-DE.md
cp -r LICENSE ./$PLUGIN_NAME/LICENSE
cp -r README.md ./$PLUGIN_NAME/README.md

zip -r $PLUGIN_NAME-$VERSION.zip $PLUGIN_NAME
rm -rf ./$PLUGIN_NAME

mv ./$PLUGIN_NAME-$VERSION.zip ./dist/

echo "${GREEN}Done! New distribution is available at ./dist/$PLUGIN_NAME-$VERSION.zip${RESET}"