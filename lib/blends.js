const { chainfetcher } = require("../fetcher");

/**
 * @type {Record<string, {name: string, info: string}>}
 */
const BLENDTABLES = {
  sb: {
    name: "simblenders",
    info: "Simple Blends",
  },
  sw: {
    name: "simswaps",
    info: "Simple Swaps",
  },
  sl: {
    name: "slotblenders",
    info: "Slot Blends",
  },
};

/**
 * Description
 * @param {string} collection
 * @returns {Record<string, any>}
 */
const get_all_blends = async (collection) => {
  const rq = {};

  for (const [, at] of Object.entries(BLENDTABLES)) {
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

/**
 * Description
 * @param {string} collection
 * @param {string} table
 * @param {string} id
 * @returns {Promise<[number, Record<string, any>]>}
 */
const get_blend_id = async (collection, table, id) => {
  const q = await chainfetcher("/get_table_rows", {
    json: true,
    code: process.env.CONTRACT,
    scope: collection,
    table: table,
    limit: 1,
    lower_bound: id,
  });

  if (q.rows.length === 0) {
    return [404, {}];
  }

  return [200, q.rows[0]];
};

module.exports = { get_all_blends, BLENDTABLES, get_blend_id };
