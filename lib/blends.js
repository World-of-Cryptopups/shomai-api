const { chainfetcher } = require("../fetcher");

const BLENDTABLES = [
  {
    name: "simblenders",
    info: "Simple Blends",
  },
  {
    name: "simswaps",
    info: "Simple Swaps",
  },
  {
    name: "slotblenders",
    info: "Slot Blends",
  },
];

/**
 * Description
 * @param {string} collection
 * @returns {Record<string, any>}
 */
const get_all_blends = async (collection) => {
  const rq = {};

  for (const at of BLENDTABLES) {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: at.name,
      scope: collection,
      limit: 999,
    });

    rq[at.name] = {
      ...at,
      data: q.rows,
    };
  }

  return rq;
};

module.exports = { get_all_blends };
