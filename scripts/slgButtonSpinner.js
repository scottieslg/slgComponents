angular.module('slgComponents')
.directive('slgButtonSpinner', ['$timeout', '$interval', '$q', function ($timeout, $interval, $q) {
	return {
		restrict: 'A',
		scope: {},
		link: function (scope, element, attr) {
			scope.expanded = false;
			scope.inProcess = false;
			scope.showSuccessIndicator = true;
			scope.errorFieldName = null;

			element.append(angular.element("<div id='slgButtonSpinner_spinner_" + scope.$id + "' class='slgButtonSpinner_spinner'></div>"));
			element.append(angular.element("<div id='slgButtonSpinner_check_" + scope.$id + "' class='slgButtonSpinner_check'><i class='fa fa-check-circle-o'></i></div>"));
			element.append(angular.element("<div id='slgButtonSpinner_error_" + scope.$id + "' class='slgButtonSpinner_error'><i class='fa fa-times-circle-o'></i></div>"));

			scope.$watch('$parent.' + attr["slgButtonSpinner"], function (newVal, oldVal) {
				if (oldVal === newVal)
					return;

				var status = (newVal) ? newVal.toLowerCase() : "";

				switch (status) {
					case "showspinner":
						element[0].disabled = true;

						scope.waitToShowSpinner = $timeout(function () {
							expand().then(function () {
								showSpinner();
							})
						}, 100)
						break;

					case "hidespinner":
						element[0].disabled = false;

						hideSpinner();
						collapse();
						break;

					case "showok":
						element[0].disabled = false;

						hideSpinner();

						var okCheckDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
						okCheckDiv.style.display = "inline-block";

						scope.okTimeout = $timeout(function () {
							var okCheckDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
							if (okCheckDiv) {
								okCheckDiv.style.display = "none";
								collapse();
							}
						}, 3000);

						break;

					case "showerror":
						hideSpinner();
						element[0].disabled = false;

						$timeout.cancel(scope.okTimeout);
						var okCheckDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
						okCheckDiv.style.display = "none";

						var errorDiv = document.getElementById("slgButtonSpinner_error_" + scope.$id);
						errorDiv.style.display = "inline-block";
						break;

					case "reset":
					default:
						hideSpinner();

						var okCheckDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
						okCheckDiv.style.display = "none";

						var errorDiv = document.getElementById("slgButtonSpinner_error_" + scope.$id);
						errorDiv.style.display = "none";

						collapse().then(function () {
							element[0].disabled = false;
						})

						break;
				}
			});

			function expand() {
				$timeout.cancel(scope.okTimeout);
				var okCheckDiv = document.getElementById("slgButtonSpinner_check_" + scope.$id);
				okCheckDiv.style.display = "none";

				var errorDiv = document.getElementById("slgButtonSpinner_error_" + scope.$id);
				errorDiv.style.display = "none";

				if (scope.$parent[attr["slgButtonSpinnerError"]])
					scope.$parent[attr["slgButtonSpinnerError"]] = null;

				if (scope.expanded === true)
					return $q.when();

				var deferred = $q.defer();

				waitForInProcessToFinish().then(function () {
					scope.inProcess = true;
					scope.expanded = true;

					// default button
					var expandPixels = 4;

					if (element[0].className.toLowerCase().indexOf("btn-xs") >= 0)
						expandPixels = 3.5;
					else if (element[0].className.toLowerCase().indexOf("btn-sm") >= 0)
						expandPixels = 4;
					else if (element[0].className.toLowerCase().indexOf("btn-xl") >= 0)
						expandPixels = 5;

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
				if (scope.expanded === false)
					return $q.when();

				var deferred = $q.defer();

				waitForInProcessToFinish().then(function () {
					scope.inProcess = true;
					scope.expanded = false;

					var spinnerDiv = document.getElementById("slgButtonSpinner_spinner_" + scope.$id);
					spinnerDiv.style.display = "none";

					// default button
					var expandPixels = 4;

					if (element[0].className.toLowerCase().indexOf("btn-xs") >= 0)
						expandPixels = 3.5;
					else if (element[0].className.toLowerCase().indexOf("btn-sm") >= 0)
						expandPixels = 4;
					else if (element[0].className.toLowerCase().indexOf("btn-xl") >= 0)
						expandPixels = 5;

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
				var opts = {
					color: "#fff",
					radius: 4,
					length: 4,
					width: 2
				}

				
				if (element[0].className.toLowerCase().indexOf("btn-xs") >= 0) {
					opts.radius = 3;
					opts.length = 3;
					opts.width = 1;
				}
				else if (element[0].className.toLowerCase().indexOf("btn-sm") >= 0) {
					opts.radius = 3;
					opts.length = 4;
					opts.width = 2;
				}
				else if (element[0].className.toLowerCase().indexOf("btn-xl") >= 0) {
					opts.radius = 5;
					opts.length = 5;
					opts.width = 2;
				}

				var spinnerDiv = document.getElementById("slgButtonSpinner_spinner_" + scope.$id);
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

			scope.$on("$destroy", function () {
				console.log("slgButtonSpinner.$destroy");
				$timeout.cancel(scope.waitToShowSpinner);
				$timeout.cancel(scope.okTimeout);
			});
		}
	}
}]);