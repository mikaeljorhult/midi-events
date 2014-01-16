# MIDI Events

Wrapper module to simplify working with Web MIDI API by allowing user to subscribe to events in a 
jQuery-esque way.


## Usage

MIDI Events is a module and should be loaded with a script loader, like [RequireJS](http://requirejs.org/).

When loaded you first need to request access to the MIDI interface by calling the method `.connect()`.
This will trigger the `connected` event when access has been granted and established and you are now
ready to listening to ports and receiving any messages sent over MIDI.

When can subscribe to events by using the function `.on()` and supplying it with a topic and a
callback function. All callbacks attached to a topic will be triggered when the corresponding MIDI
message is received.

### Example
```javascript
require( [ 'midi-events' ], function( midi ) {
	midi.connect();
	
	midi.on( 'connected', whenConnected );
	
	function whenConnected() {
		// Listen to all available MIDI inputs.
		midi.listen();
		
		// Runs when a note on message is received.
		midi.on( 'noteon', function( message ) {
			// Will output object every time a note on message is received.
			console.log( message );
		} );
	}
} );
```


## Support

Current specification is supported in Chrome and Chrome Canary if flag for experimental support of
Web MIDI API([chrome://flags/#enable-web-midi](chrome://flags/#enable-web-midi)) is set to active.

Beware that the [Web MIDI API standard](http://www.w3.org/TR/webmidi/) is still a working draft and
changes to it and/or to implementations within browsers may break this code at any time.


## License

MIDI Events is released under the [MIT license](http://mikaeljorhult.mit-license.org).