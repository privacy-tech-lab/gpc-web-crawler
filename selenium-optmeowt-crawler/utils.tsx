// write a custom error
// we throw this the title of the site has a human check
// then we can identify sites that we can't crawl with the vpn on
class HumanCheckError extends Error {
    constructor(message) {
      super(message);
      this.name = "HumanCheckError";
    }
  }
enum CrawlerError {
    InsecureCertificateError = "InsecureCertificateError",
    WebDriverError = "WebDriverError",
    HumanCheckError = "HumanCheckError"
}

async function check_if_captcha_page(driver) {
    var title = await driver.getTitle();
    if (
      (title.match(/Access/i) && title.match(/Denied/i)) ||
      title.match(/error/i) ||
      (title.match(/service/i) && title.match(/unavailable/i)) ||
      title.match(/Just a moment.../i) ||
      title.match(/you have been blocked/i) ||
      title.match(/site not available/i) ||
      title.match(/attention required/i) ||
      title.match(/access to this page has been blocked/i) ||
      (title.match(/site/i) && title.match(/temporarily unavailable/i)) ||
      (title.match(/site/i) && title.match(/temporarily down/i)) ||
      title.match(/403 forbidden/i) ||
      title.match(/pardon our interruption/i) ||
      title.match(/robot or human/i) ||
      title.match(/are you a robot/i) ||
      title.match(/block -/i) ||
      title.match(/Human Verification/i)
    ) {
      throw new HumanCheckError("Human Check");
    }

}