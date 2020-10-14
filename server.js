const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const port = 5000;
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

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
	})

});

app.listen(process.env.PORT || port);
