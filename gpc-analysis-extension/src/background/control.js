/*
Licensed per https://github.com/privacy-tech-lab/gpc-optmeowt/blob/main/LICENSE.md
privacy-tech-lab, https://www.privacytechlab.org/
*/

/*
control.js
================================================================================
control.js manages persistent data, message liseteners, in particular
to manage the state & functionality mode of the extension
*/

import {
  init as initAnalysis,
  halt as haltAnalysis,
} from "./analysis/analysis.js";
import { defaultSettings } from "../data/defaultSettings.js";
import { stores, storage } from "./storage.js";

async function enable() {
  initAnalysis();
}

/******************************************************************************/
// Initializers

// This is the very first thing the extension runs
(async () => {
  // Initializes the default settings
  let settingsDB = await storage.getStore(stores.settings);
  for (let setting in defaultSettings) {
    if (!settingsDB[setting]) {
      await storage.set(stores.settings, defaultSettings[setting], setting);
    }
  }

  // Turns on the extension
  enable();
})();

/******************************************************************************/
// Mode listeners

// (1) Handle extension activeness is changed by calling all halt
// 	 - Make sure that I switch extensionmode and separate it from mode.domainlist
// (2) Handle extension functionality with listeners and message passing

/**
 * IF YOU EVER NEED TO DEBUG THIS:
 * This is outmoded in manifest V3. We cannot maintain global variables anymore.
 */

// Create keyboard shortcuts for switching to analysis mode
