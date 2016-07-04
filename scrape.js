var request = require('request');
var cheerio = require('cheerio');
var mongoClient = require('mongodb').MongoClient;

var suffixformat = '&page=PAGENUMBER&u-page=PAGENUMBER';
var db;
var colName = 'courses';
var semester1 = "";
var semester2 = "";

var silent = process.argv.indexOf('-s') != -1;
var local = process.argv.indexOf('-l') != -1;

var totalScrapeOperations = 0;
var currentScrapeOperations = 0;

var hits = 0;
var misses = 0;
var errors = 0;

//Connect to the database to start our scraping
mongoClient.connect(local ? "mongodb://localhost:27017/uioemner" : process.env.MONGODB_URI, (err, database)=>{
	if(!err){
		if(!silent) console.log("Successfully connected to database!");
		
		db = database;

		//Setup database containing courses
		clearOldData(initScrape);
	} else{
		console.log("Could not connect to database.");
		console.dir(err);
	}
});

var clearOldData = (callback)=>{
	db.collection(colName).count({}, (err, c)=>{
		if(!silent) console.log("Deleting " + c + " documents from database");
	});
	db.collection(colName).remove({}, callback);
}


//Update the entire course database.
var initScrape = ()=>{
	if(!silent) console.log("Initiating...");
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

	//Complete list of courses for each semester, divided into pages containing 250 results
	//We can't collect separate lists for each semester, as there is some overlap
	var url = 'http://www.uio.no/studier/emner/alle/?filter.semester=' + semester1 + "&filter.semester=" + semester2;

	//Scrape each semester individually
	readCourseList(url);
}

var readCourseList = (courseListUrl)=>{
	var getInfoAllCourses = (error, response, html)=>{
		//Check for errors
		if(!error){
			//Use cheerio to get jQuery-functionality
			var $ = cheerio.load(html);
			
			$('#vrtx-listing-filter-hits').filter(function(){
				//Get the string containing info about total hits and how many are shown on the current page
				//Format: Viser <FIRST>–<LAST> av <TOTAL> emner
				var info = $(this).text().split(' ');

				//We now how many courses to scrape, and how many pages to loop through
				var totalhits = info[3];
				var tablesize = 250;

				//Scrape each semester individually.
				scrapeAllPages(courseListUrl, totalhits, tablesize, semester1);
				scrapeAllPages(courseListUrl, totalhits, tablesize, semester2);
			});
		} else{
			var errormessage = "getInfoAllCourses: Something is wrong with the website: " + courseListUrl + "\n Unable to update course data.";
			console.log(errormessage);
		}
	}

	//Find out how many pages we need to read to have an updated list of all courses
	request(courseListUrl, getInfoAllCourses);
} 

var scrapeAllPages = (courseListUrl, totalhits, tablesize, semester)=>{
	var totalpages = Math.ceil(totalhits/tablesize);
	totalScrapeOperations += parseInt(totalhits);

	if(!silent){
		console.log("Initiating scrape.\nNumber of courses: " + totalhits
		+ "\nCourses per page: " + tablesize
		+ "\nTotal pages: " + totalpages);
	}

	for(var page = 1; page <= totalpages; page++){
		//If less than 250 pages, pagenumbers will cause scraping to fail
		scrapeSinglePage(courseListUrl + (totalpages > 1 ? suffixformat.split("PAGENUMBER").join(page) : ""),
			(page*tablesize < totalhits ? tablesize : totalhits % tablesize), semester);
	}
}

var scrapeSinglePage = (courseListPageUrl, tablesize, semester)=>{
	if(!silent) console.log("Scraping: " + courseListPageUrl + " for " + tablesize + " courses.");

	//Scrape this page for all courses
	request(courseListPageUrl, (error, response, html)=>{
		//Check for errors
		if(!error){
			//Use cheerio to get jQuery-functionality
			var $ = cheerio.load(html);
			
			$('.vrtx-course-description-name').filter(function(){
				//Store the filtered data here
				var data = $(this);

				//Format: <a href="<COURSE PAGE URL>"><COURSE CODE> - <COURSE NAME>
				var coursename = data.children().first().text().split(' - ')[1];
				var coursepageurl = data.children().first().attr('href');

				scrapeSingleCourse(	coursename,
									coursepageurl, 
									db.collection(colName), 
									semester);
			});
		} else{
			var errormessage = "scrapeSinglePage: Something is wrong with the website: " + courseListPageUrl + "\n Unable to update course data.";
			console.log(errormessage);
		}
	});
}

var scrapeSingleCourse = (name, url, col, semester)=>{
	var examPageURL = "http://www.uio.no" + url.replace("index.html", (semester + "/eksamen/index.html"));

	//Scrape this course page for exam info
	request(examPageURL, (error, response, html)=>{
		//Check for errors
		if(!error){
			//Use cheerio to get jQuery-functionality
			var $ = cheerio.load(html);
			
			//Find "Eksamensordning" or "Examination system"
			$('#right-main').filter(function(){
				//Find the relevant HTML-elements of the page
				var elems = getRelevantElements($(this));

				for(var i = 0; i < elems.length; i++){
					if(elems[i].is('p')){
						var paragraphtext = elems[i].text();
						//Check if there are any from-to dates (home exams) first
						var match = findFromToDate(paragraphtext);

						//We found a from-to date
						if(match != null){
							var fromdate = convertToDate(match[0], semester.substring(1));
							var todate = convertToDate(match[1], semester.substring(1));
							registerExam(fromdate, todate, elems[i], name, "http://www.uio.no" + url, examPageURL, col, semester);
						} else{
							match = findSingleDate(paragraphtext);

							//We found a single date
							if(match != null){
								var date = convertToDate(match, semester.substring(1));

								registerExam(date, null, elems[i], name, "http://www.uio.no" + url, examPageURL, semester);
								hits++;
							}
							else{
								misses++;
							}
						}
					}
				}
			});
		} else{
			var errormessage = "scrapeSingleCourse: Something is wrong with the website: " + examPageURL + "\n Unable to update course data.";
			console.log(errormessage);
			errors++;
		}
	});

	currentScrapeOperations++;
	if(!silent) console.log("Progress: " + currentScrapeOperations + "/" + totalScrapeOperations + " | hits: " + hits + " | misses: " + misses + " | errors: " + errors);
}

var registerExam = (dateStart, dateEnd, element, name, url, examPageURL, semester)=>{
	var info = element.prev().text();

	//[0]http:/[1]/[2]www.uio.no/[3]studier/[4]emner/[5]matnat/[6]ifi/[7]INF1510/
	//
	var faculty = url.split("/")[5];
	var institute = url.split("/")[6];
	var code = url.split("/")[7];
	db.collection(colName).insert({	'coursecode': code,
									'coursename': name,
									'coursepageurl': url, 
									'exampageurl': examPageURL,
									'semester': semester,
									'start': dateStart,
									'end': dateEnd,
									'info': info,
									'faculty': faculty,
									'institute': institute
									});
}


//The relevant elements are between a h2 with text = "Examination system" or "Eksamensordning". Return these elements.
var getRelevantElements = (container)=>{
	var elems = container.children();
	//True when we have passed the correct header
	var relevant = false;
	//True when we have found the end of our segment
	var done = false;

	var relevantElements = [];

	for(var i = 0; i < elems.length && !done; i++){
		if(elems.eq(i).text() === "Eksamensordning" || elems.eq(i).text() === "Examination system"){
			relevant = true;
		}
		else if(relevant){
			if(elems.eq(i).is('h2')){
				done = true;
			} else {
				relevantElements.push(elems.eq(i));
			}
		}
	}

	return relevantElements;
}

/*	Find from-to dates (for home-exams) with format:
	Norwegian:  3. juni kl. 09:00 til 6. juni kl. 14:00
	English:	30 May at 09:00 to 2 June at 14:00

	Returns: null if nothing was found, an array with 2 dates if a from-to date was found
*/
var findFromToDate = (text)=>{
	var result = null;

	var n = matchFromToDateNorwegian(text);
	var e = matchFromToDateEnglish(text);

	if(n != null){
		result = n.toString().split(' til ');	//WARNING: These are not normal spaces, but no-break spaces
	}
	if(e != null){
		result = e.toString().split(' to ');	//WARNING: These are not normal spaces, but no-break spaces
	}

	return result;
}

/*	Find single dates (for school-exams) with format:
	Norwegian:  3. juni kl. 09:00
	English:	30 May at 09:00

	Returns: null if nothing was found, a string with the first date if one or more single dates was found
*/
var findSingleDate = (text)=>{
	var result = null;

	var n = matchSingleDateNorwegian(text);
	var e = matchSingleDateEnglish(text);

	if(n != null){
		result = n.toString();
	}
	if(e != null){
		result = e.toString();
	}

	return result;
}

var norwegianMonths = [	'januar', 
						'februar', 
						'mars', 
						'april', 
						'mai', 
						'juni', 
						'juli', 
						'august', 
						'september', 
						'oktober', 
						'november', 
						'desember'];

var englishMonths = [	'january', 
						'february', 
						'march', 
						'april', 
						'may', 
						'june', 
						'july',
				        'august', 
				        'september', 
				        'october', 
				        'november', 
				        'december'];

//Converts a date in uio.no-format in norwegian or english to a Date-object
var convertToDate = (text, year)=>{
	var month = text.split(" ")[1].toLowerCase();

	month = norwegianMonths.indexOf(month) > -1 ? norwegianMonths.indexOf(month) : englishMonths.indexOf(month);

	var day = /\d+/.exec(text).toString();
	var hoursAndMinutes = text.split(" ")[3];
	var hours = hoursAndMinutes.split(":")[0];
	var minutes = hoursAndMinutes.split(":")[1];

	var result = new Date("20" + year, month, day, hours, minutes);

	return result;
}

//REGEX EXPRESSIONS
var rexpSingleNor = /\d+.\s\w+\skl\.\s\d\d:\d\d/;
var rexpSingleEng = /\d+\s\w+\sat\s\d\d:\d\d/;
var rexpFromToNor = /\d+.\s\w+\skl\.\s\d\d:\d\d\stil\s\d+.\s\w+\skl\.\s\d\d:\d\d/;
var rexpFromToEng = /\d+\s\w+\sat\s\d\d:\d\d\sto\s\d+\s\w+\sat\s\d\d:\d\d/;


var matchSingleDateNorwegian = (text)=>{
	return rexpSingleNor.exec(text);
}

var matchSingleDateEnglish = (text)=>{
	return rexpSingleEng.exec(text);
}

var matchFromToDateNorwegian = (text)=>{
	return rexpFromToNor.exec(text);
}

var matchFromToDateEnglish = (text)=>{
	return rexpFromToEng.exec(text);
}
//scrapeSingleCourse(Litterært oversetterseminar, fordypning tysk", "/studier/emner/hf/ilos/TYSK4300/v13/eksamen/index.html", null, "v13");
//scrapeSingleCourse("The Short Story in English", "/studier/emner/hf/ilos/ENG4365/v16/eksamen/index.html", null, "v16");
//scrapeSingleCourse("Digital Bildebehandling", "/studier/emner/matnat/ifi/INF2310/v16/eksamen/index.html", null, "v16");