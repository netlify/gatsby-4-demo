#!/usr/bin/env bash
echo Patching gatsby packages

if [[ $OSTYPE == 'darwin'* ]]; then
    find node_modules/gatsby* -type f -name '*.js' -print0 | xargs -0 sed -i '' 's/"" === `4`/"4" === `4`/'
else
    find node_modules/gatsby* -type f -name '*.js' -print0 | xargs -0 sed -i 's/"" === `4`/"4" === `4`/' 
fi
