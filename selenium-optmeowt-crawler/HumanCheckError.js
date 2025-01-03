/**
 * Custom error class for human verification detection.
 * This error is thrown when the crawler detects a CAPTCHA or similar human verification challenge.
 * @extends Error
 */
class HumanCheckError extends Error {
    /**
     * Creates a new HumanCheckError.
     * @param {string} message - The error message.
     */
    constructor(message) {
      super(message);
      this.name = 'HumanCheckError';
    }
}
  