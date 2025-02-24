const axios = require('axios');
const fs = require('fs');
const {API_BASE_URL} = require('./constants')
/**
 * Manages database interactions, including logging GPC results and errors, and updating site IDs.
 */
class DatabaseManager {
  /**
   * Creates a new DatabaseManager instance.
   * @param {string} save_path - base directory path for saving crawl results
   */
  constructor(crawl_path) {
    this.gpcResults = [];
    this.crawl_path = crawl_path;
  }

  /**
   * Logs an error encountered during crawling or GPC endpoint checking to a JSON file.
   * @async
   * @param {string} site - The URL of the site where the error occurred.
   * @param {string} error - The error message.
   */
  async logError(site, error) {
    const errors = await this.loadErrors();
    errors[site] = error;
    await fs.promises.writeFile(
      `${this.crawl_path}/well-known-errors.json`,
      JSON.stringify(errors, null, 2)
    );
  }

  /**
   * Loads previously logged errors from the JSON file.
   * @async
   * @returns {Promise<object>} An object containing the logged errors, keyed by site URL.
   */
  async loadErrors() {
    try {
      const data = await fs.promises.readFile(`${this.crawl_path}/well-known-errors.json`, 'utf8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  /**
   * Checks the database for existing analysis records for a given site and updates the site ID if necessary.
   * Prioritizes updating existing entries where the site_id is null. If no such entry exists, it tries to update a null analysis entry.
   * @async
   * @param {string} site - The URL of the site.
   * @param {number} siteId - The ID of the site to be updated in the database.
   * @returns {Promise<boolean>} True if the database was updated, false otherwise.
   */
  async checkAndUpdateDB(site, siteId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/analysis/${siteId}`);
      const latestData = response.data;
      console.log(`tried to check if ${siteId} was in database, result: ${latestData} `)
      console.log(latestData.length)
      if (latestData.length >= 1) {
        return true;
      } 
    } catch (error) {
      console.error('Database operation failed:', error.message);
    }
    return false;
  }

  /**
   * Increments the siteId variable by sending a GET request to the REST API.
   *
   * This method calls the `/increment_siteId` endpoint, which increments the siteId value on the server.
   *
   * @returns {Promise<void>} A promise that resolves when the siteId has been incremented.
   */
  async increment_siteId() {
    await axios.post(`${API_BASE_URL}/increment_siteId`);
  }
}

module.exports = DatabaseManager