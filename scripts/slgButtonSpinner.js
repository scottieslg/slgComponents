angular.module('slgComponents')
.directive('slgButtonSpinner', ['$timeout', function ($timeout) {
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
                scope.showing = true;

                element.removeClass('slgButtonSpinnerCollapse');
                element.addClass('slgButtonSpinnerGrow');
                element.addClass('right');

                var target = document.getElementById('slgButtonSpinner_spinner_' + scope.$id);

                var height = target.clientHeight;
                console.log(height);

                if (height <= 12) {
                    var opts = {
                        radius: 3,
                        length: 3,
                        width: 1,
                        color: "#fff"
                    }
                }
                else if (height <= 14) {
                    var opts = {
                        radius: 4,
                        length: 4,
                        width: 2,
                        color: "#fff"
                    }
                }
                else {
                    var opts = {
                        radius: 5,
                        length: 5,
                        width: 3,
                        color: "#fff"
                    }
                }
                var spinner = new slgSpinner(opts).spin(target);
            }

            scope.hideSpinner = function () {
                element.removeClass('slgButtonSpinnerGrow');
                element.addClass('slgButtonSpinnerCollapse');

                scope.showing = false;
            }
        },
        controller: ['$scope', function ($scope) {

        }]
    }
}]);