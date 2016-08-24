angular.module('slgComponents')
.directive("slgScrollableView", ['$timeout', function ($timeout) {
	return {
		restrict: "E",
		scope: {
			ngModel: "=",
			showSearch: "=",
			items: "=",			
			idFieldName: "@?",
			textFieldName: "@?"
		},
		template:
			"<div class='slgScrollableView' id='slgScrollableView_{{$id}}'>" +
			"	<div ng-show='showSearch === true'> " +
			"		<input ng-model='searchText' />" +
			"	</div>" +
			"	si: {{selectedIndex}} {{selectedId}}" +
			"	<ul ng-if='state === \"Expanded\"' class='slgScrollableView list-group' ng-mouseout='onMouseOut()'> " +
			"		<li ng-repeat='item in visibleItems' class='list-group-item' ng-mouseover='onMouseOver($index)' ng-click='onClick(item)' ng-class='{ \"bg-success\": selectedId === item.id, \"bg-primary\": selectedId !== item.id && selectedIndex === $index }' data-id='{{item.id}}'>{{item.text}}</li> " +
			"	</ul>" +
			"</div>",
		controller: ['$scope', function ($scope) {
			$scope.selectedIndex = 0;
			$scope.idFieldName = $scope.idFieldName || "id";
			$scope.textFieldName = $scope.textFieldName || "text";
			$scope.state = "Expanded";

			$scope.$watchCollection("items", function () {
				$scope.visibleItems = [];

				angular.forEach($scope.items, function (i) {
					$scope.visibleItems.push({
						id: i[$scope.idFieldName],
						text: i[$scope.textFieldName]
					})
				})
			});

			$scope.onMouseOut = function () {
				$scope.selectedIndex = null;
			}

			$scope.onMouseOver = function (idx) {
				$scope.selectedIndex = idx;
			}

			$scope.onClick = function (item) {
				if ($scope.items && $scope.items.length > 0) {
					for (i = 0; i < $scope.items.length; i++) {
						if ($scope.items[i][$scope.idFieldName] === item.id) {
							$scope.selectedItem = $scope.items[i];
							$scope.selectedId = item.id;
							break;
						}
					}
				}
				else {
					$scope.selectedItem = null;
				}
			}
		}]
	}
}]);