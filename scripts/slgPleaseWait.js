angular.module('slgComponents')
 .service("slgPleaseWaitSvc", ['$timeout', function ($timeout) {
 	var slgPleaseWaitModel = { count: 0, spinner: null, slgPleaseWaitTimeout: null, safetyTimeout: null };

 	var el = angular.element("<div id='slgPleaseWaitOverlay'><div id='slgPleaseWaitSpinner'></div></div>");
 	document.body.appendChild(el[0]);

 	var opts = {
 		lines: 13, // The number of lines to draw
 		length: 15, // The length of each line
 		width: 10, // The line thickness
 		radius: 20, // The radius of the inner circle
 		corners: 1, // Corner roundness (0..1)
 		rotate: 0, // The rotation offset
 		direction: 1, // 1: clockwise, -1: counterclockwise
 		color: '#fff', // #rgb or #rrggbb or array of colors
 		speed: 1, // Rounds per second
 		trail: 60, // Afterglow percentage
 		shadow: false, // Whether to render a shadow
 		hwaccel: false, // Whether to use hardware acceleration
 		zIndex: 2e9 // The z-index (defaults to 2000000000)
 	};

 	slgPleaseWaitModel.spinner = new slgSpinner(opts).spin(document.getElementById('slgPleaseWaitSpinner'));

 	function show(timeoutDelay) {
 		timeoutDelay = (timeoutDelay === null || timeoutDelay === undefined) ? 300 : timeoutDelay;

 		if (slgPleaseWaitModel.count === 0) {
 			slgPleaseWaitModel.safetyTimeout = $timeout(function () { hidePleaseWait_Internal(); }, 10000);

 			slgPleaseWaitModel.slgPleaseWaitTimeout = $timeout(function () {
 				showPleaseWait_Internal();
 			}, timeoutDelay);
 		}

 		slgPleaseWaitModel.count++;
 	}

 	function forceShow() {
 		showPleaseWait_Internal();
 	}

 	function forceHide() {
 		slgPleaseWaitModel.count = 0;
		hidePleaseWait_Internal();
 	}

 	function hide() {
 		if (slgPleaseWaitModel.count === 0)
 			return;

 		slgPleaseWaitModel.count--;

 		if (slgPleaseWaitModel.count === 0)
 			hidePleaseWait_Internal();
 	}

 	function showPleaseWait_Internal() {
 		var element = document.getElementById("slgPleaseWaitOverlay");

 		element.style.display = 'inline-block';
 	}

 	function hidePleaseWait_Internal() {
 		var element = document.getElementById("slgPleaseWaitOverlay");

 		element.style.display = "none";
 		$timeout.cancel(slgPleaseWaitModel.slgPleaseWaitTimeout);
 		$timeout.cancel(slgPleaseWaitModel.safetyTimeout);
 	}

 	return {
 		show: show,
 		hide: hide,
 		forceShow: forceShow,
 		forceHide: forceHide
 	}
 }]);
