define( [ 'Device', 'PubSub' ], function( Device, PubSub ) {
	'use strict';
	
	// Declare variables.
	var MIDIEvents = {},
		supported = ( !!window.navigator.requestMIDIAccess ),
		requestMIDI = ( supported ? navigator.requestMIDIAccess() : null ),
		MIDIAccess = null,
		inputPorts = [],
		outputPorts = [];
	
	/**
	 * Get all input ports.
	 * 
	 * @param callback function Callback to run when access to MIDI has been established.
	 */
	function connect( callback ) {
		// Request access to MIDI I/O.
		requestMIDI.then( function( access ) {
			MIDIAccess = access;
			inputPorts = MIDIAccess.inputs();
			outputPorts = MIDIAccess.outputs();
			
			// Trigger event.
			PubSub.trigger( 'connected' );
			
			// Trigger callback.
			if ( typeof callback === 'function' ) { callback(); }
		}, requestFailure );
	}
	
	/**
	 * Get input ports.
	 * 
	 * @param output mixed Requested inputs.
	 * @return array All available MIDI inputs.
	 */
	function inputs( input ) {
		inputPorts = getPorts( 'input', input );
		
		return inputPorts;
	}
	
	/**
	 * Get output ports.
	 * 
	 * @param output mixed Requested outputs.
	 * @return array All available MIDI inputs.
	 */
	function outputs( output ) {
		outputPorts = getPorts( 'output', output );
		
		return outputPorts;
	}
	
	/**
	 * Setup listeners for specified inputs.
	 * 
	 * @param input mixed Input ports to monitor for messages.
	 */
	function listen( input ) {
		var ports = inputs( input ),
			length = ports.length,
			i;
		
		// Attach listener to all requested ports.
		for ( i = 0; i < length; i++ ) {
			ports[ i ].addEventListener( 'midimessage', portListener, false );
		}
	}
	
	/**
	 * Remove listeners for specified inputs.
	 * 
	 * @param input mixed Input ports to stop monitoring for messages.
	 */
	function unlisten( input ) {
		var ports = inputs( input ),
			length = ports.length,
			i;
		
		// Attach listener to all requested ports.
		for ( i = 0; i < length; i++ ) {
			ports[ i ].removeEventListener( 'midimessage', portListener, false );
		}
	}
	
	/**
	 * Handle event sent from MIDI port.
	 * 
	 * @param midiEvent object Event sent from MIDI port.
	 */
	function portListener( midiEvent ) {
		var message = {
				port: resolveInputPort( midiEvent.target.id ),
				type: 'unsupported',
				channel: 0
			};
		
		// Add note and value.
		message.note = midiEvent.data[ 1 ];
		message.value = midiEvent.data[ 2 ];
		
		// Include original event.
		message.originalEvent = midiEvent;
		
		// Determine type of message and channel it was sent on.
		switch ( true ) {
			// Lower than 128 is not a supported message.
			case ( midiEvent.data[ 0 ] < 128 ):
				break;
			
			// 128 - 143 represent note off on each of the 16 channels.
			case ( midiEvent.data[ 0 ] < 144 || ( midiEvent.data[ 0 ] < 160 && midiEvent.data[ 2 ] === 0 ) ):
				message.type = 'noteoff';
				message.channel = midiEvent.data[ 0 ] - ( midiEvent.data[ 0 ] > 143 ? 144 : 128 );
				break;
			
			// 144 - 159 represent note on on each of the 16 channels.
			case ( midiEvent.data[ 0 ] < 160 ):
				message.type = 'noteon';
				message.channel = midiEvent.data[ 0 ] - 144;
				break;
			
			// 160 - 176 represent aftertouch on each of the 16 channels.
			case ( midiEvent.data[ 0 ] < 176 ):
				message.type = 'polyphonic-aftertouch';
				message.channel = midiEvent.data[ 0 ] - 160;
				break;
			
			// 176 - 191 represent controller messages on each of the 16 channels.
			case ( midiEvent.data[ 0 ] < 192 ):
				message.type = 'controller';
				message.channel = midiEvent.data[ 0 ] - 176;
				break;
			
			// 192 - 207 represent control change messages on each of the 16 channels.
			case ( midiEvent.data[ 0 ] < 208 ):
				message.type = 'controlchange';
				message.channel = midiEvent.data[ 0 ] - 192;
				message.note = 0;
				message.value = midiEvent.data[ 1 ];
				break;
			
			// 208 - 223 represent channel aftertouch on each of the 16 channels.
			case ( midiEvent.data[ 0 ] < 224 ):
				message.type = 'aftertouch';
				message.channel = midiEvent.data[ 0 ] - 208;
				message.note = 0;
				message.value = midiEvent.data[ 1 ];
				break;
		}
		
		// Trigger events.
		PubSub.trigger( 'message', [ message ] );
		PubSub.trigger( message.type, [ message ] );
		PubSub.trigger( message.type + ':' + message.note, [ message ] );
		PubSub.trigger( 'port:' + message.port, [ message ] );
		PubSub.trigger( 'id:' + midiEvent.target.id, [ message ] );
	}
	
	/**
	 * Resolve requested ports.
	 * 
	 * @param type string Type of ports to resolve.
	 * @param value mixed Ports to resolve.
	 * @return array Resolved ports, or empty array.
	 */
	function getPorts( type, value ) {
		var availablePorts = ( type === 'output' ? MIDIAccess.outputs() : MIDIAccess.inputs() ),
			arrayToResolve = [],
			ports = [],
			i;
		
		if ( typeof value === 'number' ) {
			// A single index is requested. Create an array from it.
			if ( value < availablePorts.length ) {
				ports.push( availablePorts[ value ] );
			}
		} else if ( Object.prototype.toString.call( value ).match( /^\[object MIDI(Input|Output)]$/ ) ) {
			// A single MIDI port object was provided. Use it.
			ports.push( value );
		} else if ( Object.prototype.toString.call( value ) === '[object Array]' ) {
			// An array of indexes is requested. Add all of them.
			arrayToResolve = value;
		} else if ( ( typeof value === 'string' && value.toLowerCase() === 'all' ) || value === undefined ) {
			// All ports requested. Assign them directly.
			ports = availablePorts;
		}
		
		// If there are indexes not saved in ports variable.
		if ( arrayToResolve.length > 0 ) {
			// Go through each index and add corresponding port to array.
			for ( i = 0; i < arrayToResolve.length; i++ ) {
				if ( typeof arrayToResolve[ i ] === 'number' ) {
					// Array index. Make sure that the port exists.
					if ( arrayToResolve[ i ] < availablePorts.length ) {
						ports.push( availablePorts[ value ] );
					}
				} else if ( Object.prototype.toString.call( arrayToResolve[ i ] ).match( /^\[object MIDI(Input|Output)]$/ ) ) {
					// A MIDI port object.
					ports.push( value );
				}
			}
		}
		
		// Return resolved ports.
		return ports;
	}
	
	/**
	 * Resolve port from requested id.
	 * 
	 * @param id integer ID of MIDI port to resolve.
	 * @return integer Resolved port.
	 */
	function resolveInputPort( id ) {
		var i,
			length = inputPorts.length;
		
		for ( i = 0; i < length; i++ ) {
			if ( inputPorts[ i ].id === id ) {
				return i;
			}
		}
	}
	
	/**
	 * Send MIDI message to requested ports.
	 * 
	 * @param output mixed Output ports to send message to.
	 * @param message object MIDI message to send.
	 * @param timestamp integer Timestamp when message should be sent.
	 */
	function send( output, messages, timestamp ) {
		var ports = outputs( output ),
			i,
			j;
		
		// Convert message to array if needed.
		if ( Object.prototype.toString.call( messages ) !== '[object Array]' ) {
			messages = [ messages ];
		}
		
		// Go through and check each message type.
		for ( i = 0; i < messages.length; i++ ) {
			// Convert string values to numeric.
			switch ( messages[ i ].type ) {
				case 'noteon':
					messages[ i ].type = 144;
					break;
				
				case 'noteoff':
					messages[ i ].type = 128;
					break;
			}
		}
		
		// Send all messages to each requested ports.
		for ( i = 0; i < ports.length; i++ ) {
			for ( j = 0; j < messages.length; j++ ) {
				// Do the actual sending.
				ports[ i ].send( [
					messages[ j ].type,
					messages[ j ].note,
					messages[ j ].value
				], timestamp === undefined ? window.performance.now() : timestamp );
			}
		}
	}
	
	/**
	 * Handle if request for MIDI access failed.
	 * 
	 * @param error object Generated error object.
	 */
	function requestFailure( error ) {
		console.log( error );
	}
	
	function createDevice( input, output ) {
		return new Device( input, output );
	}
	
	// Add methods to MIDIEvents object.
	MIDIEvents = {
		supported: supported,
		connect: connect,
		inputs: inputs,
		outputs: outputs,
		listen: listen,
		unlisten: unlisten,
		send: send,
		
		// Handling devices.
		createDevice: createDevice,
		
		// Add PubSub methods.
		on: PubSub.on,
		off: PubSub.off
	};
	
	// Return object with public methods.
	return MIDIEvents;
} );