const express = require("express");
const cors = require("cors");

const { ATOMIC_ENDPOINT } = require("./atomicassets");
const { fetcher, chainfetcher } = require("./fetcher");
const { get_all_blends, get_blend_id, BLENDTABLES } = require("./lib/blends");

const app = express();

// cors
app.use(cors());

/**
 * Index page
 */
app.get("/", (req, res) => {
  return res.json({
    message: "API Data for Shomaii Blends",
  });
});

/**
 * Proxy to getting the collection from the atomicassets api.
 */
app.get("/collections/:collection", async (req, res) => {
  const { collection } = req.params;

  const rq = await fetcher(ATOMIC_ENDPOINT + `/collections/${collection}`);
  if (!rq.success) {
    return res.status(404).json({
      error: true,
      message: rq.message,
    });
  }

  res.json({
    error: false,
    data: rq.data,
  });
});

/**
 * Get the blends of the collection.
 */
app.get("/blends/:collection", async (req, res) => {
  const { collection } = req.params;

  try {
    const q = await get_all_blends(collection);

    res.json({ error: false, data: q });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).json({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Get the specific config of a blender.
 */
app.get("/blends/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  const [_id, type] = id.split("-");

  const k = BLENDTABLES[type];
  if (!k) return;
  try {
    const [num, q] = await get_blend_id(collection, k.name, _id);

    res.status(num).json({
      error: num === 404,
      data: {
        ...k,
        data: q,
      },
      message: num === 404 ? "404 Not Found" : undefined,
    });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).json({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Get ReFUND assets.
 */
app.get("/refunds/:wallet", async (req, res) => {
  const { wallet } = req.params;
  const { collection } = req.query;

  const _collection = collection
    ? Array.isArray(collection)
      ? collection.join("")
      : String(collection)
    : "";

  try {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: "nftrefunds",
      scope: wallet,
      limit: 999,
    });

    res.json({
      error: false,
      data: q.rows.filter((q) =>
        _collection ? q.collection === _collection : q.collection
      ),
    });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).json({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Fetch the blendconfig of the blender id.
 */
app.get("/blendconfig", async (req, res) => {
  const { blenderid, collection } = req.query;
  if (blenderid === "" || collection === "") {
    res.status(200).json({});
    return;
  }

  try {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: "blendconfig",
      scope: collection,
      limit: 1,
      lower_bound: blenderid,
      upper_bound: blenderid,
    });

    res.status(200).json({
      error: false,
      data: q.rows[0] ?? null,
    });
  } catch (e) {
    console.error(e);

    // if there was a problem, send 500 error
    res.status(500).send({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Get the blend stats / total uses.
 */
app.get("/blendstats", async (req, res) => {
  const { blenderid, collection } = req.query;
  if (blenderid === "" || collection === "") {
    res.status(200).json({});
    return;
  }

  try {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: "blendstats",
      scope: collection,
      limit: 1,
      lower_bound: blenderid,
      upper_bound: blenderid,
    });

    res.status(200).json({
      error: false,
      data: q.rows[0] ?? null,
    });
  } catch (e) {
    console.error(e);

    // if there was a problem, send 500 error
    res.status(500).send({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Get the blend user use.
 */
app.get("/blenduseruses", async (req, res) => {
  const { blenderid, user } = req.query;
  if (blenderid === "" || user === "") {
    res.status(200).json({});
    return;
  }

  try {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: "blendcfuses",
      scope: user,
      limit: 1,
      lower_bound: blenderid,
      upper_bound: blenderid,
    });

    res.status(200).json({
      error: false,
      data: q.rows[0] ?? null,
    });
  } catch (e) {
    console.error(e);

    // if there was a problem, send 500 error
    res.status(500).send({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Get the whitelisted and blacklisted collections.
 */
app.get("/rambalances", async (req, res) => {
  const { collection } = req.query;
  if (collection === "") {
    res.status(200).json({});
    return;
  }

  try {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: "rambalances",
      index_positon: 1,
      key_type: "name",
      scope: process.env.CONTRACT,
      limit: 1,
      lower_bound: collection,
      upper_bound: collection,
    });

    // send the whitelists
    res.json({ error: false, data: q.rows[0] });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).json({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Get the whitelisted and blacklisted collections.
 */
app.get("/servicelist", async (req, res) => {
  try {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: "sysconfigs",
      scope: process.env.CONTRACT,
      limit: 1,
    });

    // send the whitelists
    res.json({ error: false, data: q.rows[0] });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).json({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

/**
 * Get claims of a user in a specific collection.
 */
app.get("/claims/:collection", async (req, res) => {
  const { collection } = req.params;
  const { wallet } = req.query;

  const _wallet = wallet
    ? Array.isArray(wallet)
      ? wallet.join("")
      : String(wallet)
    : "";

  try {
    const q = await chainfetcher("/get_table_rows", {
      json: true,
      code: process.env.CONTRACT,
      table: "claimassets",
      scope: collection,
      limit: 999,
    });

    res.json({
      error: false,
      data: q.rows.filter((q) => (_wallet ? q.blender === _wallet : q.blender)),
    });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).json({
      error: true,
      message: `Internal server error. Catch Message: ${String(e)}`,
    });
  }
});

// run this only in dev environment
if (process.env.NODE_ENV === "development") {
  app.listen(8000, () => {
    console.log("Listening on http://localhost:8000");
  });
}

module.exports = app;
