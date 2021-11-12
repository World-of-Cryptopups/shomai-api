const fetch = require("cross-fetch");
/**
 * Description
 * @param {string} url
 * @param {string} body
 * @returns {Record<string, any>}
 */

const chainfetcher = async (url, body) => {
  const f = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await f.json();
};

module.exports = { chainfetcher };
