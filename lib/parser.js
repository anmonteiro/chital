var constants = require( './constants' ),
  cheerio = require( 'cheerio' );

var type2parser = {};

type2parser[ constants.mime.JSON ] = function( data, callback ) {
  var self = this,
    obj;
  try {
    obj = JSON.parse( data );
    var list = obj;

    self.listSelector.split( '.' )
      .forEach(function( elem ) {
        list = list[ elem ];
      });

    list.forEach(function( elem, idx ) {
      var i = 0,
        result = {},
        keys = Object.keys( self.articleSelector ),
        len = keys.length;

      for ( ; i < len; i++ ) {
        var key = keys[ i ],
          selector = self.articleSelector[ key ],
          element = elem;

        selector.split( '.' ).forEach(function( el ) {
          element = element[ el ];
        });

        if( !element ) {
          return callback( new Error( 'Invalid element' ), null );
        }
        result[ key ] = element;
      }

      return callback( null, result );
    });
  }
  catch( err ) {
    return console.log( err );
  }
};

type2parser[ constants.mime.HTML ] = function( data, callback ) {
  var self = this,
    $ = cheerio.load( data );

  $( self.listSelector ).each(function( index, element ) {
    self.parseArticleElement( $( element ), function( err, res ) {
      if( err ) {
        return callback( err, null );
      }
      return callback( null, res );
    });
  });
};


module.exports = type2parser;
