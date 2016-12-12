angular.module('slgComponents')
.directive('slgTabs', ['$timeout', '$interval', '$compile', function ($timeout, $interval, $compile) {
    return {
        restrict: 'E',
        scope: {
            tabNames: "=",
            selectedIndex: "=?",
            onTabSelected_Callback: "&?onTabSelected"
        },
        template: "<div id='slgTabs_{{$id}}' class='slgTabs'>" +
                  "    <button ng-click='onClick($index)' ng-repeat='name in tabNames_Internal' ng-class='{ \"btn-success\": selectedIndex === $index }' class='btn btn-primary' ng-bind-html='name'></button>" +
                  "</div>",
        controller: ['$scope', '$sce', function ($scope, $sce) {
            if (!$scope.selectedIndex)
                $scope.selectedIndex = 0;

            $scope.$watch('tabNames', function () {
                $scope.tabNames_Internal = [];

                if ($scope.tabNames) {
                    angular.forEach($scope.tabNames, function (name) {
                        tabNameSafe = $sce.trustAsHtml(name);
                        $scope.tabNames_Internal.push(tabNameSafe);
                    })
                }
            });

            $scope.onClick = function (index) {
                $scope.selectedIndex = index;

                if ($scope.onTabSelected_Callback)
                    $scope.onTabSelected_Callback({ index: index });
            }
        }]
    }
}]);

