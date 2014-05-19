var chai = require( 'chai' ),
  should = chai.should(),
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

describe('parse article element function', function () {
  var el,
    invalidEl,
    obj,
    $,
    scraper;

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

    scraper = mns( hn );
    scraper.parseArticleElement($(el), function(err, art) {
      expect(err).to.be.null;
      expect(err).not.to.be.undefined;
      art.should.be.ok;
      art.should.be.an('object');
      art.should.not.be.empty;
      art.should.eql(obj);
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
    scraper = mns( hn );
    scraper.parseArticleElement($(el), function(err, art) {
      expect(err).to.be.null;
      expect(err).not.to.be.undefined;
      art.should.be.ok;
      art.should.be.an('object');
      art.should.not.be.empty;
      art.should.eql(obj);
    });
  });
});