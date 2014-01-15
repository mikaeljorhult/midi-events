define( [ 'midi-events' ], function( midi ) {
	function Device( input, output ) {
		this.inputs = ( input !== undefined ? input : [] );
		this.outputs = ( output !== undefined ? output : [] );
	}
	
	return Device;
} );