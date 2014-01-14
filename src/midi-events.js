define( [ 'PubSub' ], function( PubSub ) {
	'use strict';
	
	// Declare variables.
	var MIDIEvents = {},
		requestMIDI = navigator.requestMIDIAccess(),
		MIDIAccess = null;
	
	/**
	 * Get all input ports.
	 * 
	 * @param callback function Callback to run when access to MIDI has been established.
	 */
	function connect( callback ) {
		// Request access to MIDI I/O.
		requestMIDI.then( function( access ) {
			MIDIAccess = access;
			
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
		return MIDIAccess.inputs();
	}
	
	/**
	 * Get all output ports.
	 * 
	 * @return array All available MIDI inputs.
	 */
	function outputs() {
		return MIDIAccess.outputs();
	}
	
	/**
	 * Setup listeners for specified inputs.
	 * 
	 * @param input mixed Input ports to monitor for messages.
	 */
	function listen( input ) {
		assignListener( input, portListener );
	}
	
	/**
	 * Remove listeners for specified inputs.
	 * 
	 * @param input mixed Input ports to stop monitoring for messages.
	 */
	function unlisten( input ) {
		assignListener( input, function(){} );
	}
	
	/**
	 * Add listeners to specified inputs.
	 * 
	 * @param input mixed Input ports to assign listener to.
	 * @param listener function Callback to run when messages is received.
	 */
	function assignListener( input, listener ) {
		var ports = getPorts( input ),
			length = ports.length,
			i;
		
		// Attach listener to all requested ports.
		for ( i = 0; i < length; i++ ) {
			ports[ i ].onmidimessage = listener;
		}
	}
	
	/**
	 * Handle event sent from MIDI port.
	 * 
	 * @param midiEvent object Event sent from MIDI port.
	 */
	function portListener( midiEvent ) {
		var message = {};
		
		message = {
			note: midiEvent.data[ 1 ],
			velocity: midiEvent.data[ 2 ]
		};
		
		console.log( midiEvent );
		console.log( message );
		
		// PubSub.trigger();
	}
	
	/**
	 * Resolve ports from requested input.
	 * 
	 * @param input mixed Input ports to resolve.
	 * @return array Resolved ports, or empty array.
	 */
	function getPorts( input ) {
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
		} else if ( typeof input === 'string' && input.toLowerCase() === 'all' ) {
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
	 * Handle if request for MIDI access failed.
	 * 
	 * @param error object Generated error object.
	 */
	function requestFailure( error ) {
		console.log( error );
	}
	
	// Add methods to MIDIEvents object.
	MIDIEvents.connect = connect;
	MIDIEvents.inputs = inputs;
	MIDIEvents.outputs = outputs;
	MIDIEvents.listen = listen;
	MIDIEvents.unlisten = unlisten;
	
	// Add PubSub methods.
	MIDIEvents.on = PubSub.on;
	MIDIEvents.off = PubSub.off;
	
	// Return object with public methods.
	return MIDIEvents;
} );