export default class EventStream {
  constructor() {
    this._listeners = {};
  }

  on( event, listener ) {
    if ( !this._listeners[ event ] ) {
      this._listeners[ event ] = [];
    }
    this._listeners[ event ].push( listener );
    return this;
  }

  off( event, listener ) {
    var listeners = this._listeners[ event ];
    if ( listeners ) {
      var index = listeners.indexOf( listener );
      if ( index > -1 ) {
        listeners.splice( index, 1 );
        if ( listeners.length === 0 ) {
          delete this._listeners[ event ];
        }
      }
    }
    return this;
  }

  emit( event, ...args ) {
    var listeners = this._listeners[ event ];
    listeners = listeners && listeners.slice();
    if ( listeners ) {
      listeners.forEach( listener => listener.apply( undefined, args ) );
    }
  }

  close() {
    this.emit( 'close' );
  }
};
