const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// middlewares 
const gateman = (req,res,next)=>{
    const token = req.cookies
    console.log(token);
    // client does not sent token 
    
    
}

// mongodb url 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tyaaup2.mongodb.net/cleanCo?retryWrites=true&w=majority`;

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
    await client.connect();
    
    const serviceCollection = client.db('cleanCo').collection('services');
    const bookingCollection = client.db('cleanCo').collection('bookings');
  
    // all data get 
    app.get('/api/v1/services', async(req,res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // booking data post in database
    app.post('/api/v1/user/create-bookings', async(req,res)=>{
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
    })
    // user specifiq bookings 
    

    // delete data 
    app.delete('/api/v1/user/cancel-booking/:bookingId/', async(req,res)=>{
        const id = req.params.bookingId;
        const query = {_id: new ObjectId(id)};
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
    })

    // jwt token auth route start 
    app.post('/api/v1/auth/access-token', async(req,res)=>{
    //   creating token and send client 
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN,{ expiresIn: '5h'});
      res.cookie('token', token, {
        httpOnly:true,
        secure:false,
        sameSite:'none'
      }).send({success:true});
    


    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',async(req,res)=>{
    res.send({message:'Welcome to our server'});
})

app.listen(port, ()=>{
    console.log(`cleaning co server running on port: ${port}`);
})