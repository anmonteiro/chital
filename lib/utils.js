module.exports = {
  isObj : function( obj ) {
    return obj !== null && typeof obj === 'object';
  },
  inObj : function( obj, val ) {
  	return this.isObj( obj ) &&
  	  Object.keys( obj ).some(function( elem, idx ) {
  	  	return obj[ elem ] === val;
  	  });
  },
};
