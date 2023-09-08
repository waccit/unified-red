import { FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';

export function HolidayValidator() {
    return (formGroup: FormGroup) => {
        const repeat = formGroup.controls.repeat;
        const type = formGroup.controls.type;
        const repeatWeekdays = formGroup.controls.repeatWeekdays;
        const repeatMonthType = formGroup.controls.repeatMonthType;
        const repeatMonthDate = formGroup.controls.repeatMonthDate;
        const repeatMonthWeekdayOccurrence = formGroup.controls.repeatMonthWeekdayOccurrence;
        const repeatMonthWeekday = formGroup.controls.repeatMonthWeekday;
        const repeatYearMonth = formGroup.controls.repeatYearMonth;
        const repeatYearType = formGroup.controls.repeatYearType;
        const repeatYearDate = formGroup.controls.repeatYearDate;
        const repeatYearWeekdayOccurrence = formGroup.controls.repeatYearWeekdayOccurrence;
        const repeatYearWeekday = formGroup.controls.repeatYearWeekday;

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

        if (type.value === 'holiday') {
            if (repeat.value === 'weekly') {
                if (!repeatWeekdays.value || !repeatWeekdays.value.length) {
                    repeatWeekdays.setErrors({ required: true });
                }
            }
            else if (repeat.value === 'monthly') {
                if (!repeatMonthType.value) {
                    repeatMonthType.setErrors({ required: true });
                }
                else if (repeatMonthType.value === 'date') {
                    if (!repeatMonthDate.value || !repeatMonthDate.value.length) {
                        repeatMonthDate.setErrors({ required: true });
                    }
                }
                else if (repeatMonthType.value === 'weekday') {
                    if (!repeatMonthWeekdayOccurrence.value) {
                        repeatMonthWeekdayOccurrence.setErrors({ required: true });
                    }
                    if (!repeatMonthWeekday.value) {
                        repeatMonthWeekday.setErrors({ required: true });
                    }
                }
            }
            else if (repeat.value === 'yearly') {
                if (!repeatYearMonth.value || !repeatYearMonth.value.length) {
                    repeatYearMonth.setErrors({ required: true });
                }
                if (!repeatYearType.value) {
                    repeatYearType.setErrors({ required: true });
                }
                else if (repeatYearType.value === 'date') {
                    if (!repeatYearDate.value || !repeatYearDate.value.length) {
                        repeatYearDate.setErrors({ required: true });
                    }
                }
                else if (repeatYearType.value === 'weekday') {
                    if (!repeatYearWeekdayOccurrence.value) {
                        repeatYearWeekdayOccurrence.setErrors({ required: true });
                    }
                    if (!repeatYearWeekday.value) {
                        repeatYearWeekday.setErrors({ required: true });
                    }
                }
            }
        }
    };
}
