const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://task-management-6aed6.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b6ov8m0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const database = client.db("taskManagement");
    const tasksCollection = database.collection("tasks");
    const usersCollection = database.collection("users");

    // Get all tasks
    app.get("/api/tasks", async (req, res) => {
      const cursor = tasksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Post a new task
    app.post("/api/tasks", async (req, res) => {
      const task = req.body;
      // console.log(task);
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    // save or update a user in db
    app.post("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = req.body;
      // check if user exists in db
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return res.send(isExist);
      }
      const result = await usersCollection.insertOne({
        ...user,
        // role: "User",
        timestamp: Date.now(),
      });
      res.send(result);
    });

    // Update tasks
    app.patch("/api/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const task = req.body;
      // console.log(id, task);

      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTask = {
        $set: {
          // category: task.category,
          ...task,
        },
      };

      const result = await tasksCollection.updateOne(
        query,
        updatedTask,
        options
      );

      res.send(result);
    });

    // Delete task
    app.delete("/api/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome To The Task Management System Sercer site..");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
