const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const port = 5000;
const fs = require("fs-extra");
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wbcma.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

client.connect((err) => {
	const serviceCollection = client
		.db(`${process.env.DB_NAME}`)
		.collection("services");

	const feedbackCollection = client
		.db(`${process.env.DB_NAME}`)
		.collection("feedbacks");

	const usersCollection = client
		.db(`${process.env.DB_NAME}`)
		.collection("users");

	console.log("database Connected successfully");

	//getting all the services

	app.get("/", (req, res) => {
		serviceCollection.find({}).toArray((err, docs) => {
			res.send(docs);
		});
	});

	//getting all the feedbacks

	app.get("/feedback", (req, res) => {
		feedbackCollection.find({}).toArray((err, docs) => {
			res.send(docs);
		});
	});

    //getting all the users

	app.get("/users", (req, res) => {
		usersCollection.find({}).toArray((err, docs) => {
			res.send(docs);
		});
	});

	//posting a review

	app.post("/review", (req, res) => {
		const reviews = req.body;
		//console.log(users);
		feedbackCollection.insertOne(reviews).then((response) => {
			res.send(response);
		});
	});

	//adding user Info

	app.post("/users", (req, res) => {
		// const file = req.files.file;
		// const name = req.body.name;
		// const email = req.body.email;
		// const service = req.body.service;
		// const details = req.body.details;
		// const price = req.body.price;
        // const status = req.body.status;

		// const filePath = `${__dirname}/services/${file.name}`;
		// file.mv(filePath);
		// console.log(filePath);

		// const newImage = fs.readFileSync(filePath);
		// const encImg = newImage.toString('base64');
        // console.log(newImage,encImg);

		// let image = {
		// 	contentType: req.files.file.mimetype,
		// 	size: req.files.file.size,
		// 	img:  Buffer.from(encImg, 'base64'),
		// };
		// console.log(image, name, email, service, details, price);
        const users = req.body
		usersCollection
			.insertOne(users )
			.then((resp) => {
				res.send(resp);
			});
	});
});

app.listen(process.env.PORT || port);
