define( [ 'require', 'PubSub' ], function( require, PubSub ) {
	'use strict';
	
	/**
	 * Device class.
	 * 
	 * @param mixed input Port to be attached as input for the device.
	 * @param mixed output Port to be attached as output for the device.
	 */
	function Device( input, output ) {
		var midi = require( 'midi-events' );
		
		// Resolve ports.
		this.inputs = midi.inputs( input );
		this.outputs = midi.outputs( output );
	}
	
	/**
	 * Send MIDI message to device.
	 * 
	 * @param message object MIDI message to send.
	 * @param timestamp integer Timestamp when message should be sent.
	 */
	Device.prototype.send = function( message, timestamp ) {
		var midi = require( 'midi-events' );
		
		// Forward message to correct port.
		midi.send( this.outputs, message, timestamp );
		
		// Return this to make methods chainable.
		return this;
	};
	
	/**
	 * Subscribe to MIDI messages from device inputs.
	 * 
	 * @param callback function Function to run when a message is received.
	 */
	Device.prototype.listen = function( callback ) {
		var i,
			length = this.inputs.length;
		
		// Subscribe to events on each device id.
		for ( i = 0; i < length; i++ ) {
			PubSub.on( 'id:' + this.inputs[ i ].id, callback );
		}
		
		// Return this to make methods chainable.
		return this;
	};
	
	/**
	 * Unsubscribe function from device messages.
	 * 
	 * @param callback function Function to unsubscribe.
	 */
	Device.prototype.unlisten = function( callback ) {
		var i,
			length = this.inputs.length;
		
		// Unsubscribe to events on each device port.
		for ( i = 0; i < length; i++ ) {
			PubSub.off( PubSub.on( 'id:' + this.inputs[ i ].id, callback ) );
		}
		
		// Return this to make methods chainable.
		return this;
	};
	
	// Return function.
	return Device;
} );