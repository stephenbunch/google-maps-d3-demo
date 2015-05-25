export default class JsonDecoder {
  constructor() {
    this._textDecoder = new TextDecoder();
    this._parser = jsonParser( chunk => {
      this._result = chunk;
    });
    this._result = undefined;
  }

  decode( data, opts ) {
    var text = this._textDecoder.decode( data, opts );
    if ( opts && !opts.stream ) {
      return JSON.parse( text );
    } else {
      this._result = undefined;
      this._parser.write( text );
      return this._result;
    }
  }
};

function jsonParser( callback ) {
  var parser = clarinet.parser();
  var cursor = new JsonCursor( callback );
  parser.onvalue = function( value ) {
    cursor.set( value );
  };
  parser.onopenobject = function( key ) {
    cursor.down( 'object', key );
  };
  parser.onkey = function( key ) {
    cursor.next( key );
  };
  parser.oncloseobject = function() {
    cursor.up();
  };
  parser.onopenarray = function() {
    cursor.down( 'array' );
  };
  parser.onclosearray = function() {
    cursor.up();
  };
  return parser;
}

class JsonCursor {
  constructor( callback ) {
    this._key = null;
    this._buffer = null;
    this._type = null;
    this._callback = callback;
  }

  up() {
    throw new Error( 'Cursor must be inside an object or an array to go up.' );
  }

  next( key ) {
    if ( this._type !== 'object' ) {
      throw new Error( 'Cursor must be inside an object to change the active key.' );
    }
    this._key = key;
  }

  set( value ) {
    if ( this._type === 'array' ) {
      this._buffer.push( value );
    } else if ( this._type === 'object' ) {
      this._buffer[ this._key ] = value;
    } else {
      this._callback( value );
    }
  }

  down( type, key ) {
    var _up = this.up;
    var _key = this._key;
    var _buffer = this._buffer;
    var _type = this._type;

    this._type = type;
    this._buffer = type === 'array' ? [] : {};
    this._key = key;

    this.up = function() {
      var result = this._buffer;
      this.up = _up;
      this._key = _key;
      this._buffer = _buffer;
      this._type = _type;
      this.set( result );
    };
  }
}
