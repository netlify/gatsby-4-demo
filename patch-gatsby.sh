#!/bin/sh
echo Patching gatsby packages
find node_modules/gatsby* -type f -name '*.js' -print0 | xargs -0 sed -i '' 's/"" === `4`/"4" === `4`/'