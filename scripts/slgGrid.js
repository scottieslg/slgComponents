angular.module('slgComponents')
.directive('slgGrid', ['$timeout', '$interval', '$q', function ($timeout, $interval, $q) {
	return {
		restrict: 'E',
		scope: {
			gridLineTemplate: "@?",
			gridLineTemplateUrl: "@?",
			detailTemplate: "@?",
			detailTemplateUrl: "@?",
			detailExpandedTemplate: "@?",
			detailExpandedTemplateUrl: "@?",
			items: "="
		},
		transclude: true,
		replace: true,
		template:
			"<div class='slgGrid' id='slgGrid_{{$id}}> " +
			"	<div class='slgGrid_gridContainer'>" +
			"		<div class='gridHeader'></div>" +
			"		<div class='gridBody'>" +
			"	</div>" +
			"	<div class='slgGrid_detailContainer'>" +
			"		<div class='slgGrid_expandTab' ng-click='expand()'></div>" +
			"		<div class='slgGrid_collapseTab' ng-click='collapse()'></div>" +
			"		<div class='slgGrid_detail'></div>" +
			"	</div>" +
			"</div>",

		link: function (scope, element, attr) {
			scope.$watch('items', function () {
				if (!scope.items || scope.items.length === 0) {
					var detail = element.find(".slgGridDetail");
					detail.empty();
				}
			});

			resize();

			function resize() {
				var parent = element.parent();
				//element.css("height", parent.css("height") + "px");
				console.log(parent.css('height'))
			}
		},
		controller: ['$scope', '$compile', function ($scope, $compile) {
			console.log('2');
		}]
	}
}]);