define( [ 'Device', 'PubSub' ], function( Device, PubSub ) {
	'use strict';
	
	// Declare variables.
	var MIDIEvents = {},
		requestMIDI = navigator.requestMIDIAccess(),
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
	 * Get all input ports.
	 * 
	 * @return array All available MIDI inputs.
	 */
	function inputs() {
		inputPorts = MIDIAccess.inputs();
		
		return inputPorts;
	}
	
	/**
	 * Get all output ports.
	 * 
	 * @return array All available MIDI inputs.
	 */
	function outputs() {
		outputPorts = MIDIAccess.outputs();
		
		return outputPorts;
	}
	
	/**
	 * Setup listeners for specified inputs.
	 * 
	 * @param input mixed Input ports to monitor for messages.
	 */
	function listen( input ) {
		var ports = getInputPorts( input ),
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
		var ports = getInputPorts( input ),
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
			
			// 160 - 176 is not a supported message.
			case ( midiEvent.data[ 0 ] < 176 ):
				break;
			
			
			// 176 - 191 represent controller messages on each of the 16 channels.
			case ( midiEvent.data[ 0 ] < 192 ):
				message.type = 'controller';
				message.channel = midiEvent.data[ 0 ] - 176;
				break;
		}
		
		// Add note and value.
		message.note = midiEvent.data[ 1 ];
		message.value = midiEvent.data[ 2 ];
		
		// Trigger events.
		PubSub.trigger( 'message', [ message ] );
		PubSub.trigger( message.type, [ message ] );
		PubSub.trigger( message.type + ':' + message.note, [ message ] );
		PubSub.trigger( 'port:' + message.port, [ message ] );
	}
	
	/**
	 * Resolve ports from requested input.
	 * 
	 * @param input mixed Input ports to resolve.
	 * @return array Resolved ports, or empty array.
	 */
	function getInputPorts( input ) {
		var indexes = [],
			ports = [],
			MIDIInputs = inputs(),
			length = MIDIInputs.length,
			i;
		
		if ( typeof input === 'number' ) {
			// A single index is requested. Make Array from it.
			indexes = [ input ];
		} else if ( Object.prototype.toString.call( input ) === '[object Array]' ) {
			// An array of indexes is requested. Add all of them.
			indexes = input;
		} else if ( ( typeof input === 'string' && input.toLowerCase() === 'all' ) || input === undefined ) {
			// All ports requested. Assign them directly.
			ports = inputs();
		}
		
		// If there are indexes not saved in ports variable.
		if ( indexes.length > 0 ) {
			// Go through each index and add corresponding input to array.
			for ( i = 0; i < length; i++ ) {
				// Make sure that input exists.
				if ( typeof indexes[ i ] === 'number' && indexes[ i ] < length ) {
					ports.push( MIDIInputs[ indexes[ i ] ] );
				}
			}
		}
		
		// Return all ports.
		return ports;
	}
	
	/**
	 * Resolve ports from requested output.
	 * 
	 * @param input mixed Output ports to resolve.
	 * @return array Resolved ports, or empty array.
	 */
	function getOutputPorts( output ) {
		var indexes = [],
			ports = [],
			MIDIOutputs = outputs(),
			length = MIDIOutputs.length,
			i;
		
		if ( typeof output === 'number' ) {
			// A single index is requested. Make Array from it.
			indexes = [ output ];
		} else if ( Object.prototype.toString.call( output ) === '[object Array]' ) {
			// An array of indexes is requested. Add all of them.
			indexes = output;
		} else if ( typeof output === 'string' && output.toLowerCase() === 'all' ) {
			// All ports requested. Assign them directly.
			ports = outputs();
		}
		
		// If there are indexes not saved in ports variable.
		if ( indexes.length > 0 ) {
			// Go through each index and add corresponding input to array.
			for ( i = 0; i < length; i++ ) {
				// Make sure that input exists.
				if ( typeof indexes[ i ] === 'number' && indexes[ i ] < length ) {
					ports.push( MIDIOutputs[ indexes[ i ] ] );
				}
			}
		}
		
		// Return all ports.
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
	 */
	function send( output, messages ) {
		var ports = getOutputPorts( output ),
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
				] );
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