const axios = require('axios');
const fs = require('fs');
const {API_BASE_URL} = require('./constants')
/**
 * Manages database interactions, including logging GPC results and errors, and updating site IDs.
 */
class DatabaseManager {
  /**
   * Creates a new DatabaseManager instance.
   * @param {string} timestamp - Timestamp for the current crawl, used for organizing results.
   */
  constructor(timestamp) {
    this.gpcResults = [];
    this.timestamp = timestamp;
  }

  /**
   * Updates the site ID for a given analysis record in the database.
   * @async
   * @param {object} data - The data object containing the analysis record to update.
   */
  async updateSiteId(data) {
    try {
      await axios.put(`${API_BASE_URL}/analysis`, data);
    } catch (error) {
      console.error('Error updating site ID:', error.message);
    }
  }

  /**
   * Logs the GPC endpoint check result to a CSV file.
   * Also logs any errors associated with the GPC check.
   * @async
   * @param {string} site - The URL of the site being checked.
   * @param {object} gpcResult - The result of the GPC endpoint check, including status and data.
   */
  async logGPCResult(site, gpcResult) {
    const csvLine = `${site},${gpcResult?.status || 'None'},"${JSON.stringify(gpcResult?.data) || 'None'}"\n`;
    await fs.promises.appendFile(`./crawl_results/${this.timestamp}/well-known-data.csv`, csvLine);

    if (gpcResult?.error) {
      await this.logError(site, gpcResult.error);
    }
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
      `./crawl_results/${this.timestamp}/well-known-errors.json`,
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
      const data = await fs.promises.readFile(`./crawl_results/${this.timestamp}/well-known-errors.json`, 'utf8');
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
      const response = await axios.get(`${API_BASE_URL}/analysis/${site}`);
      const latestData = response.data;
      if (latestData.length >= 1) {
        const lastEntry = latestData[latestData.length - 1];
        if (lastEntry.site_id === null) {
          lastEntry.site_id = siteId;
          await this.updateSiteId(lastEntry);
        }
        return true;
      } else {
        const nullResponse = await axios.get(`${API_BASE_URL}/null_analysis`);
        const nullData = nullResponse.data;
        if (nullData.length >= 1) {
          nullData[nullData.length - 1].site_id = siteId;
          await this.updateSiteId(nullData[nullData.length - 1]);
          return true;
        }
      }
    } catch (error) {
      console.error('Database operation failed:', error.message);
    }
    return false;
  }
}

module.exports = DatabaseManager