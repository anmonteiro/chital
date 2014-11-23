var chai = require( 'chai' ),
  expect = chai.expect,
  cheerio = require( 'cheerio' ),
  fs = require( 'fs' ),
  constants = require( '../lib/constants' ),
  scraper = require( '../lib/parser' );

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


describe('HTML parser', function() {
  var parser = scraper( constants.mime.HTML );
  describe('parse article element function', function () {
    var el,
      invalidEl,
      obj,
      $;

    afterEach(function() {
      el = null;
      invalidEl = null;
      obj = null;
    });

    it('should parse one DOM element with the article link into an object', function () {
      el = [
        '<td class="title"><a href="http://www.buildyourownlisp.com/">',
        'Learn C and build your own programming language</a>',
        '<span class="comhead"> (buildyourownlisp.com) </span></td>'
      ].join( '' );
      obj = {
        title : 'Learn C and build your own programming language',
        url: 'http://www.buildyourownlisp.com/',
        src: ' (buildyourownlisp.com) ',
      };
      $ = cheerio.load(el);

      parser.__test_only__.parseElement($(el), hn.selectors.article, function(err, art) {
        expect(err).to.be.null;
        expect(err).not.to.be.undefined;
        expect(art).to.be.ok;
        expect(art).to.be.an('object');
        expect(art).to.not.be.empty;
        expect(art).to.eql(obj);
      });
    });

    it('should parse titles with special characters', function () {
      el = [
        '<td class="title"><a href="http://www.foo.tag/">',
        'The &lt;foo&gt; tag</a>',
        '<span class="comhead"> (foo.tag) </span></td>'
      ].join( '' );
      obj = {
        title : 'The &lt;foo&gt; tag',
        url: 'http://www.foo.tag/',
        src: ' (foo.tag) ',
      };
      $ = cheerio.load(el);

      parser.__test_only__.parseElement($(el), hn.selectors.article, function(err, art) {
        expect(err).to.be.null;
        expect(err).not.to.be.undefined;
        expect(art).to.be.ok;
        expect(art).to.be.an('object');
        expect(art).to.not.be.empty;
        expect(art).to.eql(obj);
      });
    });
  });
});


describe('JSON parser', function() {
  var parser = scraper( constants.mime.JSON );

  describe('parse article element function', function () {
    it('should extract wanted parts from JS object', function() {
      var el = {
        "data" : {
          "domain" : "pasm.pis.to",
          "url" : "http://pasm.pis.to/",
          "title" : "Piston x86-64 Assembler (works in browser and Node.js)"
        }
      },
        obj = {
          title : "Piston x86-64 Assembler (works in browser and Node.js)",
          url: "http://pasm.pis.to/",
          src: "pasm.pis.to",
        };
      
      parser.__test_only__.parseElement( el, reddit.selectors.article, function(err, art) {
        expect(err).to.be.null;
        expect(err).not.to.be.undefined;
        expect(art).to.be.ok;
        expect(art).to.be.an('object');
        expect(art).to.not.be.empty;
        expect(art).to.eql(obj);
      });
    });
  });
});

