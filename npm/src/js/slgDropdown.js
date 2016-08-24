angular.module('slgComponents')
.directive("slgDropdown", ['$timeout', '$window', function ($timeout, $window) {
	return {
		restrict: "E",
		replace: true,
		scope: {
			ngModel: "=",
			selectedText: "=?",
			placeholder: "@?",
			items: "=?",
			idFieldName: "@?",
			textFieldName: "@?",
			disabled: "=?ngDisabled",
			allowEmpty: "@?",
			getUrl: "@?",
			width: "@",
			height: "@?",
			showLoadingMessage: "=?",
			onSelectCallback: "&?onSelect",
			onClickCallback: "&?onClick"
		},
		require: "^ngModel",
		template:
			"<div id='slgDropdown_{{$id}}' class='slgDropdown'> " +
			"	<div class='selectedWrapper input-group'> " +
			"		<input style='width: 100%; background: white;' ng-disabled='disabled' readonly class='form-control' ngModel='selectedText' placeholder='{{placeholder}}' /> " +
			"		<span class='input-group-addon'><i class='fa fa-chevron-down'></i></span> " +
			"	</div> " +
			"	<slgScrollableView drop-down-data-items='dropDownDataItems'></slgScrollableView>" +
			"</div>",
		link: function ($scope, element, attrs, ngModelCtrl) {
		}
	}
}]);