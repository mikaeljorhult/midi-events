define( [ 'midi-events' ], function( midi ) {
	'use strict';
	
	function Device( input, output ) {
		this.inputs = ( input !== undefined ? input : [] );
		this.outputs = ( output !== undefined ? output : [] );
	}
	
	return Device;
} );