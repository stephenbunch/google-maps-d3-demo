console.log( 'hello world!' );

function getTweets() {
  var client = new TwitterClient();
  client.searchAsync({
    q: '#MemorialDay',
    geocode: '0,0,3959mi'
  }).then( function( result ) {
    console.log( result );
  });
}


function getStream() {
  var client = new TwitterClient();
  client.streamAsync({
    track: '#MemorialDay',
    locations: '-180,-90,180,90'
  }).then( function( stream ) {
    stream.on( 'data', function( data ) {
      console.log( data );
    });
    window.stream = stream;
  });
}
