const fetch = require("cross-fetch");

/**
 * RPC Chain Fetcher
 * @param {string} url
 * @param {Record<string, any>} body
 * @returns {Record<string, any>}
 */
const chainfetcher = async (url, body) => {
  const f = await fetch(process.env.ENDPOINT + "/v1/chain" + url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await f.json();
};

/**
 * URL API Fetcher
 * @param {string} url
 * @returns {Record<string, any>}
 */
const fetcher = async (url) => {
  const f = await fetch(url);

  return f.json();
};

module.exports = { chainfetcher, fetcher };
