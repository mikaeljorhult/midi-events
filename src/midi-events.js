define( [], function() {
	'use strict';
	
	// Declare variables.
	var requestMIDI = navigator.requestMIDIAccess(),
		MIDIAccess = null,
		eventCache = {};
	
	function connect( callback ) {
		// Request access to MIDI I/O.
		requestMIDI.then( function( access ) {
			MIDIAccess = access;
			
			// Trigger event.
			trigger( 'connected' );
			
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
	
	// Pub/Sub.
	function trigger( topic, args, scope ) {
		if ( eventCache[ topic ] ) {
			var thisTopic = eventCache[ topic ],
				i = thisTopic.length - 1;
			
			for ( i; i >= 0 ; i -= 1 ) {
				thisTopic[ i ].apply( scope || this, args || [] );
			}
		}
	}
	
	function on( topic, callback ) {
		if ( !eventCache[ topic ] ) {
			eventCache[ topic ] = [];
		}
		
		eventCache[ topic ].push( callback );
		
		return [ topic, callback ];
	}
	
	function off( handle, completly ) {
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
	
	// Request access to MIDI.
	function requestFailure( error ) {
		console.log( error );
	}
	
	// Return object with public methods.
	return {
		connect: connect,
		inputs: inputs,
		outputs: outputs,
		
		// Pub/Sub.
		on: on,
		off: off
	};
} );