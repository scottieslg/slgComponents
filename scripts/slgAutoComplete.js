angular.module('slgComponents')
.directive('slgAutoComplete', ['$timeout', '$interval', '$compile', function ($timeout, $interval, $compile) {
	return {
		restrict: 'A',
		scope: {
			ngModel: "=",
			selectedModel: "=?slgAutoCompleteSelectedModel",
			getUrl: "@?slgAutoCompleteGetUrl",
			dataList: "=?slgAutoCompleteDataList",
			minChars: "=?slgAutoCompleteMinChars",
			allowFreeFormText: "=?slgAutoCompleteAllowFreeFormText",
			delay: "=?slgAutoCompleteDelay",
			width: "=?slgAutoCompleteWidth",
			height: "=?slgAutoCompleteHeight",
			listFormatter: "&?slgAutoCompleteListFormatter",
			textboxFormatter: "&?slgAutoCompleteTextboxFormatter"
		},
		require: 'ngModel',
		link: function (scope, element, attrs, ngModelCtrl) {
			scope.delay = scope.delay || 300;
			scope.minChars = scope.minChars || 3;
			scope.height = scope.height || "200px";
			scope.allowFreeFormText = scope.allowFreeFormText || false;

			if (!attrs["id"])
				element[0].setAttribute('id', 'slgAutoComplete_textbox_' + scope.$id);

			scope.textboxId = element.attr("id");

			var timeout = 100;
			scope.waitForAutoCompleteToRender = $interval(function () {
				var slgAutoCompleteElement = document.getElementById('slgAutoComplete_' + scope.$id);

				if (slgAutoCompleteElement || timeout <= 0) {
					$interval.cancel(scope.waitForAutoCompleteToRender);

					if (timeout === 0) {
						console.log("Element not found");
						return;
					}

					if (scope.height)
						slgAutoCompleteElement.style.maxHeight = scope.height;
					else
						slgAutoCompleteElement.style.maxHeight = "200px";

					if (scope.width) {
						slgAutoCompleteElement.style.width = scope.width;
						slgAutoCompleteElement.style.minWidth = scope.width;
					}
					else {
						var textboxWidth = element.prop('offsetWidth');
						resize();

						scope.resizeEvent = window.addEventListener('resize', resize, false);
					}
				}
			}, 50);

			function resize() {
				var textboxWidth = element.prop('offsetWidth');
				document.getElementById('slgAutoComplete_' + scope.$id).style.width = textboxWidth + "px";
				document.getElementById('slgAutoComplete_' + scope.$id).style.minWidth = textboxWidth + "px";
			}

			document.addEventListener('click', hideList, false);
			function hideList(e) {
				var el = angular.element(e.target);

				// If they clicked on this textbox, don't hide the list
				if (el.attr("id") === scope.textboxId) {
					return;
				}

				// If they clicked on the li, get the underlying ul and check for the id
				el = angular.element(el[0].parentNode);
				if (el.attr("id") === 'slgAutoComplete_' + scope.$id)
					return;

				scope.visible = false;


				if (scope.allowFreeFormText === true) {
				}
				else {
					if (scope.selectedModel)
						scope.ngModel = scope.textboxFormatter({ item: scope.selectedModel });
					else {
						scope.ngModel = null;
					}
				}

				scope.$apply();
			}

			var html =
				"<ul ng-show='visible' id='slgAutoComplete_{{$id}}' class='slgAutoComplete list-group'> " +
				"	<li ng-repeat='item in visibleListItems' class='list-group-item list-group-item-action' ng-class='{ \"active\" : selectedIndex === $index }' ng-mouseover='onMouseOver($index)' ng-click='onClick($index)' ng-bind-html='item | toTrusted'>{{item}}</li>" +
				"</ul>";


			var compiled = $compile(html)(scope);
			element.after(compiled);


			element.bind('keydown', function (e) {
				console.log(e.which)
				// down arrow
				if (e.which === 40) {
					scope.selectedIndex++;

					if (scope.selectedIndex >= scope.visibleListItems.length - 1)
						scope.selectedIndex = scope.visibleListItems.length - 1;

					scope.$apply();
				}
				else if (e.which === 38) {
					scope.selectedIndex--;

					if (scope.selectedIndex < 0)
						scope.selectedIndex = 0;

					scope.$apply();
				}
				else if (e.which === 9) {
					if (scope.delayTimeout || scope.loadingData === true)
						scope.selectFirstItemAfterLoad = true;
					else {
						if (scope.allowFreeFormText === true && scope.selectedIndex === -1) {
							scope.selectedModel = null;
							scope.visible = false;
						}
						else
							scope.onClick(scope.selectedIndex);
					}

					scope.$apply();

				}
				else if (e.which === 13) {
					if (scope.selectedIndex === -1)
						return;

					// If we're still loading the data, but 
					if (scope.loadingData === true)
						return;
					else {
						scope.onClick(scope.selectedIndex);
						scope.$apply();
					}
				}
				else if (e.which === 8 || e.which === 46) {
					$timeout.cancel(scope.delayTimeout);

					scope.delayTimeout = $timeout(function () {
						scope.delayTimeout = null;
						scope.searchText = scope.ngModel;

						scope.refreshList();
					}, scope.delay);
				}
				else if (e.which === 27) {
					if (scope.selectedIndex > -1)
						scope.selectedIndex = -1;
					else
						scope.visible = false;

					scope.$apply();
				}
			});

			element.bind('keypress', function (e) {
				if (e.which === 13)
					return;

				$timeout.cancel(scope.delayTimeout);

				scope.delayTimeout = $timeout(function () {
					scope.delayTimeout = null;
					scope.searchText = scope.ngModel;

					scope.refreshList();
				}, scope.delay);
			});

			element.bind('focus', function (e) {
				scope.selectFirstItemAfterLoad = false;
			});


			scope.$on("$destroy", function () {
				element.unbind('keypress');
				window.removeEventListener('resize', resize, false);
				document.removeEventListener('click', hideList, false);
			})
		},
		controller: ['$scope', '$interval', '$http', '$q', '$sce', function ($scope, $interval, $http, $q, $sce) {
			$scope.loadingData = false;
			$scope.selectedIndex = -1;
			$scope.selectFirstItemAfterLoad = false;
			$scope.visible = false;

			$scope.onMouseOver = function (idx) {
				$scope.selectedIndex = idx;
			}

			$scope.onClick = function (idx) {
				$scope.visible = false;

				if (idx === -1 || (!$scope.visibleItems || $scope.visibleItems.length === 0)) {
					if ($scope.selectedModel && $scope.textboxFormatter) 
						$scope.ngModel = $scope.textboxFormatter({ item: $scope.selectedModel });
					else
						$scope.ngModel = null;

					return;
				}

				if ($scope.selectedModel !== undefined)
					$scope.selectedModel = $scope.visibleItems[idx];

				if ($scope.textboxFormatter) {
					$scope.ngModel = $scope.textboxFormatter({ item: $scope.visibleItems[idx] });
				}
			}

			$scope.$watch('dataList', function () {
				$scope.allItems = $scope.dataList;
			});

			$scope.refreshList = function () {
				if (!$scope.searchText || $scope.searchText === '') {
					$scope.visibleItems = [];
					$scope.visibleListItems = [];
					return;
				}

				getItems().then(function (items) {
					$scope.allItems = items;

					$scope.formattedItems = [];
					$scope.visibleItems = [];
					$scope.visibleListItems = [];

					var exactMatchItems = [];
					var exactMatchListItems = [];
					var partialMatchItems = [];
					var partialMatchListItems = [];
					var searchTerms = $scope.searchText.split(' ');

					angular.forEach($scope.allItems, function (item) {
						if ($scope.listFormatter) {
							var formattedString = $scope.listFormatter({ item: item });

							if (formattedString.toLowerCase().indexOf($scope.searchText.toLowerCase()) >= 0) {
								var index = formattedString.toLowerCase().indexOf($scope.searchText.toLowerCase());
								var length = $scope.searchText.length;

								var exactMatchStringStart = formattedString.substring(0, index);
								var exactMatchStringMiddle = formattedString.substring(index, index + length);
								var exactMatchStringEnd = formattedString.substring(index + length, formattedString.length);

								var exactMatchString = exactMatchStringStart + "<span class='slgAutoCompleteHighlight'>" + exactMatchStringMiddle + "</span>" + exactMatchStringEnd;
								exactMatchItems.push(item);
								exactMatchListItems.push(exactMatchString);
							}
							else {
								var searchTerms = $scope.searchText.toLowerCase().split(' ');

								var highlightedString = ''

								var highlightPositions = [];

								angular.forEach(searchTerms, function (searchTerm, index) {
									var lowercaseString = formattedString.toLowerCase();
									var currentIndex = 0;
									var infiniteLoopCheck = 10;

									while (lowercaseString.indexOf(searchTerm, currentIndex) >= 0 && --infiniteLoopCheck > 0) {
										currentIndex = lowercaseString.indexOf(searchTerm, currentIndex);
										highlightPositions.push({ index: currentIndex, length: searchTerm.length });
										currentIndex++;	// If we leave it at the current position, it will just keep finding the same item
									}
								});

								if (highlightPositions.length > 0) {
									highlightPositions.sort(function (a, b) { return (a.index === b.index) ? (a.length > b.length) ? 1 : (a.length < b.length) ? -1 : 0 : (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0); });

									var tempArray = [];
									angular.forEach(highlightPositions, function (element, index) {
										tempArray.push(highlightPositions[index])

										if (index > 0) {
											var previousIndex = highlightPositions[index - 1].index;
											var previousLength = highlightPositions[index - 1].length;
											var thisIndex = highlightPositions[index].index;
											var thisLength = highlightPositions[index].length;

											// If the strings are something like this...  ABCDEFG [ABCDE] and [BCD], the BCD is inside the ABCDE, so just leave it alone.
											// Else, it will be something like [ABCD] and [CDEF].  We need to move the length to include the EF
											if (previousIndex + previousLength > thisIndex) {
												// remove the last one added since we are combining them
												tempArray.pop(tempArray.length - 1);
												if (thisIndex + thisLength > previousIndex + previousLength)
													tempArray[tempArray.length - 1].length = ((thisIndex + thisLength) - previousIndex);
											}
										}
									});

									highlightPositions = tempArray;

									angular.forEach(highlightPositions, function (position, index) {
										if (index === 0)
											highlightedString = formattedString.substring(0, highlightPositions[0].index);
										else
											highlightedString += formattedString.substring(highlightPositions[index - 1].index + highlightPositions[index - 1].length, highlightPositions[index].index);
										highlightedString += "<span class='slgAutoCompleteHighlight'>";
										highlightedString += formattedString.substring(position.index, position.index + position.length);
										highlightedString += "</span>";
									});

									highlightedString += formattedString.substring(highlightPositions[highlightPositions.length - 1].index + highlightPositions[highlightPositions.length - 1].length, formattedString.length);
									partialMatchItems.push(item);
									partialMatchListItems.push(highlightedString);
								}
							}
						}
					});

					$scope.visibleItems = [];
					$scope.visibleItems = $scope.visibleItems.concat(exactMatchItems);
					$scope.visibleItems = $scope.visibleItems.concat(partialMatchItems);

					$scope.visibleListItems = [];
					$scope.visibleListItems = $scope.visibleListItems.concat(exactMatchListItems);
					$scope.visibleListItems = $scope.visibleListItems.concat(partialMatchListItems);

					if ($scope.selectFirstItemAfterLoad === true) {
						$scope.selectFirstItemAfterLoad = false;

						if ($scope.allowFreeFormText === true && $scope.visibleItems.length === 0) {
							$scope.selectedModel = null;
							$scope.visible = false;
							return;
						}

						$scope.selectedIndex = 0;
						$scope.onClick(0);
						return;
					}

					$scope.visible = $scope.visibleItems.length > 0;
					$scope.selectedIndex = ($scope.visibleItems.length > 0) ? 0 : -1;
				})
			}

			function getItems() {
				if ($scope.searchText.length < $scope.minChars)
					return $q.when($scope.allItems);

				if ($scope.dataList)
					return $q.when($scope.dataList);

				else if ($scope.getUrl) {
					var deferred = $q.defer();

					$scope.loadingData = true;

					var url = $scope.getUrl;
					if (url.indexOf("?") > 0)
						url += "&searchText=" + $scope.searchText;
					else
						url += "?searchText=" + $scope.searchText;

					$http.get(url)
					    .then(function (response) {
					    	$scope.loadingData = false;
					    	deferred.resolve(response.data);
					    },
						function (response) {
							console.log(response);
						}
					);

					return deferred.promise;
				}
			}

			function hideList() {

			}
		}]
	}
}])
.filter("toTrusted", ['$sce', function ($sce) {
	return function (text) {
		return $sce.trustAsHtml(text);
	}
}]);