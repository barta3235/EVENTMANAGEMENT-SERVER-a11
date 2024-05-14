const express = require('express')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware
app.use(cors({
    origin: '*',
}))
app.use(express.json())



const cookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n2g3mj5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const serviceCollection = client.db('EventA11M11').collection('serviceCollection');
        const bookingCollection = client.db('EventA11M11').collection('bookingCollection');
        const messageCollection = client.db('EventA11M11').collection('messageCollection');



        app.get('/services', async (req, res) => {
            const result = await serviceCollection.find().toArray()
            res.send(result);
        })

        //services filtered by id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(filter)
            res.send(result)
        })


        app.post('/services', async (req, res) => {
            const service = req.body;
            const em = req.body.email;
            console.log('x1', em)
            console.log('x2', req?.user?.email);
            if (req?.user.email !== em) {
                return res.status(403).send({ message: 'Unauthorized access' })
            }
            const result = await serviceCollection.insertOne(service);
            res.send(result)
        })


        // services filtered by email
        app.get('/allServices/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await serviceCollection.find(query).toArray();
            res.send(result);
        })

        //delete service
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await serviceCollection.deleteOne(filter);
            res.send(result)
        })


        app.put(`/updateService/:id`, async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };


            const updatedData = {
                $set: {
                    servicearea: updateInfo.servicearea,
                    servicename: updateInfo.servicename,
                    imageservice: updateInfo.imageservice,
                    description: updateInfo.description,
                    name: updateInfo.name,
                    email: updateInfo.email,
                    userimage: updateInfo.userimage,
                    price: updateInfo.price
                }
            }

            const result = await serviceCollection.updateOne(filter, updatedData, options)
            res.send(result)
        })






        //booked services
        app.get('/bookedServices', async (req, res) => {
            const result = await bookingCollection.find().toArray()
            res.send(result);
        })

        app.get('/bookedServices/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { useremail: email };
            const result = await bookingCollection.find(filter).toArray()
            res.send(result);
        })

        app.post('/bookedServices', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);

        })


        //review or message section

        app.get('/message', async (req, res) => {
            const result = await messageCollection.find().toArray();
            res.send(result);
        })

        app.post('/message', async (req, res) => {
            const message = req.body;
            const result = await messageCollection.insertOne(message);
            res.send(result);
        })





        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Server running')
})

app.listen(port, () => {
    console.log('Server running');
})