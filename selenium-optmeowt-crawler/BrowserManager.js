const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const {PAGE_LOAD_TIMEOUT, SCRIPT_TIMEOUT, RETRY_DELAY, CRALWER_BROWSER_URL } = require('./constants')

/**
 * Manages the Selenium WebDriver instance for browser interaction.
 * Handles browser setup, CAPTCHA detection, and quitting the browser.
 */
class BrowserManager {
    /**
     * Creates a new BrowserManager instance.
     * @param {CrawlerConfig} config - Crawler configuration object.
     */
    constructor(config) {
      this.config = config;
      this.driver = null;
    

    }
  
    /**
     * Sets up the Selenium WebDriver with Firefox options and installs the OptMeowt addon.
     * Also sets timeouts for page load and script execution.
     * @async
     */
    async setup() {
      const options = new firefox.Options()
        .setPreference('xpinstall.signatures.required', false)
        .setPreference('services.settings.server', 'https://firefox.settings.services.mozilla.com/v1')
        .addArguments(
          '--headful',
          'disable-infobars',
          '--no-sandbox',
          '--disable-application-cache',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        );

	      await this.startup(2, options)
      }
  async startup(retries = 0, options){
    try{
      this.driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .usingServer(CRALWER_BROWSER_URL)
      .build();

      await this.driver.installAddon('./ff-optmeowt-2.0.1.xpi', true)

    await this.driver.manage().setTimeouts({
      implicit: 0,
      pageLoad: PAGE_LOAD_TIMEOUT,
      script: SCRIPT_TIMEOUT
    });
  
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    console.log('built')
  }catch(error){
      if(retries > 0){
        console.log(`Retrying WebDriver connection... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
	await this.startup(retries - 1, options)
      }
    }
  }
    
  /**
   * Checks the current page title for patterns indicating a CAPTCHA or human verification challenge.
   * If a CAPTCHA is detected, it throws a HumanCheckError.
   * @async
   * @throws {HumanCheckError} If a CAPTCHA is detected.
   */
  async checkForCaptcha() {
    const title = await this.driver.getTitle();
    const captchaPatterns = [
      /Access.*Denied/i,
      /error/i,
      /service.*unavailable/i,
      /Just a moment\.\.\./i,
      /you have been blocked/i,
      /site not available/i,
      /attention required/i,
      /access to this page has been blocked/i,
      /site.*temporarily unavailable/i,
      /site.*temporarily down/i,
      /robot or human/i,
      /403 forbidden/i,
      /pardon our interruption/i,
      /are you a robot/i,
      /block -/i,
      /Human Verification/i
    ];

    if (captchaPatterns.some(pattern => pattern.test(title))) {
      throw new HumanCheckError('Human Check');
    }
  }
}

module.exports = BrowserManager
