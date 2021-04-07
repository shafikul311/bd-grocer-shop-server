const express = require("express");
const app = express();

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const cors = require("cors");
const bodyParser = require("body-parser");

const port = process.env.PORT || 5080;

require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello DB working!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ywwhy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log("connected server", err);
  const productCollection = client.db("fresh-velly").collection("products");
  const ordersCollection = client.db("fresh-velly").collection("orders");

  //get product data from admin
  app.get("/products", (req, res) => {
    productCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //order placed data saved in mdb
  app.post("/orders", (req, res) => {
    const newOrder = req.body;
    ordersCollection.insertOne(newOrder).then((result) => {
      // console.log('Order placed',newOrder)
      res.send(result.insertedCount > 0);
    });
  });

  //get product data from order and email
  app.get("/orders", (req, res) => {
    // console.log(req.query.email)
    ordersCollection
      .find({ email: req.query.email })
      .toArray((err, document) => {
        res.send(document);
      });
  });

  // Get Product from Database using id
  app.get("/products/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    // console.log(id)
    productCollection.find({ _id: id }).toArray((err, product) => {
      res.send(product);
    });
  });

  // single product add
  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;

    productCollection.insertOne(newProduct).then((result) => {
      // console.log('inserted one p',result.insertedCount)
      res.send(result.insertedCount > 0);
    });
  });

  // app.delete('/products', function (req, res) {
  //   res.send('DELETE request to homepage')
  // })

  // client.close();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
