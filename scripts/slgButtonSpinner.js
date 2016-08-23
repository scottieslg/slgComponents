angular.module('slgComponents')
.directive('slgButtonSpinner', ['$timeout', '$interval', function ($timeout, $interval) {
	return {
		restrict: 'EA',
		scope: {},
		link: function (scope, element, attr) {
			scope.showing = false;

			element.append(angular.element("<div id='slgButtonSpinner_spinner_" + scope.$id + "' class='slgButtonSpinner-Spinner'></div>"));

			if (attr["slgButtonSpinner"]) {
				scope.$watch('$parent.' + attr["slgButtonSpinner"], function (newVal, oldVal) {
					if (oldVal === newVal)
						return;

					if (newVal === true && scope.showing === false)
						scope.showSpinner();
					else if (newVal == false && scope.showing === true)
						scope.hideSpinner();
				});
			}

			scope.showSpinner = function () {
				if (scope.showing === true)
					return;

				scope.showing = true;

				var height = element[0].clientHeight;
				console.log(height);
				var opts = {
					color: "#fff"
				}
				var expandPixels = 5;
				var spinnerLeft = 12;

				console.log(height);
				if (height <= 20) {
					expandPixels = 3.5;
					opts.radius = 3;
					opts.length = 3;
					opts.width = 1;
				}
				else if (height <= 28) {
					expandPixels = 4;
					spinnerLeft = 15;
					opts.radius = 3;
					opts.length = 4;
					opts.width = 2;
				}
				else if (height <= 32) {
					expandPixels = 4;
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

						var spinnerDiv = document.getElementById("slgButtonSpinner_spinner_" + scope.$id);
						spinnerDiv.style.left = spinnerLeft + "px";
						spinnerDiv.style.display = "inline-block";
						var spinner = new slgSpinner(opts).spin(spinnerDiv);

					}

					count--;
				}, 10);
			}

			scope.hideSpinner = function () {
				if (scope.showing === false)
					return;

				var spinnerDiv = document.getElementById("slgButtonSpinner_spinner_" + scope.$id);
				spinnerDiv.style.display = "none";

				var height = element[0].clientHeight;
				console.log(height);
				var expandPixels = 5;

				console.log(height);
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
					}

					count--;
				}, 10);

				scope.showing = false;
			}

		},
		controller: ['$scope', function ($scope) {

		}]
	}
}]);