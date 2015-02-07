(function(){angular.module("ngMaterial.components.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("date-picker/date-picker-dialog.html","<md-dialog class=\"mdc-date-picker\">\n    <!-- Date picker -->\n    <div md-theme=\"{{mdTheme}}\">\n      <!-- Current day of week -->\n      <md-toolbar class=\"md-hue-2 mdc-date-picker__current-day-of-week\">\n        <span>{{ moment(selected.date).format(\'dddd\') }}</span>\n      </md-toolbar>\n\n      <!-- Current date -->\n      <md-toolbar class=\"mdc-date-picker__current-date\">\n        <span>{{ moment(selected.date).format(\'MMM\') }}</span>\n        <strong>{{ moment(selected.date).format(\'DD\') }}</strong>\n        <a ng-click=\"displayYearSelection()\">{{ moment(selected.date).format(\'YYYY\') }}</a>\n      </md-toolbar>\n\n      <!-- Calendar -->\n      <div class=\"mdc-date-picker__calendar\" ng-if=\"!yearSelection\">\n        <div class=\"mdc-date-picker__nav\">\n          <md-button class=\"md-fab md-primary\" ng-click=\"previousMonth()\">\n            <i class=\"mdi mdi-chevron-left\"></i>\n          </md-button>\n\n          <span>{{ activeDate.format(\'MMMM YYYY\') }}</span>\n\n          <md-button class=\"md-fab md-primary\" ng-click=\"nextMonth()\">\n            <i class=\"mdi mdi-chevron-right\"></i>\n          </md-button>\n        </div>\n\n        <div class=\"mdc-date-picker__days-of-week\">\n          <span ng-repeat=\"day in daysOfWeek\">{{ day }}</span>\n        </div>\n\n        <div class=\"mdc-date-picker__days\">\n                    <span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\n                          ng-repeat=\"x in emptyFirstDays\">&nbsp;</span><!--\n\n                 --><div class=\"mdc-date-picker__day\"\n                         ng-class=\"{ \'mdc-date-picker__day--is-selected\': day.selected,\n                                     \'mdc-date-picker__day--is-today\': day.today }\"\n                         ng-repeat=\"day in days\">\n          <a ng-click=\"select(day)\">{{ day ? day.format(\'D\') : \'\' }}</a>\n        </div><!--\n\n                 --><span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\n                          ng-repeat=\"x in emptyLastDays\">&nbsp;</span>\n        </div>\n      </div>\n\n      <!-- Year selection -->\n      <div class=\"mdc-date-picker__year-selector\" ng-show=\"yearSelection\">\n        <a class=\"mdc-date-picker__year\"\n           ng-class=\"{ \'mdc-date-picker__year--is-active\': year == activeDate.format(\'YYYY\') }\"\n           ng-repeat=\"year in years\"\n           ng-click=\"selectYear(year)\"\n           ng-if=\"yearSelection\">\n          <span>{{year}}</span>\n        </a>\n      </div>\n\n      <!-- Actions -->\n      <div class=\"md-actions mdc-date-picker__actions\" layout=\"row\" layout-align=\"end\">\n        <md-button class=\"md-primary\" ng-click=\"cancel()\">Cancel</md-button>\n        <md-button class=\"md-primary\" ng-click=\"closePicker()\">Ok</md-button>\n      </div>\n    </div>\n</md-dialog>\n");
$templateCache.put("date-picker/date-picker-input.html","<md-input-container ng-click=\"openPicker($event)\">\n  <label>{{label}}</label>\n  <input type=\"text\" ng-model=\"selected.model\" ng-disabled=\"true\">\n</md-input-container>\n");}]);})();
(function(){/* global angular */
/* global moment */
/* global navigator */
'use strict'; // jshint ignore:line


angular.module('ngMaterial.components.datePicker', ['ngMaterial'])
.controller('mdcDatePickerController', function ($scope, $timeout, $mdDialog, model, locale, mdTheme) {
    function checkLocale(locale) {
      if (!locale) {
        return (navigator.language !== null ? navigator.language : navigator.browserLanguage).split('_')[0].split('-')[0] || 'en';
      }
      return locale;
    }

    $scope.model = model;
    $scope.mdTheme = mdTheme ? mdTheme : 'default';

    var activeLocale;

    this.build = function (locale) {
      activeLocale = locale;

      moment.locale(activeLocale);

      if (angular.isDefined($scope.model)) {
        $scope.selected = {
          model: moment($scope.model).format('LL'),
          date: $scope.model
        };

        $scope.activeDate = moment($scope.model);
      }
      else {
        $scope.selected = {
          model: undefined,
          date: new Date()
        };

        $scope.activeDate = moment();
      }

      $scope.moment = moment;

      $scope.days = [];
      //TODO: Use moment locale to set first day of week properly.
      $scope.daysOfWeek = [moment.weekdaysMin(1), moment.weekdaysMin(2), moment.weekdaysMin(3), moment.weekdaysMin(4), moment.weekdaysMin(5), moment.weekdaysMin(6), moment.weekdaysMin(0)];

      $scope.years = [];

      for (var y = moment().year() - 100; y <= moment().year() + 100; y++) {
        $scope.years.push(y);
      }

      generateCalendar();
    };
    this.build(checkLocale(locale));

    $scope.previousMonth = function () {
      $scope.activeDate = $scope.activeDate.subtract(1, 'month');
      generateCalendar();
    };

    $scope.nextMonth = function () {
      $scope.activeDate = $scope.activeDate.add(1, 'month');
      generateCalendar();
    };

    $scope.select = function (day) {
      $scope.selected = {
        model: day.format('LL'),
        date: day.toDate()
      };

      $scope.model = day.toDate();

      generateCalendar();
    };

    $scope.selectYear = function (year) {
      $scope.yearSelection = false;

      $scope.selected.model = moment($scope.selected.date).year(year).format('LL');
      $scope.selected.date = moment($scope.selected.date).year(year).toDate();
      $scope.model = moment($scope.selected.date).toDate();
      $scope.activeDate = $scope.activeDate.add(year - $scope.activeDate.year(), 'year');

      generateCalendar();
    };
    $scope.displayYearSelection = function () {
      //TODO: This requires JQuery and must be rewritten
      var calendarHeight = angular.element('.mdc-date-picker__calendar').outerHeight(),
        $yearSelector = angular.element('.mdc-date-picker__year-selector');

      $yearSelector.css({height: calendarHeight});

      $scope.yearSelection = true;

      $timeout(function () {
        var $activeYear = angular.element('.mdc-date-picker__year--is-active');

        $yearSelector.scrollTop($yearSelector.scrollTop() + $activeYear.position().top - $yearSelector.height() / 2 + $activeYear.height() / 2);
      });
    };

    function generateCalendar() {
      var days = [],
        previousDay = angular.copy($scope.activeDate).date(0),
        firstDayOfMonth = angular.copy($scope.activeDate).date(1),
        lastDayOfMonth = angular.copy(firstDayOfMonth).endOf('month'),
        maxDays = angular.copy(lastDayOfMonth).date();

      $scope.emptyFirstDays = [];

      for (var i = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1; i > 0; i--) {
        $scope.emptyFirstDays.push({});
      }

      for (var j = 0; j < maxDays; j++) {
        var date = angular.copy(previousDay.add(1, 'days'));

        date.selected = angular.isDefined($scope.selected.model) && date.isSame($scope.selected.date, 'day');
        date.today = date.isSame(moment(), 'day');

        days.push(date);
      }

      $scope.emptyLastDays = [];

      for (var k = 7 - (lastDayOfMonth.day() === 0 ? 7 : lastDayOfMonth.day()); k > 0; k--) {
        $scope.emptyLastDays.push({});
      }

      $scope.days = days;
    }

    $scope.cancel = function() {
      $mdDialog.hide();
    };

    $scope.closePicker = function () {
      $mdDialog.hide($scope.selected);
    };
  })
.controller('mdcDatePickerInputController', function ($scope, $attrs, $timeout, $mdDialog) {
    if (angular.isDefined($scope.model)) {
      $scope.selected = {
        model: moment($scope.model).format('LL'),
        date: $scope.model
      };
    }
    else {
      $scope.selected = {
        model: undefined,
        date: new Date()
      };
    }

    $scope.openPicker = function (ev) {
      $scope.yearSelection = false;

      $mdDialog.show({
        targetEvent: ev,
        templateUrl: 'date-picker/date-picker-dialog.html',
        controller: 'mdcDatePickerController',
        locals: {model: $scope.model, locale: $attrs.locale, mdTheme: $attrs.dialogMdTheme}
      }).then(function (selected) {
        if (selected) {
          $scope.selected = selected;
          $scope.model = selected.model;
        }
      });
    };
  })
.directive('mdcDatePicker', function () {
    return {
      restrict: 'AE',
      controller: 'mdcDatePickerInputController',
      scope: {
        model: '=',
        label: '@'
      },
      templateUrl: 'date-picker/date-picker-input.html'
    };
  });
})();
(function(){'use strict';

angular.module('ngMaterial.components', [
  'ngMaterial',
  'ngMaterial.components.templates',
  'ngMaterial.components.datePicker'
]);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi50bXAvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyIsInNyYy9kYXRlLXBpY2tlci9kYXRlLXBpY2tlci5qcyIsInNyYy9jb21wb25lbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbmd1bGFyLW1hdGVyaWFsLWNvbXBvbmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZShcIm5nTWF0ZXJpYWwuY29tcG9uZW50cy50ZW1wbGF0ZXNcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkgeyR0ZW1wbGF0ZUNhY2hlLnB1dChcImRhdGUtcGlja2VyL2RhdGUtcGlja2VyLWRpYWxvZy5odG1sXCIsXCI8bWQtZGlhbG9nIGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJcXFwiPlxcbiAgICA8IS0tIERhdGUgcGlja2VyIC0tPlxcbiAgICA8ZGl2IG1kLXRoZW1lPVxcXCJ7e21kVGhlbWV9fVxcXCI+XFxuICAgICAgPCEtLSBDdXJyZW50IGRheSBvZiB3ZWVrIC0tPlxcbiAgICAgIDxtZC10b29sYmFyIGNsYXNzPVxcXCJtZC1odWUtMiBtZGMtZGF0ZS1waWNrZXJfX2N1cnJlbnQtZGF5LW9mLXdlZWtcXFwiPlxcbiAgICAgICAgPHNwYW4+e3sgbW9tZW50KHNlbGVjdGVkLmRhdGUpLmZvcm1hdChcXCdkZGRkXFwnKSB9fTwvc3Bhbj5cXG4gICAgICA8L21kLXRvb2xiYXI+XFxuXFxuICAgICAgPCEtLSBDdXJyZW50IGRhdGUgLS0+XFxuICAgICAgPG1kLXRvb2xiYXIgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9fY3VycmVudC1kYXRlXFxcIj5cXG4gICAgICAgIDxzcGFuPnt7IG1vbWVudChzZWxlY3RlZC5kYXRlKS5mb3JtYXQoXFwnTU1NXFwnKSB9fTwvc3Bhbj5cXG4gICAgICAgIDxzdHJvbmc+e3sgbW9tZW50KHNlbGVjdGVkLmRhdGUpLmZvcm1hdChcXCdERFxcJykgfX08L3N0cm9uZz5cXG4gICAgICAgIDxhIG5nLWNsaWNrPVxcXCJkaXNwbGF5WWVhclNlbGVjdGlvbigpXFxcIj57eyBtb21lbnQoc2VsZWN0ZWQuZGF0ZSkuZm9ybWF0KFxcJ1lZWVlcXCcpIH19PC9hPlxcbiAgICAgIDwvbWQtdG9vbGJhcj5cXG5cXG4gICAgICA8IS0tIENhbGVuZGFyIC0tPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9fY2FsZW5kYXJcXFwiIG5nLWlmPVxcXCIheWVhclNlbGVjdGlvblxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX25hdlxcXCI+XFxuICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XFxcIm1kLWZhYiBtZC1wcmltYXJ5XFxcIiBuZy1jbGljaz1cXFwicHJldmlvdXNNb250aCgpXFxcIj5cXG4gICAgICAgICAgICA8aSBjbGFzcz1cXFwibWRpIG1kaS1jaGV2cm9uLWxlZnRcXFwiPjwvaT5cXG4gICAgICAgICAgPC9tZC1idXR0b24+XFxuXFxuICAgICAgICAgIDxzcGFuPnt7IGFjdGl2ZURhdGUuZm9ybWF0KFxcJ01NTU0gWVlZWVxcJykgfX08L3NwYW4+XFxuXFxuICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XFxcIm1kLWZhYiBtZC1wcmltYXJ5XFxcIiBuZy1jbGljaz1cXFwibmV4dE1vbnRoKClcXFwiPlxcbiAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJtZGkgbWRpLWNoZXZyb24tcmlnaHRcXFwiPjwvaT5cXG4gICAgICAgICAgPC9tZC1idXR0b24+XFxuICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9fZGF5cy1vZi13ZWVrXFxcIj5cXG4gICAgICAgICAgPHNwYW4gbmctcmVwZWF0PVxcXCJkYXkgaW4gZGF5c09mV2Vla1xcXCI+e3sgZGF5IH19PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheXNcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9fZGF5IG1kYy1kYXRlLXBpY2tlcl9fZGF5LS1pcy1lbXB0eVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXJlcGVhdD1cXFwieCBpbiBlbXB0eUZpcnN0RGF5c1xcXCI+Jm5ic3A7PC9zcGFuPjwhLS1cXG5cXG4gICAgICAgICAgICAgICAgIC0tPjxkaXYgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9fZGF5XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cXFwieyBcXCdtZGMtZGF0ZS1waWNrZXJfX2RheS0taXMtc2VsZWN0ZWRcXCc6IGRheS5zZWxlY3RlZCxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFwnbWRjLWRhdGUtcGlja2VyX19kYXktLWlzLXRvZGF5XFwnOiBkYXkudG9kYXkgfVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgbmctcmVwZWF0PVxcXCJkYXkgaW4gZGF5c1xcXCI+XFxuICAgICAgICAgIDxhIG5nLWNsaWNrPVxcXCJzZWxlY3QoZGF5KVxcXCI+e3sgZGF5ID8gZGF5LmZvcm1hdChcXCdEXFwnKSA6IFxcJ1xcJyB9fTwvYT5cXG4gICAgICAgIDwvZGl2PjwhLS1cXG5cXG4gICAgICAgICAgICAgICAgIC0tPjxzcGFuIGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheSBtZGMtZGF0ZS1waWNrZXJfX2RheS0taXMtZW1wdHlcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1yZXBlYXQ9XFxcInggaW4gZW1wdHlMYXN0RGF5c1xcXCI+Jm5ic3A7PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPCEtLSBZZWFyIHNlbGVjdGlvbiAtLT5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX3llYXItc2VsZWN0b3JcXFwiIG5nLXNob3c9XFxcInllYXJTZWxlY3Rpb25cXFwiPlxcbiAgICAgICAgPGEgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9feWVhclxcXCJcXG4gICAgICAgICAgIG5nLWNsYXNzPVxcXCJ7IFxcJ21kYy1kYXRlLXBpY2tlcl9feWVhci0taXMtYWN0aXZlXFwnOiB5ZWFyID09IGFjdGl2ZURhdGUuZm9ybWF0KFxcJ1lZWVlcXCcpIH1cXFwiXFxuICAgICAgICAgICBuZy1yZXBlYXQ9XFxcInllYXIgaW4geWVhcnNcXFwiXFxuICAgICAgICAgICBuZy1jbGljaz1cXFwic2VsZWN0WWVhcih5ZWFyKVxcXCJcXG4gICAgICAgICAgIG5nLWlmPVxcXCJ5ZWFyU2VsZWN0aW9uXFxcIj5cXG4gICAgICAgICAgPHNwYW4+e3t5ZWFyfX08L3NwYW4+XFxuICAgICAgICA8L2E+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPCEtLSBBY3Rpb25zIC0tPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcIm1kLWFjdGlvbnMgbWRjLWRhdGUtcGlja2VyX19hY3Rpb25zXFxcIiBsYXlvdXQ9XFxcInJvd1xcXCIgbGF5b3V0LWFsaWduPVxcXCJlbmRcXFwiPlxcbiAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cXFwibWQtcHJpbWFyeVxcXCIgbmctY2xpY2s9XFxcImNhbmNlbCgpXFxcIj5DYW5jZWw8L21kLWJ1dHRvbj5cXG4gICAgICAgIDxtZC1idXR0b24gY2xhc3M9XFxcIm1kLXByaW1hcnlcXFwiIG5nLWNsaWNrPVxcXCJjbG9zZVBpY2tlcigpXFxcIj5PazwvbWQtYnV0dG9uPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG48L21kLWRpYWxvZz5cXG5cIik7XG4kdGVtcGxhdGVDYWNoZS5wdXQoXCJkYXRlLXBpY2tlci9kYXRlLXBpY2tlci1pbnB1dC5odG1sXCIsXCI8bWQtaW5wdXQtY29udGFpbmVyIG5nLWNsaWNrPVxcXCJvcGVuUGlja2VyKCRldmVudClcXFwiPlxcbiAgPGxhYmVsPnt7bGFiZWx9fTwvbGFiZWw+XFxuICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgbmctbW9kZWw9XFxcInNlbGVjdGVkLm1vZGVsXFxcIiBuZy1kaXNhYmxlZD1cXFwidHJ1ZVxcXCI+XFxuPC9tZC1pbnB1dC1jb250YWluZXI+XFxuXCIpO31dKTsiLCIvKiBnbG9iYWwgYW5ndWxhciAqL1xuLyogZ2xvYmFsIG1vbWVudCAqL1xuLyogZ2xvYmFsIG5hdmlnYXRvciAqL1xuJ3VzZSBzdHJpY3QnOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuXG5hbmd1bGFyLm1vZHVsZSgnbmdNYXRlcmlhbC5jb21wb25lbnRzLmRhdGVQaWNrZXInLCBbJ25nTWF0ZXJpYWwnXSlcbi5jb250cm9sbGVyKCdtZGNEYXRlUGlja2VyQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCAkbWREaWFsb2csIG1vZGVsLCBsb2NhbGUsIG1kVGhlbWUpIHtcbiAgICBmdW5jdGlvbiBjaGVja0xvY2FsZShsb2NhbGUpIHtcbiAgICAgIGlmICghbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiAobmF2aWdhdG9yLmxhbmd1YWdlICE9PSBudWxsID8gbmF2aWdhdG9yLmxhbmd1YWdlIDogbmF2aWdhdG9yLmJyb3dzZXJMYW5ndWFnZSkuc3BsaXQoJ18nKVswXS5zcGxpdCgnLScpWzBdIHx8ICdlbic7XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9jYWxlO1xuICAgIH1cblxuICAgICRzY29wZS5tb2RlbCA9IG1vZGVsO1xuICAgICRzY29wZS5tZFRoZW1lID0gbWRUaGVtZSA/IG1kVGhlbWUgOiAnZGVmYXVsdCc7XG5cbiAgICB2YXIgYWN0aXZlTG9jYWxlO1xuXG4gICAgdGhpcy5idWlsZCA9IGZ1bmN0aW9uIChsb2NhbGUpIHtcbiAgICAgIGFjdGl2ZUxvY2FsZSA9IGxvY2FsZTtcblxuICAgICAgbW9tZW50LmxvY2FsZShhY3RpdmVMb2NhbGUpO1xuXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLm1vZGVsKSkge1xuICAgICAgICAkc2NvcGUuc2VsZWN0ZWQgPSB7XG4gICAgICAgICAgbW9kZWw6IG1vbWVudCgkc2NvcGUubW9kZWwpLmZvcm1hdCgnTEwnKSxcbiAgICAgICAgICBkYXRlOiAkc2NvcGUubW9kZWxcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuYWN0aXZlRGF0ZSA9IG1vbWVudCgkc2NvcGUubW9kZWwpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKClcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuYWN0aXZlRGF0ZSA9IG1vbWVudCgpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUubW9tZW50ID0gbW9tZW50O1xuXG4gICAgICAkc2NvcGUuZGF5cyA9IFtdO1xuICAgICAgLy9UT0RPOiBVc2UgbW9tZW50IGxvY2FsZSB0byBzZXQgZmlyc3QgZGF5IG9mIHdlZWsgcHJvcGVybHkuXG4gICAgICAkc2NvcGUuZGF5c09mV2VlayA9IFttb21lbnQud2Vla2RheXNNaW4oMSksIG1vbWVudC53ZWVrZGF5c01pbigyKSwgbW9tZW50LndlZWtkYXlzTWluKDMpLCBtb21lbnQud2Vla2RheXNNaW4oNCksIG1vbWVudC53ZWVrZGF5c01pbig1KSwgbW9tZW50LndlZWtkYXlzTWluKDYpLCBtb21lbnQud2Vla2RheXNNaW4oMCldO1xuXG4gICAgICAkc2NvcGUueWVhcnMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgeSA9IG1vbWVudCgpLnllYXIoKSAtIDEwMDsgeSA8PSBtb21lbnQoKS55ZWFyKCkgKyAxMDA7IHkrKykge1xuICAgICAgICAkc2NvcGUueWVhcnMucHVzaCh5KTtcbiAgICAgIH1cblxuICAgICAgZ2VuZXJhdGVDYWxlbmRhcigpO1xuICAgIH07XG4gICAgdGhpcy5idWlsZChjaGVja0xvY2FsZShsb2NhbGUpKTtcblxuICAgICRzY29wZS5wcmV2aW91c01vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLmFjdGl2ZURhdGUgPSAkc2NvcGUuYWN0aXZlRGF0ZS5zdWJ0cmFjdCgxLCAnbW9udGgnKTtcbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLm5leHRNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5hY3RpdmVEYXRlID0gJHNjb3BlLmFjdGl2ZURhdGUuYWRkKDEsICdtb250aCcpO1xuICAgICAgZ2VuZXJhdGVDYWxlbmRhcigpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2VsZWN0ID0gZnVuY3Rpb24gKGRheSkge1xuICAgICAgJHNjb3BlLnNlbGVjdGVkID0ge1xuICAgICAgICBtb2RlbDogZGF5LmZvcm1hdCgnTEwnKSxcbiAgICAgICAgZGF0ZTogZGF5LnRvRGF0ZSgpXG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubW9kZWwgPSBkYXkudG9EYXRlKCk7XG5cbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNlbGVjdFllYXIgPSBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgJHNjb3BlLnllYXJTZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgICAgJHNjb3BlLnNlbGVjdGVkLm1vZGVsID0gbW9tZW50KCRzY29wZS5zZWxlY3RlZC5kYXRlKS55ZWFyKHllYXIpLmZvcm1hdCgnTEwnKTtcbiAgICAgICRzY29wZS5zZWxlY3RlZC5kYXRlID0gbW9tZW50KCRzY29wZS5zZWxlY3RlZC5kYXRlKS55ZWFyKHllYXIpLnRvRGF0ZSgpO1xuICAgICAgJHNjb3BlLm1vZGVsID0gbW9tZW50KCRzY29wZS5zZWxlY3RlZC5kYXRlKS50b0RhdGUoKTtcbiAgICAgICRzY29wZS5hY3RpdmVEYXRlID0gJHNjb3BlLmFjdGl2ZURhdGUuYWRkKHllYXIgLSAkc2NvcGUuYWN0aXZlRGF0ZS55ZWFyKCksICd5ZWFyJyk7XG5cbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuICAgICRzY29wZS5kaXNwbGF5WWVhclNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vVE9ETzogVGhpcyByZXF1aXJlcyBKUXVlcnkgYW5kIG11c3QgYmUgcmV3cml0dGVuXG4gICAgICB2YXIgY2FsZW5kYXJIZWlnaHQgPSBhbmd1bGFyLmVsZW1lbnQoJy5tZGMtZGF0ZS1waWNrZXJfX2NhbGVuZGFyJykub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgJHllYXJTZWxlY3RvciA9IGFuZ3VsYXIuZWxlbWVudCgnLm1kYy1kYXRlLXBpY2tlcl9feWVhci1zZWxlY3RvcicpO1xuXG4gICAgICAkeWVhclNlbGVjdG9yLmNzcyh7aGVpZ2h0OiBjYWxlbmRhckhlaWdodH0pO1xuXG4gICAgICAkc2NvcGUueWVhclNlbGVjdGlvbiA9IHRydWU7XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRhY3RpdmVZZWFyID0gYW5ndWxhci5lbGVtZW50KCcubWRjLWRhdGUtcGlja2VyX195ZWFyLS1pcy1hY3RpdmUnKTtcblxuICAgICAgICAkeWVhclNlbGVjdG9yLnNjcm9sbFRvcCgkeWVhclNlbGVjdG9yLnNjcm9sbFRvcCgpICsgJGFjdGl2ZVllYXIucG9zaXRpb24oKS50b3AgLSAkeWVhclNlbGVjdG9yLmhlaWdodCgpIC8gMiArICRhY3RpdmVZZWFyLmhlaWdodCgpIC8gMik7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDYWxlbmRhcigpIHtcbiAgICAgIHZhciBkYXlzID0gW10sXG4gICAgICAgIHByZXZpb3VzRGF5ID0gYW5ndWxhci5jb3B5KCRzY29wZS5hY3RpdmVEYXRlKS5kYXRlKDApLFxuICAgICAgICBmaXJzdERheU9mTW9udGggPSBhbmd1bGFyLmNvcHkoJHNjb3BlLmFjdGl2ZURhdGUpLmRhdGUoMSksXG4gICAgICAgIGxhc3REYXlPZk1vbnRoID0gYW5ndWxhci5jb3B5KGZpcnN0RGF5T2ZNb250aCkuZW5kT2YoJ21vbnRoJyksXG4gICAgICAgIG1heERheXMgPSBhbmd1bGFyLmNvcHkobGFzdERheU9mTW9udGgpLmRhdGUoKTtcblxuICAgICAgJHNjb3BlLmVtcHR5Rmlyc3REYXlzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSBmaXJzdERheU9mTW9udGguZGF5KCkgPT09IDAgPyA2IDogZmlyc3REYXlPZk1vbnRoLmRheSgpIC0gMTsgaSA+IDA7IGktLSkge1xuICAgICAgICAkc2NvcGUuZW1wdHlGaXJzdERheXMucHVzaCh7fSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWF4RGF5czsgaisrKSB7XG4gICAgICAgIHZhciBkYXRlID0gYW5ndWxhci5jb3B5KHByZXZpb3VzRGF5LmFkZCgxLCAnZGF5cycpKTtcblxuICAgICAgICBkYXRlLnNlbGVjdGVkID0gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLnNlbGVjdGVkLm1vZGVsKSAmJiBkYXRlLmlzU2FtZSgkc2NvcGUuc2VsZWN0ZWQuZGF0ZSwgJ2RheScpO1xuICAgICAgICBkYXRlLnRvZGF5ID0gZGF0ZS5pc1NhbWUobW9tZW50KCksICdkYXknKTtcblxuICAgICAgICBkYXlzLnB1c2goZGF0ZSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5lbXB0eUxhc3REYXlzID0gW107XG5cbiAgICAgIGZvciAodmFyIGsgPSA3IC0gKGxhc3REYXlPZk1vbnRoLmRheSgpID09PSAwID8gNyA6IGxhc3REYXlPZk1vbnRoLmRheSgpKTsgayA+IDA7IGstLSkge1xuICAgICAgICAkc2NvcGUuZW1wdHlMYXN0RGF5cy5wdXNoKHt9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmRheXMgPSBkYXlzO1xuICAgIH1cblxuICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICRtZERpYWxvZy5oaWRlKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5jbG9zZVBpY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRtZERpYWxvZy5oaWRlKCRzY29wZS5zZWxlY3RlZCk7XG4gICAgfTtcbiAgfSlcbi5jb250cm9sbGVyKCdtZGNEYXRlUGlja2VySW5wdXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJGF0dHJzLCAkdGltZW91dCwgJG1kRGlhbG9nKSB7XG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5tb2RlbCkpIHtcbiAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgbW9kZWw6IG1vbWVudCgkc2NvcGUubW9kZWwpLmZvcm1hdCgnTEwnKSxcbiAgICAgICAgZGF0ZTogJHNjb3BlLm1vZGVsXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICAkc2NvcGUub3BlblBpY2tlciA9IGZ1bmN0aW9uIChldikge1xuICAgICAgJHNjb3BlLnllYXJTZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgICAgJG1kRGlhbG9nLnNob3coe1xuICAgICAgICB0YXJnZXRFdmVudDogZXYsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXItZGlhbG9nLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbWRjRGF0ZVBpY2tlckNvbnRyb2xsZXInLFxuICAgICAgICBsb2NhbHM6IHttb2RlbDogJHNjb3BlLm1vZGVsLCBsb2NhbGU6ICRhdHRycy5sb2NhbGUsIG1kVGhlbWU6ICRhdHRycy5kaWFsb2dNZFRoZW1lfVxuICAgICAgfSkudGhlbihmdW5jdGlvbiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgJHNjb3BlLnNlbGVjdGVkID0gc2VsZWN0ZWQ7XG4gICAgICAgICAgJHNjb3BlLm1vZGVsID0gc2VsZWN0ZWQubW9kZWw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH0pXG4uZGlyZWN0aXZlKCdtZGNEYXRlUGlja2VyJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdtZGNEYXRlUGlja2VySW5wdXRDb250cm9sbGVyJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIG1vZGVsOiAnPScsXG4gICAgICAgIGxhYmVsOiAnQCdcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ2RhdGUtcGlja2VyL2RhdGUtcGlja2VyLWlucHV0Lmh0bWwnXG4gICAgfTtcbiAgfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCduZ01hdGVyaWFsLmNvbXBvbmVudHMnLCBbXG4gICduZ01hdGVyaWFsJyxcbiAgJ25nTWF0ZXJpYWwuY29tcG9uZW50cy50ZW1wbGF0ZXMnLFxuICAnbmdNYXRlcmlhbC5jb21wb25lbnRzLmRhdGVQaWNrZXInXG5dKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==