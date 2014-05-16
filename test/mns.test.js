var chai = require( 'chai' ),
  should = chai.should(),
  expect = chai.expect,
  nock = require( 'nock' ),
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

describe('calling mns without new operator', function() {

  afterEach(function() {
    scraper = null;
  });

  it('should return an object which is a prototype of mns', function() {
    scraper = mns(echojs);
    expect(scraper).to.be.ok;
  });

  it('should not pollute the global scope', function() {
    scraper = mns(reddit);
    expect(global).to.exist;
    expect(global).to.not.contain.keys('items','type');
  });
});

describe('an mns object', function() {

  afterEach(function() {
    scraper = null;
  });

  it('should be able to accept new configuration', function() {
    scraper = mns(reddit);
    expect(scraper).to.be.ok;

    scraper = mns(echojs);
    expect(scraper).to.be.ok;

  });

  it('should throw an error when invalid configuration is passed', function() {
    expect(function() {
      scraper = mns( true );
    }).to.throw();
    
    expect(function() {
      scraper = mns();
    }).to.throw();

    expect(function() {
      scraper = mns( 'not an object' );
    }).to.throw();

    expect(function() {
      scraper = mns( invalid_echojs );
    }).to.throw();

  });

  it('should have mandatory properties', function() {
    scraper = mns( reddit );
    expect( scraper ).to.contain.keys( 'type', 'url', 'listSelector', 'articleSelector' );
    expect( scraper.articleSelector ).to.contain.keys( 'url', 'src', 'title' );
  });

  /*it('should fallback to default properties', function () {
    scraper = mns();
    expect( scraper ).to.contain.keys( 'type', 'url', 'groupSelector', 'articleSelector' );
  });*/

  it('should match passed options', function() {
    scraper = mns( hn );
    expect( scraper ).to.contain.keys( 'url', 'type', 'listSelector', 'articleSelector' );
    expect( scraper.url ).to.equal( hn.url );
    expect( scraper.type ).to.equal( hn.type );
    expect( scraper.listSelector ).to.eql( hn.listSelector );
    expect( scraper.articleSelector ).to.eql( hn.articleSelector );

    scraper = mns( echojs );
    expect( scraper ).to.contain.keys( 'url', 'type', 'listSelector', 'articleSelector' );
    expect( scraper.url ).to.equal( echojs.url );
    expect( scraper.type ).to.equal( echojs.type );
    expect( scraper.listSelector ).to.eql( echojs.listSelector );
    expect( scraper.articleSelector ).to.eql( echojs.articleSelector );

  });

});

describe('HNScraper parse article element function', function () {
  var el,
    invalidEl,
    obj,
    $,
    scraper;

  beforeEach(function() {
    
  });

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

describe('mns function execute', function() {
  var api;

  describe('with html parser', function() {
    afterEach(function() {
      scraper = null;
      nock.cleanAll();
    });

    describe('should return a list of 30 well formed items', function() {
      it('when hn.html is the response', function( done ) {
  	    api = nock( 'http://news.ycombinator.com' )
  	      .get( '/news' )
  	      .replyWithFile( 200, __dirname + '/files/hn.html' );

  	    scraper = mns( hn );

  	    scraper.execute(function( err, items ) {
  	      expect( err ).to.be.null;
  	      expect( items ).not.to.be.undefined;

  	      expect( items ).to.have.length( 30 );

  	      for (var i = 0; i < 30; i++) {
  	        (function( idx ) {
  	          expect( items[ idx ] ).to.have.keys( Object.keys( hn.articleSelector ) );
  	        })( i );
  	      }

  	      done();
  	    });
	    });

  	  it('when echojs.html is the response', function( done ) {
  	    api = nock( 'http://www.echojs.com' )
  	      .get( '/' )
  	      .replyWithFile( 200, __dirname + '/files/echojs.html' );

  	    scraper = mns( echojs );

        scraper.execute(function( err, items ) {
  	      expect( err ).to.be.null;
  	      expect( items ).to.be.ok;

  	      expect( items ).to.have.length( 30 );

  	      for (var i = 0; i < items.length; i++) {
  	        (function( idx ) {
  	          expect( items[ idx ] ).to.have.keys( Object.keys( echojs.articleSelector ) );
  	        })( i );
  	      }

  	      done();
  	    });
      });
    });
  });

  describe('with json parser', function() {
    describe('should return a list of 25/26 items', function() {
      it('when reddit.json (/r/javascript) is the response', function( done ) {
        api = nock( 'http://www.reddit.com' )
          .get( '/r/javascript/.json' )
          .replyWithFile( 200, __dirname + '/files/reddit-js.json' );
        
        scraper = mns( reddit );

        scraper.execute(function(err, items) {
          expect( err ).to.be.null;

          expect( items ).to.be.ok;
          expect( items ).to.have.length.within( 25, 26 );

          for (var i = 0; i < items.length; i++) {
            (function( idx ) {
              expect( items[ idx ] ).to.have.keys( Object.keys( reddit.articleSelector ) );
            })( i );
          }
          done();
        });
      });

      it('when reddit.json (/r/node) is the response', function( done ) {
        api = nock( 'http://www.reddit.com' )
          .get( '/r/node/.json' )
          .replyWithFile( 200, __dirname + '/files/reddit-js.json' );
        
        scraper = mns( redditNode );

        scraper.execute(function(err, items) {
          expect( err ).to.be.null;

          expect( items ).to.be.ok;
          expect( items ).to.have.length.within( 25, 26 );

          for (var i = 0; i < items.length; i++) {
            (function( idx ) {
              expect( items[ idx ] ).to.have.keys( Object.keys( redditNode.articleSelector ) );
            })( i );
          }
          done();
        });
      });
    });
  });
});

