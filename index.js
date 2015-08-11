/**
  * My News Scraper (MNS)
  *
  */

var request = require( 'request' ),
  parser = require( './lib/parser' );
  utils = require( './lib/utils' ),
  constants = require( './lib/constants' );

var mns = (function() {

  var scrape = function( url, callback ) {
    request( url, function( error, res, body ) {
      if ( !error && res.statusCode == constants.httpCodes.OK ) {
        return callback( error, body );
      }

      error = error || new Error( '404' );
      return callback( error, body );
    })
  }

  return function mnsFactory( options ) {
    // An options argument is mandatory, so we'll throw
    // an error if it is not passed or if it's not an object
    if ( !utils.isObj( options ) ) {
      throw new Error( 'Options are required!' );
    }
    // We also have to check if the options object has a 'type'
    // property, and if it is valid. Supported types are specified
    // in constants.js
    if ( !utils.inObj( constants.mime, options.type ) ) {
      throw new Error( 'Invalid type!' );
    }

    var newScraper = Object.create({
      execute : function( callback ) {
        var self = this,
          parserEngine = parser( self.type, options.url );

        scrape( self.url, function( err, body ) {
          if ( err ) {
            return callback( err );
          }

          parserEngine.parse( body, self.selectors, function( err, items ) {
            if ( err ) {
              return callback( err );
            }
            return callback( null, items );
          });
        });
      }
    }, {
      'type' : {
        value : options.type,
        enumerable : true
      },
      'url' : {
        value : options.url,
        enumerable : true
      },
      'selectors' : {
        value : options.selectors,
        enumerable : true
      }
    });

    return newScraper;
  };
})();

module.exports = mns;
