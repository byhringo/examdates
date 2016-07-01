var express = require('express');
var mongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var app = express();

var local = process.argv.indexOf('-l') != -1;

app.use('/dist', express.static('frontend/dist'));

//Render the front page
app.get('/', (req, res)=>{
	res.sendFile(__dirname+"/frontend/index.html");
});

app.get('/api/getfacultyjson', function (req, res) {
	fs.readFile('facultylist.json', function(err, data) {

		var fileContent = data.toString();

		res.setHeader('Content-Type', 'application/json');
		res.send(fileContent);
	});
})

app.get('/api/getsemesters', function (req, res) {
	var now = new Date();
	//get the year in the format we want: 16 for 2016, 17 for 2017 etc.
	var year = now.getFullYear() - 2000;
	//Find out what the current semester is. Fall semester starts after july 1st (182'nd day of the year)
	var start = new Date(now.getFullYear(), 0, 0);
	var diff = now - start;
	var dayOfYear = Math.floor(diff/(1000*60*60*24));

	//Format: <v/h><year>. Example: v16 means spring 2016, h18 means fall 2018
	semester1 = (dayOfYear < 182 ? "v" : "h") + year;
	semester2 = (dayOfYear < 182 ? "h" : "v") + (dayOfYear < 182 ? year : year+1);

	var fileContent = {semester1: semester1, semester2: semester2};

	res.setHeader('Content-Type', 'application/json');
	res.send(fileContent);

})

app.get('/api/getexams', function (req, res) {
	mongoClient.connect(local ? "mongodb://localhost:27017/uioemner" : process.env.MONGODB_URI, (err, db)=>{
		if(!err){
			var result = db.collection('courses').find({}, {"sort": ["start", 'ascending']}).toArray((err, results)=>{
				res.send(results);
			});
		} else{
			console.log("Could not connect to database.");
			console.dir(err);
		}
	});
})

app.get('/rawdata', (req,res)=>{
	mongoClient.connect(local ? "mongodb://localhost:27017/uioemner" : process.env.MONGODB_URI, (err, db)=>{
		if(!err){
			var result = "<ul>";

			var result = db.collection('courses').find({}, {"sort": ["start", 'ascending']}).toArray((err, results)=>{
				for(var i = 0; i < results.length; i++){
					var exam = results[i];

					result += "<li><a href=\"" + exam.exampageurl + "\">Dato: " + exam.start + (exam.end == "" ? ""  : "til " + exam.end)
							+ ", Emne: " + exam.coursecode + " - " + exam.coursename
							+ ", Type: " + exam.info + "</a></li>";
				}
				res.send(result + "</ul>");
			});
		} else{
			console.log("Could not connect to database.");
			console.dir(err);
		}
	});
});

app.listen(process.env.PORT || 3000, ()=>{
	console.log('Listening on port 3000');
});
