define( function() {
	'use strict';
	
	// Declare variable to store events and callbacks.
	var eventCache = {};
	
	// Return public methods.
	return {
		/**
		 * Publish a event.
		 */
		trigger: function( topic, args, scope ) {
			if ( eventCache[ topic ] ) {
				var thisTopic = eventCache[ topic ],
					i = thisTopic.length - 1;
				
				for ( i; i >= 0 ; i -= 1 ) {
					thisTopic[ i ].apply( scope || this, args || [] );
				}
			}
		},
		
		/**
		 * Subscribe to a event.
		 */
		on: function( topic, callback ) {
			if ( !eventCache[ topic ] ) {
				eventCache[ topic ] = [];
			}
			
			eventCache[ topic ].push( callback );
			
			return [ topic, callback ];
		},
		
		/**
		 * Unsubscribe from event.
		 */
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
} );