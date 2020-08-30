import { FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';

export function HolidayValidator() {
    return (formGroup: FormGroup) => {
        let repeat = formGroup.controls.repeat;
        let repeatWeekdays = formGroup.controls.repeatWeekdays;
        let repeatMonthType = formGroup.controls.repeatMonthType;
        let repeatMonthDate = formGroup.controls.repeatMonthDate;
        let repeatMonthWeekdayOccurrence = formGroup.controls.repeatMonthWeekdayOccurrence;
        let repeatMonthWeekday = formGroup.controls.repeatMonthWeekday;
        let repeatYearMonth = formGroup.controls.repeatYearMonth;
        let repeatYearType = formGroup.controls.repeatYearType;
        let repeatYearDate = formGroup.controls.repeatYearDate;
        let repeatYearWeekdayOccurrence = formGroup.controls.repeatYearWeekdayOccurrence;
        let repeatYearWeekday = formGroup.controls.repeatYearWeekday;

        // clear all previous errors
        repeatWeekdays.setErrors(null);
        repeatMonthType.setErrors(null);
        repeatMonthDate.setErrors(null);
        repeatMonthWeekdayOccurrence.setErrors(null);
        repeatMonthWeekday.setErrors(null);
        repeatYearMonth.setErrors(null);
        repeatYearType.setErrors(null);
        repeatYearDate.setErrors(null);
        repeatYearWeekdayOccurrence.setErrors(null);
        repeatYearWeekday.setErrors(null);

        if (repeat.value === "weekly") {
            console.log(
                "\nrepeat:", formGroup.controls.repeat.value,
                "\nrepeatWeekdays:", formGroup.controls.repeatWeekdays.value,
            );
            if (!repeatWeekdays.value || !repeatWeekdays.value.length) {
                repeatWeekdays.setErrors({ required: true });
            }
        }
        else if (repeat.value === "monthly") {
            if (!repeatMonthType.value) {
                repeatMonthType.setErrors({ required: true });
            }
            else if (repeatMonthType.value === "date") {
                if (!repeatMonthDate.value || !repeatMonthDate.value.length) {
                    repeatMonthDate.setErrors({ required: true });
                }
            }
            else if (repeatMonthType.value === "weekday") {
                if (!repeatMonthWeekdayOccurrence.value) {
                    repeatMonthWeekdayOccurrence.setErrors({ required: true });
                }
                if (!repeatMonthWeekday.value) {
                    repeatMonthWeekday.setErrors({ required: true });
                }
            }
        }
        else if (repeat.value === "yearly") {
            if (!repeatYearMonth.value || !repeatYearMonth.value.length) {
                repeatYearMonth.setErrors({ required: true });
            }
            if (!repeatYearType.value) {
                repeatYearType.setErrors({ required: true });
            }
            else if (repeatYearType.value === "date") {
                if (!repeatYearDate.value || !repeatYearDate.value.length) {
                    repeatYearDate.setErrors({ required: true });
                }
            }
            else if (repeatYearType.value === "weekday") {
                if (!repeatYearWeekdayOccurrence.value) {
                    repeatYearWeekdayOccurrence.setErrors({ required: true });
                }
                if (!repeatYearWeekday.value) {
                    repeatYearWeekday.setErrors({ required: true });
                }
            }
        }
    };
}
