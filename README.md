## Disclaimer
This is basically a copy of https://github.com/CarlRaymond/jquery.cardswipe - I just changed some parts in the example.

# How it works
This will wait for an HID device to type really fast.

	<html>
	<head>
		<script type="text/javascript" src="/scripts/jquery-1.7.2.js"></script>
		<script type="text/javascript" src="/scripts/jquery.rfid.js"></script>
		<title>Demo</title>
	</head>
	<body>
		<h1>RFid Demo</h1>
		<p>Plug in your card reader and scan a card.</p>

		<script type="text/javascript">

		// Parses raw scan into name and ID number
		var rfidParser = function (rawData) {
			console.log(rawData);
		    if (rawData.length != 11) return null;
			else return rawData;
		    
		};

		// Called on a good scan (company card recognized)
		var goodScan = function (cardData) {
            $("#rfid_card").val(cardData.substr(0,10));
	        
	    };

		// Called on a bad scan (company card not recognized)
		var badScan = function() {
		    console.log("Bad Scan.");
		};

		// Initialize the plugin.
		$.rfidscan({
		    parser: rfidParser,
		    success: goodScan,
		    error: badScan
		});

		</script>

		<input id="rfid_card"><br />
	</body>
	</html>
