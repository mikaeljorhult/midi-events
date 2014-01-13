define( [], function() {
	'use strict';
	
	// Declare variables.
	var MIDIEvents = {},
		requestMIDI = navigator.requestMIDIAccess(),
		MIDIAccess = null,
		eventCache = {};
	
	function connect( callback ) {
		// Request access to MIDI I/O.
		requestMIDI.then( function( access ) {
			MIDIAccess = access;
			
			// Trigger event.
			MIDIEvents.trigger( 'connected' );
			
			// Trigger callback.
			if ( typeof callback === 'function' ) { callback(); }
		}, requestFailure );
	}
	
	function inputs() {
		return MIDIAccess.inputs();
	}
	
	function outputs() {
		return MIDIAccess.outputs();
	}
	
	function listen( input ) {
		assignListener( input, portListener );
	}
	
	function unlisten( input ) {
		assignListener( input, function(){} );
	}
	
	function assignListener( input, listener ) {
		var ports = getPorts( input ),
			length = ports.length,
			i;
		
		// Attach listener to all requested ports.
		for ( i = 0; i < length; i++ ) {
			ports[ i ].onmidimessage = listener;
		}
	}
	
	function portListener( midiEvent ) {
		console.log( midiEvent );
	}
	
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
	
	// Request access to MIDI.
	function requestFailure( error ) {
		console.log( error );
	}
	
	// Include Pub/Sub in object.
	MIDIEvents = {
		trigger: function( topic, args, scope ) {
			if ( eventCache[ topic ] ) {
				var thisTopic = eventCache[ topic ],
					i = thisTopic.length - 1;
				
				for ( i; i >= 0 ; i -= 1 ) {
					thisTopic[ i ].apply( scope || this, args || [] );
				}
			}
		},
		
		on: function( topic, callback ) {
			if ( !eventCache[ topic ] ) {
				eventCache[ topic ] = [];
			}
			
			eventCache[ topic ].push( callback );
			
			return [ topic, callback ];
		},
		
		off: function( handle, completly ) {
			var t = handle[ 0 ],
				i = eventCache[ t ].length - 1;
	
			if ( eventCache[ t ] ) {
				for ( i ; i >= 0 ; i -= 1 ) {
					if ( eventCache[ t ][ i ] === handle[ 1 ] ) {
						eventCache[ t ].splice( eventCache[ t ][ i ], 1 );
						
						if ( completly ) {
							delete eventCache[ t ];
						}
					}
				}
			}
		}
	};
	
	// Add methods to MIDIEvents object.
	MIDIEvents.connect = connect;
	MIDIEvents.inputs = inputs;
	MIDIEvents.outputs = outputs;
	MIDIEvents.listen = listen;
	MIDIEvents.unlisten = unlisten;
	
	// Return object with public methods.
	return MIDIEvents;
} );