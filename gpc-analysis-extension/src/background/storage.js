/*
Licensed per https://github.com/privacy-tech-lab/gpc-optmeowt/blob/main/LICENSE.md
privacy-tech-lab, https://www.privacytechlab.org/
*/

/*
storage.js
================================================================================
storage.js handles OptMeowt's reads/writes of data to some local location
If the domainlist is being handled, then cookies are added/removed here too
*/

import { openDB } from "idb";
import { saveAs } from "file-saver";

/******************************************************************************/
/**************************  Enumerated settings  *****************************/
/******************************************************************************/

// In general, these functions should be use with async / await for
// syntactic sweetness & synchronous data handling
// i.e., await storage.set(stores.settings, extensionMode.enabled, 'MODE')
// TODO: Make this an enum
const stores = Object.freeze({
  settings: "SETTINGS",
  domainlist: "DOMAINLIST",
  analysis: "ANALYSIS",
  analysis_domains: "ANALYSIS_DOMAINS",
});

/******************************************************************************/
/*************************  Main Storage Functions  ***************************/
/******************************************************************************/

const dbPromise = openDB("extensionDB", 1, {
  upgrade: function dbPromiseInternal(db) {
    db.createObjectStore(stores.domainlist);
    db.createObjectStore(stores.settings);
    db.createObjectStore(stores.analysis);
    db.createObjectStore(stores.analysis_domains);
  },
});

const storage = {
  async get(store, key) {
    return (await dbPromise).get(store, key);
  },
  async getAll(store) {
    return (await dbPromise).getAll(store);
  },
  async getAllKeys(store) {
    return (await dbPromise).getAllKeys(store);
  },
  // returns an object containing the given store
  async getStore(store) {
    const storeValues = await storage.getAll(store);
    const storeKeys = await storage.getAllKeys(store);
    let storeCopy = {};
    let key;
    for (let index in storeKeys) {
      key = storeKeys[index];
      storeCopy[key] = storeValues[index];
    }
    return storeCopy;
  },
  async set(store, value, key) {
    return new Promise(async (resolve, reject) => {
      (await dbPromise).put(store, value, key).then(resolve());
    });
  },
  async delete(store, key) {
    // deleting opt out cookies for a given domain key
    // We know that `key` will be a domain, i.e. a string
    if (store === stores.domainlist) {
      storageCookies.deleteCookiesForGivenDomain(key);
    }

    return (await dbPromise).delete(store, key);
  },
  async clear(store) {
    return (await dbPromise).clear(store);
  },
};

/******************************************************************************/
/*********************  Importing/Exporting Domain List  **********************/
/******************************************************************************/

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

export { stores, storage };
