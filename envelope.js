
var mime = require( 'mime-lib' )
var buffer = require( './lib/buffer' )

/**
 * Envelope
 * @param {String|Buffer} mail
 */
function Envelope( mail ) {
  
  if( !(this instanceof Envelope) )
    return new Envelope( mail )
  
  if( !Buffer.isBuffer( mail ) )
    mail = new Buffer( mail )
  
  var boundary = buffer.indexOf(
    new Buffer( "\r\n\r\n" ), mail
  )
  
  boundary = !~boundary
    ? mail.length - 1
    : boundary
  
  this.parseHeader( mail.slice( 0, boundary ) )
  this.parseBody( mail.slice( boundary ) )
  
}

Envelope.filter = require( './lib/filter' )

Envelope.parse = function( mail ) {
  return new Envelope( mail )
}

/**
 * Envelope prototype
 * @type {Object}
 */
Envelope.prototype = {
  
  /**
   * @param  {Buffer} header
   * @return {Object} 
   */
  parseHeader: function( header ) {
    
    // Buffer -> String
    header = header.toString()
    // Unfold folded header lines
    header = header.replace( /\r\n\s+/g, ' ' )
    // String -> Array of lines
    header = header.split( '\r\n' )
    
    // Splits line up into a key/value pair
    var pattern = /^([^:]*?)[:]\s*?([^\s].*)/
    // Header line count
    var lines = header.length
    var field, key, value
    
    // Convert each line
    for ( i = 0; i < lines; i++ ) {
      // Split line up into a key/value pair
      field = pattern.exec( header[i] )
      // Make the key js-dot-notation accessible
      key   = field[1].toLowerCase().replace( /[^a-z0-9]/gi, '_' )
      value = Envelope.filter( key, field[2].trim() )
      // Store value under it's key
      if ( this[ key ] && this[ key ].push ) {
        this[ key ].push( value )
      } else if ( this[ key ] ) {
        this[ key ] = [ this[ key ], value ]
      } else {
        this[ key ] = value
      }
      
    }
    
    return this
    
  },
  
  /**
   * @param  {Buffer} body
   * @return {Object}
   */
  parseBody: function( body ) {
    
    body = body.toString()
    
    var boundary = this.content_type && this.content_type.boundary
    var bounds   = []
    var index    = -1
    
    if( boundary ) {
      
      var start = '--' + boundary + '\r\n'
      var end   = '--' + boundary + '--'
      
      index = body.indexOf( start )
      
      while( ~index ) {
        bounds.push( index )
        index += start.length
        index  = body.indexOf( start, index )
      }
      
      var b = start.length
      var c = bounds.length
      var i = 0
      
      for( ; i < c; i++ ) {
        this[i] = body.slice( bounds[i] + b, bounds[ i + 1 ] )
        this[i] = new Envelope( this[i] )
      }
      
    } else {
      
      this.body = body.trim()
      
      var isText = this.content_type && /^text/.test( this.content_type[''] )
      
      // Automatically create a buffer from
      // non-text base64 encoded data
      if( !isText && this.content_transfer_encoding === 'base64' ) {
        this.body = new Buffer( this.body, 'base64' )
      }
      
      // Automatically decode text from either
      // base64 or quoted-printable encoding
      if( isText ) {
        if( this.content_transfer_encoding === 'quoted-printable' )
          this.body = mime.decodeQP( this.body )
        if( this.content_transfer_encoding === 'base64' )
          this.body = new Buffer( this.body, 'base64' ).toString()
      }
      
    }
    
    return this
    
  },
  
  /**
   * Branches out header fields under a given slug.
   * 
   * For example, if you have this in your `envelope.header`:
   * 
   *     'list_archive': 'https://github.com/...',
   *     'list_unsubscribe': '<mailto:unsub...@reply.github.com>',
   *     'list_id': '<...github.com>',
   * 
   * Then you can transform your envelope.header with
   * `envelope.header.branch( 'list' )` to:
   * 
   *     'list': {
   *        'archive': 'https://github.com/...',
   *        'unsubscribe': '<mailto:unsub...@reply.github.com>',
   *        'id': '<...github.com>'
   *      }
   * 
   * @param  {Array}   slugs
   * @param  {Boolean} [modify = false]
   * @return {Object}  header
   */
  branchHeader: function( slugs, modify ) {
    
    var slug_count = slugs.length
    var object     = {}
    
    if( slug_count === 0 ) {
      return object
    }
    
    var slug, key, value
    var i, k, swap, pattern
    
    for( i = 0; i < slug_count; i++ ) {
      
      slug    = slugs[i]
      pattern = new RegExp( '^' + slug + '_' )
      swap    = {}
      k       = 0
      
      for( key in this ) {
        if( pattern.test( key ) ) {
          swap[ key.replace( patter, '' ) ] = this[ key ]
          delete this[ key ]
          k++
        }
      }
      
      if( k !== 0 ) {
        if( modify ) this[ slug ] = swap
        object[ slug ] = swap
      }
      
    }
    
    return slug_count > 1
      ? object
      : swap
    
  }
  
}

module.exports = Envelope
