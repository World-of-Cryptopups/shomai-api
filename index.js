const express = require("express");
const { ATOMIC_ENDPOINT } = require("./atomicassets");
const { fetcher, chainfetcher } = require("./fetcher");
const { get_all_blends, get_blend_id, BLENDTABLES } = require("./lib/blends");

const app = express();

/**
 * Index page
 */
app.get("/", (req, res) => {
  return res.send({
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
    return res.status(404).send({
      error: true,
      message: rq.message,
    });
  }

  res.send({
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

    res.send({ error: false, data: q });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).send({
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

    res.status(num).send({
      error: num === 404,
      data: {
        ...k,
        data: q,
      },
      message: num === 404 ? "404 Not Found" : undefined,
    });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).send({
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

    res.send({
      error: false,
      data: q.rows.filter((q) =>
        _collection ? q.collection === _collection : q.collection
      ),
    });
  } catch (e) {
    // if there was a problem, send 500 error
    res.status(500).send({
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
