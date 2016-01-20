# MIDI Events

Wrapper module to simplify working with Web MIDI API by allowing user to subscribe to events.


## Usage

MIDI Events may be used as a module for use with for example [Browserify](http://browserify.org/)
or [RequireJS](http://requirejs.org/). If no script loader is used MIDI Events is available as a
global object, `midiEvent`.

When loaded you first need to request access to the MIDI interface by calling the method `.connect()`.
This will trigger the `connected` event when access has been granted and established and you are now
ready to listening to ports and receiving any messages sent over MIDI.

When can subscribe to events by using the function `.on()` and supplying it with a topic and a
callback function. All callbacks attached to a topic will be triggered when the corresponding MIDI
message is received.

### Example

```javascript
require(['midi-events'], function(midi) {
	midi.connect();
	
	midi.on('connected', whenConnected);
	
	function whenConnected() {
		// Runs when a note on message is received.
		midi.on('noteon', function(message) {
			// Will output object every time a note on message is received.
			console.log(message);
		});
	}
});
```

### Properties and Methods

* `supported`: Boolean if Web MIDI API is supported in current browser.
* `connect()`: Request access to MIDI ports.
* `inputs()`: Return array of all available input ports.
* `outputs()`: Return array of all available output ports.
* `unlisten(ports)`: Stop listening on one or more ports.
* `send(ports, messages, timestamp)`: Send one or more messages to one or multiple ports. Optionally at a specific time.
* `on(message, callback)`: Register a callback for when a type of MIDI message is received.
* `off(handle)`: Remove previously registered callback.
* `resolveInputPort(property, value)`: Return number of a input port with matching property.
* `resolveOutputPort(property, value)`: Return number of a output port with matching property.

### Events

Events are triggered when a MIDI message is received from one the ports that the module is
listening to.

For every received message four events are triggered: `message`, `message.type`, `message.type:XX`
and `port:XX`where XX is substituted with the note or port of the message.

This means that when C1 (MIDI note 12) is pressed on a keyboard connected to the first MIDI port
it will trigger events `message`, `noteon`, `noteon:12` and `port:0`. When key is released
events `message`, `noteoff`, `noteoff:12` and `port:0` are triggered.

#### Message Types

* `enabled`: Access to MIDI was granted.
* `message`: Triggered on any type of message.
* `noteon`: When a note is pressed.
* `noteoff`: When a note is released.
* `controller`: A controller is changed.
* `controlchange`: A controller is changed.
* `aftertouch`: Aftertouch on a channel.
* `polyphonic-aftertouch`: Aftertouch on a note.
* `unsupported`: All messages that are not (yet?) supported by the module will be returned as
"unsupported" message type.

### Message

All events are supplied with a message with the received information. These contain a number
of properties.

* `port`: Port from which the message originated from.
* `type`: Type of message that was received.
* `channel`: Channel the message was sent to.
* `note`: Number of note/controller that was received.
* `value`: Value that was sent (velocity, level etc.).
* `originalEvent`: The original event was received.


## Support

Current specification [is supported](http://caniuse.com/#feat=midi) natively in latest versions of
Chrome and Opera. For others browsers the [Web MIDI API Shim](https://github.com/cwilso/WebMIDIAPIShim)
may be used to polyfill the functionality.

Beware that the [Web MIDI API standard](http://www.w3.org/TR/webmidi/) is still a working draft and
changes to it and/or to implementations within browsers may break this code at any time.


## License

MIDI Events is released under the [MIT license](http://mikaeljorhult.mit-license.org).
