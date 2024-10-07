#!/bin/bash

set -x

cd /srv/analysis/gpc-analysis-extension

npm install -g pretty-js
npm install -g rimraf
npm run build

# Firefox build at dist/firefox
cd dist/firefox

# add the browser specific settings to the JSON file
cat << EXTRALINES | sed -i '/"incognito": "spanning"/r /dev/stdin' manifest.json
, "browser_specific_settings": {
    "gecko": {
      "id": "{daf44bf7-a45e-4450-979c-91cf07434c3d}"
    }
  }
EXTRALINES

pretty-js --in-place manifest.json

zip -1 -r myextension.xpi *
cp myextension.xpi /srv/analysis/selenium-optmeowt-crawler