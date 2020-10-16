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

	const adminCollection = client
		.db(`${process.env.DB_NAME}`)
		.collection("admins");

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

	//update status

	app.patch("/updateStatus/:id", (req, res) => {
		usersCollection
			.updateOne(
				{ _id: ObjectId(req.params.id) },
				{
					$set: { status: req.body.status },
				}
			)
			.then((resp) => {
				res.send(resp);
			});
	});

	//getting individual users

	app.get("/user", (req, res) => {
		const email = req.query.email;
		usersCollection.find({ email }).toArray((err, docs) => {
			res.send(docs);
		});
	});

	//getting all the admins

	app.get("/admin", (req, res) => {
		adminCollection.find({}).toArray((err, docs) => {
			res.send(docs);
		});
	});

	//adding an admin

	app.post("/addAdmin", (req, res) => {
		const email = req.body;
		adminCollection.insertOne(email).then((response) => {
			res.send(response);
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

	//adding a service

	app.post("/addService", (req, res) => {
		const file = req.files.file;
		const title = req.body.title;
		const description = req.body.description;
		const filePath = `${__dirname}/services/${file.name}`;
		file.mv(filePath, (err) => {
			if (err) {
				return res.status(500).send({ msg: "Failed To upload image" });
			}

			const newImage = fs.readFileSync(filePath);
			const encImg = newImage.toString("base64");

			let image = {
				contentType: req.files.file.mimetype,
				size: req.files.file.size,
				img: Buffer.from(encImg, "base64"),
			};

			serviceCollection
				.insertOne({ title, description, image })
				.then((response) => {
					fs.remove(filePath, (error) => {
						if (error) console.log(error);
						res.send(response.insertedCount > 0);
					});
				});
		});
	});

	//adding user Info

	app.post("/users", (req, res) => {
		const users = req.body;
		usersCollection.insertOne(users).then((resp) => {
			res.send(resp);
		});
	});
});

app.listen(process.env.PORT || port);
