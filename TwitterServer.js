var OAuth = require( 'oauth' );

return function( context, req, res ) {
  var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    context.data.consumer_key,
    context.data.consumer_secret,
    '1.0A',
    null,
    'HMAC-SHA1'
  );
  var request = oauth[ context.data.method.toLowerCase() ](
    context.data.url,
    context.data.access_token,
    context.data.access_token_secret
  );
  request.on( 'response', function( response ) {
    response.pipe( res );
  });
  request.end();

  req.on( 'close', function() {
    request.abort();
  });

  req.on( 'end', function() {
    request.abort();
  });
};
