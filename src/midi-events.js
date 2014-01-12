define( [], function() {
	'use strict';
	
	// Declare variables.
	var requestMIDI = navigator.requestMIDIAccess(),
		MIDIAccess = null;
	
	function connect( callback ) {
		// Request access to MIDI I/O.
		requestMIDI.then( function( access ) {
			MIDIAccess = access;
			
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
	
	return {
		connect: connect,
		inputs: inputs,
		outputs: outputs
	};
} );