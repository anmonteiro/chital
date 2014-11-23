mns
===
[![Build Status](https://travis-ci.org/anmonteiro/mns.svg?branch=master)](https://travis-ci.org/anmonteiro/mns)
[![NPM version](https://badge.fury.io/js/mns.svg)](http://badge.fury.io/js/mns)
[![Coverage Status](https://img.shields.io/coveralls/anmonteiro/mns.svg)](https://coveralls.io/r/anmonteiro/mns?branch=master)

My News Scraper - Scrape sites for groups of articles

## Example of usage

```javascript
// require the library
var mns = require( 'mns' );

// initialize the scraper with the options for the website
// you want to get news from.
// example for Hacker News
var scraper = mns({
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

