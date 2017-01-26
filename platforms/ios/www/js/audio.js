/*
	Play audio
*/
function playAudio(src, title) {
    if (title == null) {
        title = new Media(src, onSuccess, onError);
    }
    title.play({ numberOfLoops: 999 });
}

/*
	Pause audio
*/
function pauseAudio(title) {
    if (title) {
        title.pause();
    }
}

/*
	Stop audio
*/
function stopAudio(title) {
    if (title) {
        title.stop();
    }
    clearInterval(mediaTimer);
    mediaTimer = null;
}

/*
	Succes callback
*/
function onSuccess() {
    console.log("playAudio():Audio Success");
}

/*
	Error callback
*/
function onError(error) {
    console.log('code: '    + error.code    + '\n' +
          		'message: ' + error.message + '\n');
}