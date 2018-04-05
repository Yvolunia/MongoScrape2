var cheerio = require("cheerio");
var request = require("request");

console.log("\n******************************************\n" +
            "Look at top news stories from the Wall Street Journal. \n" +
            "Then grab the article URL, image, and timestamp." +
            "\n******************************************\n");

// Make request to grab the HTML from the Wall Street Journal
request("https://www.wsj.com/news/whats-news", function(error, response, html) {

  // Load the HTML into cheerio
  var $ = cheerio.load(html);

  // Make an empty array for saving our scraped info
  var results = [];

  $("h3.headline").each(function(i, element) {

    var headline = $(element).text();
    var link = $(element).children().attr("href");


    results.push({
      Headline: headline,
      Link: link
  
    });

  });

   $("div.summary-container").each(function(i, element) {

    var summary = $(element).text();

    results.push({
      Summary: summary

     });

  });

  console.log(results);

});
