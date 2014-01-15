define( [ 'require' ], function( require ) {
	'use strict';
	
	/**
	 * Device class.
	 * 
	 * @param mixed input Port to be attached as input for the device.
	 * @param mixed output Port to be attached as output for the device.
	 */
	function Device( input, output ) {
		this.inputs = ( input !== undefined ? input : [] );
		this.outputs = ( output !== undefined ? output : [] );
	}
	
	/**
	 * Send MIDI message to device.
	 * 
	 * @param message object MIDI message to send.
	 */
	Device.prototype.send = function( message ) {
		var midi = require( 'midi-events' );
		
		// Forward message to correct port.
		midi.send( this.outputs, message );
		
		// Return this to make methods chainable.
		return this;
	};
	
	return Device;
} );