define( [], function() {
	'use strict';
	
	var requestMIDI = navigator.requestMIDIAccess(),
		MIDIAccess;
	
	requestMIDI.then( requestSuccess, requestFailure );
	
	function requestSuccess( access ) {
		MIDIAccess = access;
	}
	
	function requestFailure( error ) {
		console.log( error );
	}
} );