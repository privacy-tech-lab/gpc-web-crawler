/*
Licensed per https://github.com/privacy-tech-lab/gpc-optmeowt/blob/main/LICENSE.md
privacy-tech-lab, https://www.privacytechlab.org/
*/

/*
regex.js
================================================================================
regex.js keeps track of all the regular expressions we will use throughout the 
extension in multiple locations
*/

export const uspPhrasing = /(us(-|_|.)?privacy)/gim;
export const uspCookiePhrasingList = [
  "us_privacy",
  "us-privacy",
  "usprivacy",
  "OptanonConsent",
  "OneTrustWPCCPAGoogleOutput",
  "OTGPPConsent",
];
