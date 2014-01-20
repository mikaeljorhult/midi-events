requirejs.config( {
    baseUrl: 'assets/js'
} );

require( [ 'midi-events' ], function( midi ) {
	// Check if Web MIDI API is supported in current browser.
	if ( midi.supported ) {
		// Request access to MIDI ports and run callback if/when granted.
		midi.connect();
		midi.on( 'connected', connected );
	}
	
	// Function to run when granted access to MIDI ports.
	function connected() {
		
	}
} );