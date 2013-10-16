// based on https://github.com/CarlRaymond/jquery.cardswipe
// stripped out the creditcard related stuff
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

	// State definitions:
	var IDLE = 0; // Waiting for track 1 start character, %
	var PENDING = 1; // Saw track 1 start character and waiting for B
	var READING = 2; // Saw %B and capturing until a carriage return, or until the timer times out
	var DISCARD = 3; // Eating all characters until a carriage return, or until the timer lapses

	// Holds current state
	var state = IDLE;

	// Array holding scanned characters
	var scanbuffer;
	
	// Interdigit timer
	var timerHandle = 0;

	// Keypress listener
	var listener = function (e) {
		switch (state) {
			case IDLE:
				// Look for '%'
				state = PENDING;
				scanbuffer = new Array();
				processCode(e.which);
				e.preventDefault();
				e.stopPropagation();
				startTimer();
				
				break;

			case PENDING:
				// Look for format code character, A-Z. Almost always B for cards
				// used by the general public.
				state = READING;

				// Leaving focus on a form element wreaks browser-dependent
				// havoc because of keyup and keydown events.  This is a
				// cross-browser way to prevent trouble.
				$("input").blur();

				processCode(e.which);
				e.preventDefault();
				e.stopPropagation();
				startTimer();
				break;

			case READING:
				processCode(e.which);
				startTimer();
				e.preventDefault();
				e.stopPropagation();

				// Carriage return indicates end of scan
				if (e.which == 13) {
					clearTimer();
					state = IDLE;
					processScan();
				}
				break;

			case DISCARD:
				e.preventDefault();
				e.stopPropagation();
				if (e.which == 13) {
					clearTimer();
					state = IDLE;
					return;
				}

				startTimer();
				break;
		}
	};

	// Converts a scancode to a character and appends it to the buffer.
	var processCode = function (code) {
		scanbuffer.push(String.fromCharCode(code));
		//console.log(code);
	}

	var startTimer = function () {
		clearTimeout(timerHandle);
		timerHandle = setTimeout(onTimeout, settings.interdigitTimeout);
	};

	var clearTimer = function () {
		clearTimeout(timerHandle);
		timerHandle = 0;
	};

	// Invoked when the timer lapses.
	var onTimeout = function () {
		if (state == READING) {
			processScan();
		}
		scanbuffer = null;
		state = IDLE;
	};


	// Processes the scanned card
	var processScan = function () {

		var rawData = scanbuffer.join('');

		// Invoke client parser and callbacks
		var parsedData = settings.parser.call(this, rawData);
		if (parsedData) {
			settings.success && settings.success.call(this, parsedData);
		}
		else {
			settings.error && settings.error.call(this, rawData);
		}
	};

	// Binds the event listener
	var bindListener = function () {
		$(document).bind("keypress.rfidscan", listener);
	};

	// Unbinds the event listener
	var unbindListener = function () {
		$(document).unbind(".rfidscan");
	};

	// Default parser. Separates raw data into up to three lines
	var defaultParser = function (rawData) {
		if (rawData.length != 10) return null;
		else return rawData;
	};

	// Default callback used if no other specified. Works with default parser.
	var defaultSuccessCallback = function (cardData) {
		alert(cardData);
	};

	// Defaults for settings
	var defaults = {
		enabled: true,
		interdigitTimeout: 250,
		success: defaultSuccessCallback,
		error: null,
		parser: defaultParser,
		firstLineOnly: false
	};

	// Plugin actual settings
	var settings;


	// Callable plugin methods
	var methods = {
		init: function (options) {
			settings = $.extend(defaults, options || {});

			if (settings.enabled)
				methods.enable();
		},

		disable: function (options) {
			unbindListener();
		},

		enable: function (options) {
			bindListener();
		}
	};


	// The extension proper.  Dispatches methods using the usual jQuery pattern.
	$.rfidscan = function (method) {
		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
		else {
			$.error('Method ' + method + ' does not exist on jQuery.rfidscan');
		}
	}

}));
