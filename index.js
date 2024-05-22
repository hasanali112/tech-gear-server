const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.4gey7ap.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const getGadgetCategoryCollection = client
      .db("tech-gear")
      .collection("categories");

    const getGadgetProductCollection = client
      .db("tech-gear")
      .collection("allproducts");

    app.get("/flash-sale", async (req, res) => {
      const productsAll = await getGadgetProductCollection
        .find({ flashSale: true })
        .toArray();
      res.send(productsAll);
    });

    //get categories
    app.get("/categories", async (req, res) => {
      const result = await getGadgetCategoryCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/allproducts", async (req, res) => {
      const productsAll = await getGadgetProductCollection
        .find({ ratings: { $gte: 4.5 } })
        .toArray();
      res.send(productsAll);
    });
    app.get("/all-products", async (req, res) => {
      const productsAll = await getGadgetProductCollection.find({}).toArray();
      res.send(productsAll);
    });

    app.get("/brand", async (req, res) => {
      const { brand, minPrice, maxPrice, rating } = req.query;
      let query = {};

      if (brand && brand !== "all-product") {
        query.brand = { $regex: brand, $options: "i" };
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseInt(minPrice);
        if (maxPrice) query.price.$lte = parseInt(maxPrice);
      }

      if (rating) {
        query.ratings = { $gte: parseFloat(rating) };
      }

      const brands = await getGadgetProductCollection.find(query).toArray();

      res.send(brands);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await getGadgetProductCollection.findOne(query);
      res.send(result);
    });

    app.get("/", (req, res) => {
      res.send("Tech Gear is running");
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Gadget running  port is ${port}`);
});
