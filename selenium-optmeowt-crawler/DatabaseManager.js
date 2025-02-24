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
   * Checks the database for existing analysis records for a given siteId
   * @async
   * @param {number} siteId - The ID of the site to be updated in the database.
   * @returns {Promise<boolean>} True if the database was updated, false otherwise.
   */
  async hasEntryInDb(siteId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/analysis/${siteId}/exists`);
      return response.data === true
    } catch (error) {
      console.error('Database operation failed:', error.message);
      return false;
    }
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