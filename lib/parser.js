var constants = require( './constants' ),
  cheerio = require( 'cheerio' );


var parser = {};

parser[ constants.mime.JSON ] = {
  parse : function( data, selectors, callback ) {
    var self = this,
      obj,
      items = [];

    try {
      obj = JSON.parse( data );
    }
    catch( err ) {
      return callback( new Error( 'Invalid data object' ), null );
    }

    var list = obj;

    // find the list of items specified in the configuration
    selectors.list.split( '.' )
      .forEach(function( elem ) {
        list = list[ elem ];
      });

    list.forEach(function( elem ) {
      self.parseElement( elem, selectors.article, function( err, res) {
        if( err ) {
          return console.log( err );
        }
        return items.push( res );
      })
    });

    return callback(null, items);
  },
  parseElement : function( el, selectors, callback ) {
    var result = {},
      keys = Object.keys( selectors ),
      keysLen = keys.length,
      i = 0;

    for ( ; i < keysLen; i++ ) {
      var key = keys[ i ],
      selector = selectors[ key ],
      element = el;
      
      selector.split( '.' ).forEach(function( elem ) {
        element = element[ elem ];
      });

      if( !element ) {
        return callback( new Error( 'Invalid element' ), null );
      }
      result[ key ] = element;
    }

    return callback( null, result );
  }
};

parser[ constants.mime.HTML ] = {
  parse : function( data, selectors, callback ) {
    var self = this,
      $ = cheerio.load( data ),
      items = [];

    $( selectors.list ).each(function( index, element ) {
      self.parseElement( $( element ), selectors.article, function( err, res ) {
        if( err ) {
          return console.log( err );
        }
        return items.push( res );
      });
    });

    return callback( null, items );
  },
  parseElement : function( $el, selectors, callback ) {
    var result = {},
    keys = Object.keys( selectors ),
    i = 0,
    len = keys.length;

    for ( ; i < len; i++ ) {
      var key = keys[ i ],
      sel = selectors[ key ],
      isObj = utils.isObj( sel ),
      selector = isObj ? sel.selector : sel,
      fn = isObj ? $el.attr : $el.html,
      args = isObj ? [ sel.attr ] : [];

      var element = $el.find( selector ) || {};

      if( !element.length ) {
        return callback( new Error( 'Invalid element' ), null );
      }
      result[ key ] = fn.apply( element, args );
    }

    return callback( null, result );
  }
};

module.exports = function( type ) {
  var engine = parser[ type ];

  return Object.create({
    parse : function( data, selectors, callback ) {
      return engine.parse.call( engine, data, selectors, callback );
    },
    // pending issue to solve this matter (grunt)
    __test_only__ : {
      parseElement : engine.parseElement
    }
  });
};
