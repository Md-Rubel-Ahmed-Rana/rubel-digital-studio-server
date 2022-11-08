// Require all the necessary packages
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Setup middleware
app.use(cors())
app.use(express.json());


// create a global route
app.get("/", (req, res) => {
    res.send("Rubel Studio Server is Running")
})


// Mongodb setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n72f5gi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Server setup
const server = async () => {
    try {
        const Services = client.db("studioData").collection("services");
        const Reviews = client.db("studioData").collection("reviews");

        // create a get route to get all the services from client-side
        app.get("/services", async(req, res) => {
            const query = {};
            const cursor = Services.find(query);
            const services = await cursor.toArray();
            
            res.send(services)
        })
        // create a post route to insert service in database
        app.post("/services", async(req, res) => {
            const data = req.body;
            const service = await Services.insertOne(data)
            console.log(service);
            res.send(service)
        })

        // get a single service by id
        app.get("/services/:id", async(req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)};
            const service = await Services.findOne(query);
            
            res.send(service)
        })
        // create a route for a limited data
        app.get("/limited-service", async(req, res) => {
            const query = {};
            const cursor = Services.find(query);
            const services = await cursor.limit(3).toArray();
            
            res.send(services)
        })

        // add user reviews to database
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await Reviews.insertOne(review)
            res.send(result)
        })
        // create a get route to get all the reviews from client-side
        app.get("/reviews", async (req, res) => {
            const query = {}
            const cursor =  Reviews.find(query);
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        // delete a review from database
        app.delete("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const review = await Reviews.deleteOne(query);
            res.send(review)
        })
    } catch (error) {
        console.log(error);
    }
}

server()


app.listen(process.env.PORT, () => console.log(`Rubel Studio Server is Running on port ${process.env.PORT}`))
