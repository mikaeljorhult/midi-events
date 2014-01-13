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
			callback();
		}, requestFailure );
	}
	
	function inputs() {
		return MIDIAccess.inputs();
	}
	
	function outputs() {
		return MIDIAccess.outputs();
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
	
	// Return object with public methods.
	return MIDIEvents;
} );