# Architecture Overview

```txt
src
├── assets       # Static images & files
├── background      # Manages the background script processes
│   ├── analysis
│   │   ├── analysis-listeners.js
│   │   └── analysis.js
│   ├── control.js
│   └── storage.js
├── content-scripts     # Runs processes on site on adds DOM signal
│   ├── injection
│   │   └── gpc-dom.js
│   └── contentScript.js
├── data       # Stores constant data (DNS signals, settings, etc.)
│   ├── defaultSettings.js
│   ├── headers.js
│   ├── modes.js
│   └── regex.js
└── manifests      # Stores manifests
    └── firefox
        ├── manifest-dev.json
        └── manifest-dist.json
```

The following source folders have detailed descriptions further in the document.

[background](#background)\
[content-scripts](#content-scripts)\
[data](#data)\
[manifests](#manifests)


## background

1. `analysis`
2. `control.js`
3. `storage.js`
   

The background folder has an `analysis` folder that builds analysis mode.

### `src/background/analysis`

1. `analysis-listeners.js`
2. `analysis.js`

#### `analysis/analysis-listeners.js`

Initializes the listeners for analysis mode using `webRequest` and `webNavigation` (links found below). This file only needs to deal with Firefox listeners as we only crawl using Firefox Nightly.

#### `analysis/analysis.js`

Contains all the logic and processes for running analysis mode. `FetchUSPCookies();` is used to identify and save US Privacy cookies and `fetchUSPAPIData();` uses the USPAPI query to check the US Privacy string. `runAnalysis();` collects the US Privacy values and sends the GPC signal. `haltAnalysis();` then rechecks the US Privacy values and removes the GPC signal, then allowing the US Privacy Values from before and after to be compared. `logData();` then records the found data to local storage.

### `background/control.js`

Uses `analysis.js` and `protection.js` to switch between modes.

### `background/storage.js`

Handles storage uploads and downloads.


## content-scripts

1. `injection`
2. `contentScript.js`

This folder contains our main content script and methods for injecting the GPC signal into the DOM.

### `src/content-scripts/injection`

1. `gpc-dom.js`

`gpc-dom.js` injects the GPC DOM signal.

### `content-scripts/contentScript.js`

This runs on every page and sends information to signal background processes.

## data

1. `defaultSettings.js`
2. `headers.js`
3. `modes.js`
4. `regex.js`

This folder contains static data.

### `data/defaultSettings.js`

Contains the default OptMeowt settings.

### `data/headers.js`

Contains the default headers to be attached to online requests.

### `data/modes.js`

Contains the modes for OptMeowt.

### `data/regex.js`

Contains regular expressions for finding "do not sell" links and relevant cookies

## manifests

1. `firefox`

Contains the extension manifests

### `manifests/firefox`

1. `manifest-dev.json`
2. `manifest-dist.json`

Contains the development and distribution manifests for Firefox

**Links to APIs:**

Firefox: [webRequest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest) and [webNavigation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation)
