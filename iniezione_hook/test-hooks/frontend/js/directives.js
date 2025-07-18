(function() {
    "use strict";
    const app = angular.module("myApp");

    function calendarDirective() {

        // these are labels for the days of the week
        const calDaysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // these are human-readable month name labels, in order
        const calMonthsLabels = ['January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December'
        ];

        // these are the days of each month, in order
        const calDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        const years = (()=> {
            const ar = [];
            const curYear = new Date().getFullYear();
            for(let i = 1900; i <= curYear; ar.push(i), i++);
            return ar;
        })();

        function sameDay(d1, d2) {
            return d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();
        }

        class CalendarController {

            $onInit() {
                this.ngModel.$render = this.render.bind(this);
                this.shiftValue = this.shiftValue || 0;
            }

            set shift(value) {
                this.shiftValue = value >= 0 && value < 7 ? value : 0;
                this.ngModel && this.render();
            }

            get modelValue() {
                return this.ngModel.$modelValue;
            }

            get months() {
                return calMonthsLabels;
            }

            get years() {
                return years;
            }

            get selectedMonth() {
                return this.displayDate.getMonth();
            }

            set selectedMonth(value) {
                this.displayDate.setMonth(value);
                this.updateViewModel();
            }

            get selectedYear() {
                return this.displayDate.getFullYear();
            }

            set selectedYear(value) {
                this.displayDate.setFullYear(value);
                this.updateViewModel();
            }

            toggleCalendar() {
                this.showCalendar = !this.showCalendar;
            }

            isSelected(date) {
                return this.modelValue && date && sameDay(date, this.modelValue);
            }

            selectDay(date) {
                this.ngModel.$setViewValue(date);
                this.render();
            }

            setToday() {
                this.selectDay(new Date());
            }

            render() {
                this.displayDate = this.modelValue && new Date(this.modelValue.getTime()) || new Date();
                this.updateViewModel();
            }

            updateViewModel() {
                const month = this.displayDate.getMonth();
                const year = this.displayDate.getFullYear();

                this.selectedDay = this.modelValue && this.displayDate.getDate();

                const startingDayOfWeek = new Date(year, month, 1).getDay();

                if (this.shiftValue > startingDayOfWeek) {
                    this.shiftValue -= 7;
                }

                let monthLength = calDaysInMonth[month];

                if (month == 1) { // February only!
                    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                        monthLength = 29; // compensate for leap year
                    }
                }

                this.dayNames = [];
                for (let i = 0; i <= 6; i++) {
                    this.dayNames[i] = calDaysLabels[(i + this.shiftValue + 7) % 7];
                }

                let day = 1;
                this.weeks = [];
                // this loop is for is weeks (rows)
                for (let i = 0; i < 7; i++) {
                    this.weeks[i] = { days: [] };
                    // this loop is for weekdays (cells)
                    for (let j = 0; j <= 6; j++) {
                        this.weeks[i].days[j] = null;
                        if (day <= monthLength && (i > 0 || j + this.shiftValue >= startingDayOfWeek)) {
                            this.weeks[i].days[j] = new Date(year, month, day++);
                        }
                    }
                    if (day > monthLength) {
                        break;
                    }
                }
            }


        }

        return {
            templateUrl: "templates/calendarDirective.html",
            controller: CalendarController,
            controllerAs: "ctrl",
            bindToController: true,
            require: {
                ngModel: "ngModel"
            },
            scope: {
                shift: "<",
                showCalendar: "<show"
            }
        }
    }

    app.directive("calendar", calendarDirective);

}())
