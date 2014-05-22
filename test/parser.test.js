var chai = require( 'chai' ),
  expect = chai.expect,
  cheerio = require( 'cheerio' ),
  fs = require( 'fs' );

var mns = require( '../lib/mns' );
var sites = fs.readFileSync( __dirname + '/files/sitesToScrape.json' );

sites = JSON.parse( sites );

var reddit = sites[ 'reddit-js' ],
  echojs = sites.echojs,
  invalid_echojs = [
    '{"name" : "EchoJS","url" : "http://www.echojs.com",',
    '"links" : [ "/r/javascript", "/r/node" ], "listSelector" : ""}'
  ].join(''),
  hn = sites.hn,
  redditNode = sites[ 'reddit-node' ];

invalid_echojs = JSON.parse( invalid_echojs );
var scraper;
