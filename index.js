// Require all the necessary packages
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
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
            const result = await Reviews.insertOne(review);
            res.send(result)
        })

        // // create a jwt route to generate json web token;
        // app.post("/jwt", async (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN);
        //     console.log(token);
        //     res.send({ token })
        // })

        // create a get route to get all the reviews for a user from client-side
        app.get("/reviews", async (req, res) => {
            const email = req.query.email;
            const photo = req.query.photo;
            let query = {}
            if (email){
                query = { email: email }
            } else if (photo){
                query = { photo: photo }
            }
            const cursor =  Reviews.find(query).sort({time: -1});
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        // create a dymanic route to load a single review
        app.get("/reviews/:id", async(req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const review = await Reviews.findOne(query);
            res.send(review)
        })

        // update user review
        app.put("/reviews/:id", async (req, res) => {
            const review = req.body;
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const option = { upsert: true };
            const updatedOrder = {
                $set: {
                    customer_review: review.customer_review,
                }
            }
            const result = await Reviews.updateOne(query, updatedOrder, option);
            console.log(result);
            res.send(result)
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
