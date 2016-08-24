angular.module('slgComponents')
.directive('slgButtonSpinner', ['$timeout', '$interval', '$q', function ($timeout, $interval, $q) {
	return {
		restrict: 'EA',
		scope: {},
		link: function (scope, element, attr) {
			scope.expanded = false;
			scope.inProcess = false;
			scope.showSuccessIndicator = true;

			element.append(angular.element("<div id='slgButtonSpinner_spinner_" + scope.$id + "' class='slgButtonSpinner_spinner'></div>"));
			element.append(angular.element("<div id='slgButtonSpinner_check_" + scope.$id + "' class='slgButtonSpinner_check'><i class='fa fa-check-circle-o'></i></div>"));
			element.append(angular.element("<div id='slgButtonSpinner_error_" + scope.$id + "' class='slgButtonSpinner_error'><i class='fa fa-times-circle-o'></i></div>"));

			if (attr["slgButtonSpinner"]) {
				scope.$watch('$parent.' + attr["slgButtonSpinner"], function (newVal, oldVal) {
					if (oldVal === newVal)
						return;

					if (newVal === true) {
						scope.waitToShowSpinner = $timeout(function () {
							expand().then(function () {
								showSpinner();
							})
						}, 100)
					}
					else if (newVal === false) {
						$timeout.cancel(scope.waitToShowSpinner);
						hideSpinner();

						if (scope.showSuccessIndicator === false) {
							collapse();
						}
						else {
							//var spinnerDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
							//var checkWidth = parseInt(slgGetStyle(spinnerDiv, "width").replace("px", ""));
							//var padding = parseInt(slgGetStyle(element[0], "padding-right").replace("px", ""));
							//var newPadding = padding - checkWidth;
							//console.log(checkWidth, padding, newPadding);
							//element[0].style.paddingRight = newPadding;
							//spinnerDiv.style.display = "inline-block";
							var spinnerDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
							spinnerDiv.style.display = "inline-block";

							//$timeout(function () {
							//	var spinnerDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
							//	spinnerDiv.style.display = "none";
							//	collapse();
							//}, 3000);	
						}
					}
				});
			}

			function expand() {
				if (scope.expanded === true)
					return $q.when();

				var deferred = $q.defer();

				waitForInProcessToFinish().then(function () {
					scope.inProcess = true;
					scope.expanded = true;

					var height = element[0].clientHeight;

					var expandPixels = 5;

					if (height <= 20) 
						expandPixels = 3.5;
					else if (height <= 32) 
						expandPixels = 4;

					scope.originalPadding = parseInt(slgGetStyle(element[0], "padding-right").replace('px', ''));
					var nextPadding = scope.originalPadding;

					var count = 40;
					var boingInterval = $interval(function () {
						if (count > 32) {
							nextPadding = nextPadding - 1;
							element[0].style.paddingRight = nextPadding + "px";
						}
						else if (count > 24) {
							// do nothing
						}
						else if (count > 14) {
							nextPadding = nextPadding + expandPixels;
							element[0].style.paddingRight = nextPadding + "px";
						}
						else if (count > 10) {
							// do nothing
						}
						else if (count > 0) {
							nextPadding = nextPadding - 1;
							element[0].style.paddingRight = nextPadding + "px";
						}
						else {

							$interval.cancel(boingInterval);
							scope.inProcess = false;

							deferred.resolve();							
						}

						count--;
					}, 10);
				})

				return deferred.promise;
			}

			function collapse() {
				if (scope.showing === false)
					return $q.when();

				var deferred = $q.defer();

				waitForInProcessToFinish().then(function () {
					scope.inProcess = true;
					scope.expanded = false;

					var spinnerDiv = document.getElementById("slgButtonSpinner_spinner_" + scope.$id);
					spinnerDiv.style.display = "none";

					var height = element[0].clientHeight;
					var expandPixels = 5;

					if (height <= 20) {
						expandPixels = 3.5;
					}
					else if (height <= 32) {
						expandPixels = 4;
					}

					var nextPadding = parseInt(slgGetStyle(element[0], "padding-right").replace('px', ''));

					var count = 40;
					var boingInterval = $interval(function () {
						if (count > 32) {
							nextPadding = nextPadding + 1;
							element[0].style.paddingRight = nextPadding + "px";
						}
						else if (count > 24) {
							// do nothing
						}
						else if (count > 14) {
							nextPadding = nextPadding - expandPixels;
							element[0].style.paddingRight = nextPadding + "px";
						}
						else if (count > 10) {
							// do nothing
						}
						else if (count > 0) {
							nextPadding = nextPadding + 1;
							element[0].style.paddingRight = nextPadding + "px";
						}
						else {
							$interval.cancel(boingInterval);
							scope.inProcess = false;

							deferred.resolve();
						}

						count--;
					}, 10);
				});

				return deferred.promise;
			}

			function showSpinner() {
				var height = element[0].clientHeight;

				var spinnerLeft = 12;

				var opts = {
					color: "#fff"
				}

				if (height <= 20) {
					opts.radius = 3;
					opts.length = 3;
					opts.width = 1;
				}
				else if (height <= 28) {
					spinnerLeft = 15;
					opts.radius = 3;
					opts.length = 4;
					opts.width = 2;
				}
				else if (height <= 32) {
					spinnerLeft = 15;
					opts.radius = 4;
					opts.length = 4;
					opts.width = 2;
				}
				else {
					spinnerLeft = 20;
					opts.radius = 5;
					opts.length = 5;
					opts.width = 2;
				}

				var spinnerDiv = document.getElementById("slgButtonSpinner_spinner_" + scope.$id);
				spinnerDiv.style.left = spinnerLeft + "px";
				spinnerDiv.style.display = "inline-block";
				var spinner = new slgSpinner(opts).spin(spinnerDiv);
			}

			function hideSpinner() {
				var spinnerDiv = document.getElementById("slgButtonSpinner_spinner_" + scope.$id);
				spinnerDiv.style.display = "none";
			}

			function waitForInProcessToFinish() {
				if (scope.inProcess === false)
					return $q.when();

				var deferred = $q.defer();

				var infiniteLoopCheck = 100;
				var waitingInterval = $interval(function () {
					if (scope.inProcess === false || (infiniteLoopCheck-- <= 0)) {
						$interval.cancel(waitingInterval);
						if (infiniteLoopCheck <= 0)
							console.log("slgButtonSpinner wait failed");

						deferred.resolve();
					}
				}, 50);

				return deferred.promise;
			}

		}
	}
}]);