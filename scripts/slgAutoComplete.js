﻿angular.module('slgComponents')
.directive('slgAutoComplete', ['$timeout', '$interval', '$compile', function ($timeout, $interval, $compile) {
	return {
		restrict: 'A',
		scope: {
			ngModel: "=",
			selectedModel: "=?slgAutoCompleteSelectedModel",
			getUrl: "@?slgAutoCompleteGetUrl",
			items: "=?slgAutoCompleteItems",
			minChars: "=?slgAutoCompleteMinChars",
			allowFreeFormText: "=?slgAutoCompleteAllowFreeFormText",
			delay: "=?slgAutoCompleteDelay",
			width: "@?slgAutoCompleteWidth",
			height: "@?slgAutoCompleteHeight",
			ngMouseover: "&?",
			listTextFormatter: "&?slgAutoCompleteListTextFormatter",
			listHtmlFormatter: "&?slgAutoCompleteListHtmlFormatter",
			textboxFormatter: "&?slgAutoCompleteTextboxFormatter",
			onSelectCallback: "&?slgAutoCompleteOnSelect"
		},
		require: 'ngModel',
		link: function (scope, element, attrs, ngModelCtrl) {
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
						scope.resize();

						scope.resizeEvent = window.addEventListener('resize', scope.resize, false);
					}
				}
			}, 50);

			scope.resize = function () {
				if (!scope.width) {
					var textboxWidth = element.prop('offsetWidth');
					document.getElementById('slgAutoComplete_' + scope.$id).style.width = textboxWidth + "px";
					document.getElementById('slgAutoComplete_' + scope.$id).style.minWidth = textboxWidth + "px";
				}
			}

			document.addEventListener('click', hideList, false);
			function hideList(e) {
				$timeout(function () {
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
						if (scope.selectedModel) {
							scope.ngModel = scope.textboxFormatter({ item: scope.selectedModel });
						}
						else {
							scope.ngModel = null;
						}
					}
				})
			}

			var html =
				"<ul ng-show='visible' ng-mouseout='selectedIndex = -1;' id='slgAutoComplete_{{$id}}' class='slgAutoComplete list-group'> " +
				"	<li id='slg_{{$index}}' data-index='{{$index}}' ng-repeat='item in visibleListItems' ng-mouseover='onMouseOver()' class='list-group-item list-group-item-action' ng-class='{ \"active\" : selectedIndex === $index }' ng-click='onClick($index)' ng-bind-html='item.text | toTrusted'>{{item.text}}</li>" +
				"</ul>";


			var compiled = $compile(html)(scope);
			element.after(compiled);

			element.bind('keydown', function (e) {
				$timeout(function () {
					// down arrow
					if (e.which === 40) {
						if (!scope.visibleListItems || scope.visibleItems.length === 0)
							return;

						scope.visible = true;

						scope.selectedIndex++;

						if (scope.selectedIndex >= scope.visibleListItems.length - 1)
							scope.selectedIndex = scope.visibleListItems.length - 1;

						scrollIntoView();
					}
					else if (e.which === 38) {
						if (!scope.visibleListItems || scope.visibleItems.length === 0)
							return;

						scope.visible = true;

						scope.selectedIndex--;

						if (scope.selectedIndex < 0)
							scope.selectedIndex = 0;

						scrollIntoView();
					}
					else if (e.which === 9) {
						if (!element.val()) {
							$timeout.cancel(scope.delayTimeout);
							scope.visible = false;
							return;
						}

						if (scope.allowFreeFormText === true && scope.selectedIndex === -1) {
							$timeout.cancel(scope.delayTimeout);
							//scope.selectedModel = null;
							scope.visible = false;
							scope.selectedIndex = -1;
							return;
						}

						if (scope.delayTimeout || scope.loadingData === true)
							scope.selectFirstItemAfterLoad = true;
						else
							scope.onClick((scope.selectedIndex === -1) ? 0 : scope.selectedIndex);
					}
					else if (e.which === 13) {
						if (scope.selectedIndex === -1)
							return;

						// If we're still loading the data, but 
						if (scope.loadingData === true)
							return;
						else {
							scope.onClick((scope.selectedIndex === -1) ? 0 : scope.selectedIndex);
						}
					}
					else if (e.which === 8 || e.which === 46) {
						$timeout.cancel(scope.delayTimeout);

						scope.delayTimeout = $timeout(function () {
							scope.delayTimeout = null;

							scope.refreshList();
						}, scope.delay);
					}
					else if (e.which === 27) {
						if (scope.selectedIndex > -1)
							scope.selectedIndex = -1;
						else
							scope.visible = false;
					}
				})
			});

			function scrollIntoView() {
				var slgAutoCompleteElement = document.getElementById('slgAutoComplete_' + scope.$id);

				var selectedItem = slgAutoCompleteElement.querySelectorAll("[data-index='" + scope.selectedIndex + "']")[0];

				var scrollTop = slgAutoCompleteElement.scrollTop;
				var scrollBottom = slgAutoCompleteElement.scrollTop + slgAutoCompleteElement.clientHeight;

				var liTop = selectedItem.offsetTop;
				var liBottom = liTop + selectedItem.clientHeight;

				if (liTop < scrollTop)
					slgAutoCompleteElement.scrollTop = selectedItem.offsetTop;
				else if (liBottom > scrollBottom)
					slgAutoCompleteElement.scrollTop += selectedItem.clientHeight + 1;

			}

			element.bind('keypress', function (e) {
				if (e.which === 13)
					return;

				$timeout.cancel(scope.delayTimeout);

				scope.delayTimeout = $timeout(function () {
					scope.delayTimeout = null;

					scope.refreshList();
				}, scope.delay);
			});

			element.bind('focus', function (e) {
				$timeout(function () {
					scope.selectFirstItemAfterLoad = false;

					if (!scope.visibleListItems || scope.visibleItems.length === 0)
						return;

					if (!element.val() || element.val() === '') {
						scope.selectedIndex = -1;
						scope.visibleListItems = null;
						scope.visible = false;
						return;
					}
				})
			});


			scope.$on("$destroy", function () {
				element.unbind('keypress');
				window.removeEventListener('resize', scope.resize, false);
				document.removeEventListener('click', hideList, false);
			})
		},
		controller: ['$scope', '$interval', '$http', '$q', '$sce', function ($scope, $interval, $http, $q, $sce) {
			$scope.delay = $scope.delay || 300;
			$scope.minChars = $scope.minChars || 3;
			$scope.height = $scope.height || "200px";
			$scope.allowFreeFormText = $scope.allowFreeFormText || false;
			$scope.loadingData = false;
			$scope.selectedIndex = -1;
			$scope.selectFirstItemAfterLoad = false;
			$scope.visible = false;

			$scope.onMouseOver = function (idx) {
				if ($scope.ngMouseover)
					$scope.ngMouseover({ idx: idx, item: $scope.visibleItems[idx] });
			}

			$scope.onClick = function (idx) {
				$scope.visible = false;

				if (idx === -1 || (!$scope.visibleItems || $scope.visibleItems.length === 0)) {
					if ($scope.selectedModel && $scope.textboxFormatter) {
						$scope.ngModel = $scope.textboxFormatter({ item: $scope.selectedModel });
						if ($scope.onSelectCallback)
							$scope.onSelectCallback({ item: $scope.selectedModel });
					}
					else
						$scope.ngModel = null;

					return;
				}

				if ($scope.selectedModel !== undefined)
					$scope.selectedModel = $scope.visibleItems[idx];

				if ($scope.textboxFormatter) {
					$scope.ngModel = $scope.textboxFormatter({ item: $scope.visibleItems[idx] });
					if ($scope.onSelectCallback)
						$scope.onSelectCallback({ item: $scope.selectedModel });
				}
			}

			$scope.$watch("selectedModel", function () {
				if ($scope.selectedModel === null || $scope.selectedModel === undefined) {
					if ($scope.allowFreeFormText === false)
						$scope.ngModel = null;
				}
				else {
					if ($scope.textboxFormatter) {
						$scope.ngModel = $scope.textboxFormatter({ item: $scope.selectedModel });
					}
				}
			});

			$scope.$watch('items', function () {
				$scope.allItems = $scope.items;
			});

			$scope.refreshList = function () {
				$scope.visibleItems = [];
				$scope.visibleListItems = [];

				var searchText = document.getElementById($scope.textboxId).value;

				if (!searchText || searchText === '') {
					$scope.visible = false;
					$scope.selectedModel = null;
					return;
				}

				getItems(searchText).then(function (items) {
					$scope.allItems = items;

					$scope.formattedItems = [];

					var exactMatchAtFirstItems = [];
					var exactMatchAtFirstListItems = [];
					var exactMatchItems = [];
					var exactMatchListItems = [];
					var partialMatchItems = [];
					var partialMatchListItems = [];
					var searchTerms = searchText.split(' ');

					angular.forEach($scope.allItems, function (item) {
						if ($scope.listTextFormatter) {
							var formattedString = $scope.listTextFormatter({ item: item });

							if (formattedString.replace(/["']/g, "").toLowerCase().indexOf(searchText.replace(/["']/g, "").toLowerCase()) >= 0) {
								var index = formattedString.replace(/["']/g, "").toLowerCase().indexOf(searchText.toLowerCase());
								var length = searchText.length;

								// see if there was a single quote
								var hasSingleQuote = formattedString.substring(0, index + length + 1).indexOf("'") > 0;

								if (hasSingleQuote)
									length++;

								if (index === 0) {
									var exactMatchAtFirstStringStart = formattedString.substring(0, index);
									var exactMatchAtFirstStringMiddle = formattedString.substring(index, index + length);
									var exactMatchAtFirstStringEnd = formattedString.substring(index + length, formattedString.length);

									var exactMatchAtFirstString = exactMatchAtFirstStringStart + "<span class='slgAutoCompleteHighlight'>" + exactMatchAtFirstStringMiddle + "</span>" + exactMatchAtFirstStringEnd;
									exactMatchAtFirstItems.push(item);
									exactMatchAtFirstListItems.push(exactMatchAtFirstString);
								}
								else {
									var exactMatchStringStart = formattedString.substring(0, index);
									var exactMatchStringMiddle = formattedString.substring(index, index + length);
									var exactMatchStringEnd = formattedString.substring(index + length, formattedString.length);

									var exactMatchString = exactMatchStringStart + "<span class='slgAutoCompleteHighlight'>" + exactMatchStringMiddle + "</span>" + exactMatchStringEnd;
									exactMatchItems.push(item);
									exactMatchListItems.push(exactMatchString);
								}
							}
							else {
								var searchTerms = searchText.toLowerCase().split(' ');

								var highlightedString = ''

								var highlightPositions = [];

								angular.forEach(searchTerms, function (searchTerm, index) {
									var lowercaseString = formattedString.toLowerCase();
									var currentIndex = 0;
									var infiniteLoopCheck = 10;

									while (lowercaseString.replace(/["']/g, "").indexOf(searchTerm.replace(/["']/g, ""), currentIndex) >= 0 && --infiniteLoopCheck > 0) {
										currentIndex = lowercaseString.replace(/["']/g, "").indexOf(searchTerm.replace(/["']/g, ""), currentIndex);

										// see if there was a single quote
										var hasSingleQuote = lowercaseString.substring(currentIndex, currentIndex + searchTerm.length + 1).indexOf("'") > 0;
										if (hasSingleQuote) {
											highlightPositions.push({ index: currentIndex, length: searchTerm.length + 1 });
											currentIndex += 2;	// If we leave it at the current position, it will just keep finding the same item
										}
										else {
											highlightPositions.push({ index: currentIndex, length: searchTerm.length });
											currentIndex++;	// If we leave it at the current position, it will just keep finding the same item
										}
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

					$scope.visibleItems = $scope.visibleItems.concat(exactMatchAtFirstItems);
					$scope.visibleItems = $scope.visibleItems.concat(exactMatchItems);
					$scope.visibleItems = $scope.visibleItems.concat(partialMatchItems);


					angular.forEach(exactMatchAtFirstListItems, function (item) {
						$scope.visibleListItems.push({
							id: slgGuid(),
							text: item
						});
					})

					angular.forEach(exactMatchListItems, function (item) {
						$scope.visibleListItems.push({
							id: slgGuid(),
							text: item
						});
					})

					angular.forEach(partialMatchListItems, function (item) {
						$scope.visibleListItems.push({
							id: slgGuid(),
							text: item
						});
					})

					if ($scope.listHtmlFormatter) {
						angular.forEach($scope.visibleListItems, function (li, idx) {
							li.text = $scope.listHtmlFormatter({ html: li.text, item: $scope.visibleItems[idx] });
						});
					}

					$scope.resize();
					$scope.visible = $scope.visibleItems.length > 0;
					$scope.selectedIndex = ($scope.visibleItems.length > 0) ? 0 : -1;

					if ($scope.allowFreeFormText == true) {
						$scope.selectedIndex = -1;
						var activeElement = angular.element(document.activeElement);
						if (activeElement.attr('id') !== $scope.textboxId)
							$scope.visible = false;

						return;
					}

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
				})
			}

			function getItems(searchText) {
				if (searchText.length < $scope.minChars)
					return $q.when([]);

				if ($scope.items)
					return $q.when($scope.items);

				else if ($scope.getUrl) {
					var deferred = $q.defer();

					$scope.loadingData = true;

					var url = $scope.getUrl;
					if (url.indexOf("?") > 0)
						url += "&searchText=" + searchText;
					else
						url += "?searchText=" + searchText;

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
