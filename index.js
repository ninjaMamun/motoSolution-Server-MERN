const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const ObjectID = require('mongodb').ObjectID;

const port = process.env.PORT || 5000;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('admins'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Hello MOTO World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iokbq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log("db connected");
    const serviceCollection = client.db("motoSolution").collection("services");
    const reviewCollection = client.db("motoSolution").collection("reviews");
    const appointmentCollection = client.db("motoSolution").collection("appointments");
    const adminCollection = client.db("motoSolution").collection("admins");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })



    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                const filter = { date: date.date }
                if (admins.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {

                        res.send(documents);
                    })
            })
    })

    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const serviceDescription = req.body.serviceDescription;
        const serviceTitle = req.body.serviceTitle;
        const availableSpace = req.body.availableSpace;
        const serviceTime = req.body.serviceTime;
        const servicePrice = req.body.servicePrice;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };



        serviceCollection.insertOne({ serviceTitle, serviceDescription, availableSpace, serviceTime, servicePrice, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })


    app.patch('/updateService/:id', (req, res) => {
        const file = req.files.file;
        const serviceDescription = req.body.serviceDescription;
        const serviceTitle = req.body.serviceTitle;
        const availableSpace = req.body.availableSpace;
        const serviceTime = req.body.serviceTime;
        const servicePrice = req.body.servicePrice;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { serviceTitle: serviceTitle, serviceDescription: serviceDescription, availableSpace: availableSpace, serviceTime: serviceTime, servicePrice: servicePrice, image: image }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })



    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/allAppointment', (req, res) => {
        appointmentCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.patch('/update/:id', (req, res) => {
        appointmentCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { orderStatus: req.body.orderStatus }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })


    app.get('/allServices', (req, res) => {
        serviceCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.patch('/updateService/:id', (req, res) => {
        serviceCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { orderStatus: req.body.orderStatus }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    app.get('/userAppointment', (req, res) => {
        appointmentCollection.find({ email: req.query.email })
            .toArray((err, items) => {
                res.send(items)
            })
    })


    app.get('/usersReviews', (req, res) => {
        reviewCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
        console.log(req.params.id)
        serviceCollection.deleteOne({ _id: ObjectID(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })






});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});