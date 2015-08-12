chital
===
[![Build Status](https://travis-ci.org/anmonteiro/chital.svg?branch=master)](https://travis-ci.org/anmonteiro/chital)
[![npm version](https://badge.fury.io/js/chital.svg)](http://badge.fury.io/js/chital)
[![Coverage Status](https://coveralls.io/repos/anmonteiro/chital/badge.svg?branch=master&service=github)](https://coveralls.io/github/anmonteiro/chital?branch=master)

Scrape web pages for groups of articles

## Example of usage

```javascript
// require the library
var chital = require( 'chital' );

// initialize the scraper with the options for the website
// you want to get news from.
// example for Hacker News
var scraper = chital({
  url : "http://news.ycombinator.com/news",
  type : "text/html",
  selectors : {
    // a CSS selector that gathers every article you want to scrape
    list : "td:not([align]).title",
    // a CSS selector for each property you want to gather from
    // the article listing (relative to the listSelector)
    article : {
      // you can pass an object with keys
      // selector and attr. In this case, it specifies that
      // you want to gather the href attribute from the "a"
      // selector
      url : {
        selector : "a",
        attr : "href"
      },
      // or simply a CSS selector that's relative to the
      // listSelector which you specified before
      src : "span",
      title : "a"
    }
  }
});

// execute the scraping itself
scraper.execute(function( err, items ) {
  if ( err ) {
    return console.log( err );
  }
  // do something with the items array.
  // every item in the array has the properties you
  // passed in the article selector object previously.
  // In this case, this means you'll get an object with
  // properties url, title and src.
});

```

Some website configurations reside in test/files/sitesToScrape.json

## Disclaimer

This is still a work in progress, under active development. At the moment, the library is in alpha stage, providing very basic functionality. If you have any question, feel free to open an issue on this repository.
