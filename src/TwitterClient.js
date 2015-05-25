const kWebTaskRunnerUrl = 'https://webtask.it.auth0.com/api/run/wt-bunchclone-gmail_com-0';
const kWebTaskToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjIifQ.eyJqdGkiOiIwOTJhZTk2MjYyMmM0ZmIwOGE0ZjAwYjBiMGEwMTg0NCIsImlhdCI6MTQzMjQ5MDEyNSwiY2EiOlsiYjY2YTVmZTBmYjczNGYzN2IxZTM0ZWRhNzM1ZTljOTkiXSwiZGQiOjAsInRlbiI6Ii9ed3QtYnVuY2hjbG9uZS1nbWFpbF9jb20tWzAtMV0kLyIsImVjdHgiOiJpYk56M1VCQ0thRTVtc2JZdFFBVEx4ajBDYWRoL1A3ejJnKzBWRFpDU0U3S3pCbjF2L0RkRHhuUUxZMVdZOHdGS1M5Y1FlTVpYWVN0dTR3QVBQM1pjbTZ4QmZsYm9xR0J2MmplZnJjbm5tYWNmMnRHMkdISWNUcG9KYmtHRzZoOGtOV3Q0eXErUEhTbjU1OW5YMnRuSHlqVndhdzMzbzVxVW9ITWdJbzNXVHQwd2gxckl3UzFNVURwV3JhL1R1SFVibjg4eThTNkxiSy82UGo4NVhqQ054dENoWGVKZHN4aXZtVVdjdmlBc0l0SnFoWThQNFpOc3JjZmdqK3NlSUhzemxKVFZadVczWkM5RVY1TjBnM2E4OVRiTDNpQXpDbS96M0txbkpkV1lMOGRzLzBYZndPRlo2TDFOT01JY0ZlOFV2TzdMa0hIZ2gwUnVqRW5FSnJrQ3c9PS5CL1ZFRVkvR0VYRGlUQ0cxUmxiOTZBPT0ifQ.wgvsCIrEk7VWAIPNI-qCY6O3mdhmcPo1mlJ2H17Hq8U';
const kRestApiUrl = 'https://api.twitter.com/1.1/';
const kStreamApiUri = 'https://stream.twitter.com/1.1/';
const kServerTaskUrl = 'https://sparklingfrost4179.localtunnel.me/TwitterServer.js';

export default class TwitterClient {
  searchAsync( params ) {
    return this.requestAsync( 'GET', 'search/tweets.json', params );
  }

  requestAsync( method, url, params ) {
    return performTaskAsync(
      method,
      paramsUrl( kRestApiUrl + url, params )
    ).then( readAsJson );
  }

  streamAsync( params ) {
    return performTaskAsync(
      'POST',
      paramsUrl( kStreamApiUri + 'statuses/filter.json', params )
    ).then( readAsJsonStream );
  }
};

function performTaskAsync( method, url ) {
  var params = {
    method: method,
    url: url,
    webtask_url: kServerTaskUrl,
    webtask_no_cache: 1
  };
  return fetch( paramsUrl( kWebTaskRunnerUrl, params ), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ kWebTaskToken }`
    }
  });
}

function paramsUrl( url, params ) {
  params = params || {};
  params = Object.keys( params ).map( key => `${ key }=${ encodeURIComponent( params[ key ] ) }` ).join( '&' );
  if ( params ) {
    params = '?' + params;
  }
  return url + params;
}

function errorFromTaskResponse( response ) {
  var error = new Error( response.error );
  error.code = response.code;
  error.details = response.details;
  return error;
}

function readAsJson( response ) {
  return response.json( function( body ) {
    if ( response.ok ) {
      return body;
    } else {
      throw errorFromTaskResponse( body );
    }
  });
}

function readAsJsonStream( response ) {
  if ( response.ok ) {
    var reader = response.body.getReader();
    var decoder = new JsonDecoder();
    var stream = new EventStream();
    var closed = false;

    stream.on( 'close', function() {
      closed = true;
    });

    ( function read() {
      return reader.read().then( function( result ) {
        if ( closed ) {
          reader.cancel( 'Stream closed.' );
          stream.emit( 'end' );
          return;
        }

        var json = decoder.decode( result.value || new Uint8Array(), {
          stream: !result.done
        });
        if ( json !== undefined ) {
          stream.emit( 'data', json );
        }

        if ( result.done ) {
          stream.emit( 'end' );
        } else {
          return read();
        }
      });
    } () );

    return stream;
  } else {
    return response.json().then( function( body ) {
      throw errorFromTaskResponse( body );
    });
  }
}
