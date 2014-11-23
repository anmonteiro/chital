var chai = require( 'chai' ),
  expect = chai.expect,
  nock = require( 'nock' ),
  cheerio = require( 'cheerio' ),
  fs = require( 'fs' );

var mns = require( '../' );
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

describe('calling mns without new operator', function() {
  var scraper;

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
  var scraper;

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

  it('should not accept a type which it is unable to parse', function() {
    expect(function() {
      scraper = mns({
        url : "foo.bar",
          type : "text/plain",
          selectors : {
            list : 'baz',
            article : {
              url : {
                selector : "a",
                attr : "href"
              },
              src : "span",
              title : "a"
            }
          }
      });
    }).to.throw('Invalid type!');
  });

  it('should have mandatory properties', function() {
    scraper = mns( reddit );

    expect( scraper ).to.contain.keys( 'type', 'url', 'selectors' );
    expect( scraper.selectors ).to.contain.keys( 'list', 'article' );
    expect( scraper.selectors.article ).to.contain.keys( 'url', 'src', 'title' );
  });

});

describe('mns function execute', function() {
  var api,
    scraper;

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
  	          expect( items[ idx ] ).to.have.keys( Object.keys( hn.selectors.article ) );
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
  	          expect( items[ idx ] ).to.have.keys( Object.keys( echojs.selectors.article ) );
  	        })( i );
  	      }

  	      done();
  	    });
      });

      it('when special_characters_echojs.html is the response', function( done ) {
        api = nock( 'http://www.echojs.com' )
          .get( '/' )
          .replyWithFile( 200, __dirname + '/files/special_characters_echojs.html' );

        scraper = mns( echojs );

        scraper.execute(function( err, items ) {
          expect( err ).to.be.null;
          expect( items ).to.be.ok;

          expect( items ).to.have.length( 30 );

          for (var i = 0; i < items.length; i++) {
            (function( idx ) {
              expect( items[ idx ] ).to.have.keys( Object.keys( echojs.selectors.article ) );
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
              expect( items[ idx ] ).to.have.keys( Object.keys( reddit.selectors.article ) );
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
              expect( items[ idx ] ).to.have.keys( Object.keys( redditNode.selectors.article ) );
            })( i );
          }
          done();
        });
      });
    });
  });
});

