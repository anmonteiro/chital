/**
  * My News Scraper (MNS)
  *
  */

var request = require( 'request' ),
  parser = require( './parser' );
  _ = require( './utils' );

var mns = (function() {

  var items = [];

  var scraper = {
    // the callback in this function will be called from every article
    // returned by the parser
    parse : function( body, callback ) {
      return parser[ this.type ].call( this, body, callback );
    },
    execute : function( callback ) {
      var self = this;

      items = [];

      self.scrape(function( err, body ) {
        if ( err ) {
          return callback(err);
        }

        // the callback here will be called for every
        // article returned from the parser
        // this doesn't smell right, should refactor
        self.parse( body, function( err, item ) {
          if ( err ) {
            return console.log( err );
          }
          return items.push( item );
        });

        return callback( null, items );
      });
    },
    scrape : function( callback ) {
      request( this.url, function( error, res, body ) {
        if ( !error && res.statusCode == 200 ) {
          return callback(error, body);
        }

        error = error || new Error( '404' );
        return callback(error, body);
      });
    },
    parseArticleElement : function( $el, callback ) {
      var result = {},
        keys = Object.keys( this.articleSelector ),
        i = 0,
        len = keys.length;

      for ( ; i < len; i++ ) {
        var key = keys[ i ],
          sel = this.articleSelector[ key ],
          isObj = _.isObj( sel ),
          selector = isObj ? sel.selector : sel,
          fn = isObj ? $el.attr : $el.html,
          args = isObj ? [ sel.attr ] : [];

        var element = $el.find( selector ) || {};

        if( !element.length ) {
          return callback( new Error( 'Invalid element' ), null );
        }
        result[ key ] = fn.apply( element, args );
      }
      
      return callback( null, result) ;
    }
  };

  return function mnsConstructor( options ) {
    // An options argument is mandatory, so we'll throw
    // an error if it is not passed or if it's not an object
    if ( !_.isObj( options ) ) {
      throw new Error( 'Options are required!' );
    }
    // We also have to check if the options object has a 'type'
    // property, and if it is valid. Supported types are specified
    // in constants.js
    if ( !_.inObj( options, options.type ) ) {
      throw new Error( 'Invalid type!' );
    }
    
    var newScraper = Object.create( scraper );

    newScraper.type = options.type;
    newScraper.url = options.url;
    newScraper.listSelector = options.listSelector;
    newScraper.articleSelector = options.articleSelector;

    return newScraper;
  };
})();

module.exports = mns;

