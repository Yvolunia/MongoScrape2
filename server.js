var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

//Scraping Tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

//Initialize Express
var app = express();

// Use morgan logger for loggin requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({extended: true}));
// Use express static as a public directory
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/wsjPopulater");


// Routes

app.get("/index", function (req, res) {

  // Make request to grab the HTML from the Wall Street Journal
  axios.get("https://www.wsj.com/news/whats-news").then(function (response) {

    // Load the HTML into cheerio
    var $ = cheerio.load(response.data);

    $("div.headline-container").each(function (i, element) {

      // Make an empty array for saving our scraped info
      var result = {};

      result.headline = $(this)
        .children("h3")
        .text();
       
        result.link = $(this)
        .children("h3").children("a")
        .attr("href");

        result.summary = $(this)
        .children("div.summary-container").children("p")
        .text();

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function (dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function (err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });

      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    });
  });

// Route for getting all Articles 
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id
app.get("/article/:id", function (req, res) {
  db.Article.findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle)
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/article/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote.id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});