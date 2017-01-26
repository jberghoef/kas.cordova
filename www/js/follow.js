// Initiatie variabelen.
/* ====================================================================== */
var triggerElementID = null,
	fingerCount = 0,
	startX = 0,
	startY = 0,
	curX = 0,
	curY = 0,
	deltaX = 0,
	deltaY = 0,
	horzDiff = 0,
	vertDiff = 0,
	minLength = 30,
	swipeLength = 0,
	swipeAngle = null,
	swipeAngleInversed = null,
	swipeDirection = null;

// Game variables
var jumpMultiplier = 1.75,			// The maximum distance of a single jump. Default is 2.
	maxJump = 120,					// The maximum range of a single jump. Default (120) is two lelies.
	difficulty = 3,					// Speed of the shadow. Higher number equals higher difficulty.
	jumpSpeed = 500,				// The speed with wich the frog jump. Yay.
	playerX = null,
	playerY = null,
	targetX = null,
	targetY = null,
	playfieldHeight = null,
	stepAmount = null,
	currentStep = 0,
	collisionArray = [],
	stopwatchRunning = false;
	


// Load function.
/* ====================================================================== */
window.addEventListener('load', function () {

	document.ontouchstart = function (e) {
		e.preventDefault();
	};
	
	$('#bgm_moeras').get(0).play();
	
	playfieldHeight = $("#playField").height();
	
	// Initiatie script.
	$("#kikker").on("touchstart", function () {
		touchStart(event, this);
		console.group("Touch event.");
	});
	
	$("#kikker").on("touchmove", function () {
		touchMove(event);
	});
	
	$("#kikker").on("touchend", function () {
		touchEnd(event);
		console.groupEnd();
	});
	
	$("#kikker").on("touchcancel", function () {
		touchCancel(event);
		console.groupEnd();
	});
	
	renderSteps();
	
	sideKikkerJump();
	startGame();
	
}, false);

// Touch start event.
/* ====================================================================== */
function touchStart(event) {
	event.preventDefault();
	
	fingerCount = event.touches.length;
	if (fingerCount == 1) {
		startX = event.touches[0].pageX;
		startY = event.touches[0].pageY;
	} else {
		touchCancel(event);
	}
}

// Touch move event.
/* ====================================================================== */
function touchMove(event) {
	event.preventDefault();
	
	if ( event.touches.length == 1 ) {
		curX = event.touches[0].pageX;
		curY = event.touches[0].pageY;
		
		swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
		caluculateAngle();
		
		// Render frog animation.
		$("#kikker").css('-webkit-transform', 'rotateZ(' + swipeAngleInversed + 'deg)');
		$("#kikker").css('background-position-y', 56 + (swipeLength / 20) + 'px');
		
		showTargetPreview();
	
	} else {
		touchCancel(event);
	}
}

// Touch end event.
/* ====================================================================== */
function touchEnd(event) {
	event.preventDefault();
	
	if ( fingerCount == 1 && curX != 0 ) {
		swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
		if ( swipeLength >= minLength ) {
			if ( (swipeAngle <= 270) && (swipeAngle >= 90) ) {
				initiateJump();
				processingRoutine();
			
				touchCancel(event);	
			} else {
				console.warn("Swipe too short or wrong direction. Cancelling event.");
				touchCancel(event);	
			}
		} else {
			console.warn("Swipe too short or wrong direction. Cancelling event.");
			touchCancel(event);
		}	
	} else {
		touchCancel(event);
	}
}

// Touch cancel event.
/* ====================================================================== */
function touchCancel(event) {
	fingerCount = 0;
	startX = 0;
	startY = 0;
	curX = 0;
	curY = 0;
	deltaX = 0;
	deltaY = 0;
	horzDiff = 0;
	vertDiff = 0;
	swipeLength = 0;
	swipeAngle = null;
	swipeAngleInversed = null;
	swipeDirection = null;
	triggerElementID = null;
	
	playerX = parseInt($("#player").css( "left" ), 10);
	playerY = parseInt($("#player").css( "top" ), 10);
	
	$("#kikker").css('background-position-y', '');
	$("#targetPreview").css('display', '');
	$("#targetPreview").css('opacity', '');
	
}

// Calculate angle.
/* ====================================================================== */
function caluculateAngle() {
	var X = startX-curX;
	var Y = startY-curY;
	var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2)));
	var r = Math.atan2(Y,X);
	swipeAngle = Math.round(r*180/Math.PI-90);
	swipeAngleInversed = Math.round(r*180/Math.PI-270);
	if ( swipeAngle < 0 ) { swipeAngle = 360 - Math.abs(swipeAngle); }
	if ( swipeAngleInversed < 0 ) { swipeAngleInversed = 360 - Math.abs(swipeAngleInversed);}
}

// Do something with results.
/* ====================================================================== */
function processingRoutine() {
	console.info("Distance: " + swipeLength + " pixels. Angle: " + swipeAngle + " degrees.");
}

// Render jumping steps.
function renderSteps() {
	stepAmount = Math.round((playfieldHeight - 300) / maxJump);
	var stepY = $('#startGround').height() - 100;
	var positions = new Array("left", "middle", "right");
	var sizes = new Array("regular", "regular", "regular", "small", "broken");
	
	for (var i = 0; i < stepAmount; i++) {
		stepY = stepY + (maxJump);
		var randomPosition = positions[Math.floor( Math.random() * positions.length )];
		var randomSize = sizes[Math.floor( Math.random() * sizes.length )];
		$("#playField").append("<div class='step " + randomPosition + " " + randomSize + "' id='step" + i + "' style='bottom:" + stepY + "px'></div>");
	} 
}

// Show the estimated jump target.
function showTargetPreview() {
	playerX = parseInt($("#player").css( "left" ), 10);
	playerY = parseInt($("#player").css( "top" ), 10);
	
	$("#targetPreview").css('opacity', '1.0');
	
	/*$( '.step, #endGround' ).map( function ( i ) {
		if( overlaps( targetPreview, this ); ){
			$("#targetPreview").css('background-color', 'rgba(0,255,0,0.25)');
			$("#targetPreview").css('border-color', 'rgba(0,255,0,0.50)');
		} else {
			$("#targetPreview").css('background-color', '');
			$("#targetPreview").css('border-color', '');
		}
	}).get().join( '' );*/
	
	// Make sure target doesn't move any further that max allowed distance.
	targetX = playerX + ((startX - curX) * jumpMultiplier);
	if ((curY - startY) > maxJump) {
		targetY = playerY - (maxJump * jumpMultiplier);
	} else {
		targetY = playerY + ((startY - curY) * jumpMultiplier);
		
	}
	
	// Check if target isn't outside playfield.
	if (targetX <= 50) {
		$("#targetPreview").css('left', 50 + 'px');
		targetX = 50;
	} else if (targetX >= 270) {
		$("#targetPreview").css('left', 270 + 'px');
		targetX = 270;
	} else {
		$("#targetPreview").css('left', targetX + 'px');
	}
	if (targetY <= 50) {
		$("#targetPreview").css('top', 50 + 'px');
		targetY = 50;
	} else {
		$("#targetPreview").css('top', targetY + 'px');
	}
}

// Calculate and render the jump.
function initiateJump() {
	
	$("#player, #kikker").css('-webkit-transition-duration', '.' + (swipeLength * 2) + 's');
	$("#player, #kikker").css('left', targetX + 'px');
	$("#player, #kikker").css('top', targetY + 'px');
	$("#kikker").css('background-size', 73 * 1.5 + 'px');
	$('#eff_jump').get(0).play();
	
	setTimeout(function() {
		$("#kikker").css('background-size', '');
	}, swipeLength);
	
	windowHeight = window.innerHeight;
	if ((startY - curY) < 100){
		 var delay = "0" + (startY - curY);
	} else {
		 var delay = startY - curY;
	}
	
	$("#playField").css('-webkit-transition-duration', delay + 's');
	

	// Make sure viewport doesn't move outside of frame.
	if ((targetY + 250) < windowHeight){
		$("#playField").css('bottom', (windowHeight - playfieldHeight) + 'px');
	} else {
		$("#playField").css('bottom', (targetY - playfieldHeight) + 250 + 'px');
	}
	
	if (targetY < 108) {
		setTimeout(function() {
			endScherm();
		}, (swipeLength * 6) + 100);
	}
	
	setTimeout(function() {
		
		checkCollision();
		
	}, (swipeLength * 2) + 100);
}

function sideKikkerJump() {
	
	var targetStep = currentStep;
	
	var x = parseInt($('#step' + targetStep).css( "left" ), 10);
	var y = parseInt($('#step' + targetStep).css( "bottom" ), 10);
	
	console.log("X position is " + x + ". Y position is " + y + ".");
	
	if ( isNaN(y) ) {
		$("#sideKikker").css('-webkit-transition-duration', '.500s');
		$("#sideKikker").css('left', '80px');
		$("#sideKikker").css('bottom', (playfieldHeight - 100) + 'px');
		$("#sideKikker").css('background-size', 63 * 1.5 + 'px');
		$('#eff_jump').get(0).play();
		
		setTimeout(function() {
			$("#sideKikker").css('background-size', '');
		}, 350);
	} else {
		$("#sideKikker").css('-webkit-transition-duration', '.' + jumpSpeed + 's');
		$("#sideKikker").css('left', x + 'px');
		$("#sideKikker").css('bottom', (y - 50) + 'px');
		$("#sideKikker").css('background-size', 63 * 1.5 + 'px');
		$('#eff_jump').get(0).play();
		
		setTimeout(function() {
			$("#sideKikker").css('background-size', '');
			
			$('#step' + targetStep).css('-webkit-transition-duration', '.250s');
			$('#step' + targetStep).css('opacity', '0.75');
		}, jumpSpeed * 0.7);
		
		setTimeout(function() {
			$('#step' + targetStep).css('-webkit-transition-duration', difficulty + 's');
			$('#step' + targetStep).css('opacity', '');
		}, jumpSpeed * 1.4);
		
		setTimeout(function() {
			currentStep++;
			sideKikkerJump();
		}, jumpSpeed * 2.0);	
	}
}

/*
	Check collision.
*/
function checkCollision(){
	var area = $( '#playField' )[0],
		player = $( '#player' )[0],
		sideKikker = $( '#sideKikker' )[0],
		targetPreview = $( '#targetPreview' )[0],
		shadow = $( '#shadow' )[0],
		html;
	
		html = $( '.step, #endGround, #startGround' ).map( function ( i ) {
			// return 'Field ' + ( i + 1 ) + ' = ' + overlaps( player, this );
			collisionArray[i + 1] = overlaps( player, this );
		}).get().join( '' );
	
		console.log( collisionArray );
		console.log( jQuery.inArray( true, collisionArray ) );
	
		if( (jQuery.inArray( true, collisionArray )) >= 0 ){
			console.log('Not all values are the same. Everything is A-okay!');
		} else {
			console.log('All values are the same. Seems like our player took a plunge.');
			afScherm();
			$('#eff_fall').get(0).play();
		}
}

/* 
	Start game function.
*/
function startGame() {
	var time = playfieldHeight;
	
	stopwatchRunning = true;
	stopwatch();
}

/*
	End game function.
*/
function endGame() {
	resetStopwatch();
}

function afScherm(){
	$('#afScherm').show();
	endGame();
}

function endScherm(){
	$('#endScherm').show();
	endGame();
}

/* 
	Collision detection.
*/
var overlaps = (function () {
	function getPositions( elem ) {
		var pos, width, height;
		pos = $( elem ).position();
		width = $( elem ).width();
		height = $( elem ).height();
		return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
	}

	function comparePositions( p1, p2 ) {
		var r1, r2;
		r1 = p1[0] < p2[0] ? p1 : p2;
		r2 = p1[0] < p2[0] ? p2 : p1;
		return r1[1] > r2[0] || r1[0] === r2[0];
	}

	return function ( a, b ) {
		var pos1 = getPositions( a ),
			pos2 = getPositions( b );
		return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
	};
})();
	
/*
	Stopwatch.
*/
var sec = 0,
	min = 0,
	hour = 0;

function stopwatch() {
	if(stopwatchRunning == true){
		sec++;
			if (sec == 60) {
				sec = 0;
				min = min + 1; }
			else {
				min = min; }
			
			if (min == 60) {
				min = 0;
				hour += 1; }
		
			if (sec<=9) { sec = "0" + sec; }
				$('#timeMeter').text( ((hour<=9) ? "0"+hour : hour) + ":" + ((min<=9) ? "0" + min : min) + ":" + sec );
		
		
		SD = window.setTimeout("stopwatch();", 100);	
	} else {
		$('#timeMeter').text( ((hour<=9) ? "0"+hour : hour) + ":" + ((min<=9) ? "0" + min : min) + ":" + sec );
		window.clearTimeout(SD);
	}
}
 
function resetStopwatch() {
	stopwatchRunning = false;

	window.clearTimeout(SD);
}