/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment, { isMoment, Moment } from 'moment';

@Component({
  selector: 'date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: DatePickerComponent,
    },
  ],
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  constructor() {}

  // Inputs/Output
  @Input('label') label: string = 'Fecha';
  @Input('filter') filter: moment.Moment;
  @Output() DateChange = new EventEmitter<moment.Moment>();

  // Variables
  fecha: FormControl = new FormControl(moment());

  ngOnInit(): void {
    this.fecha.valueChanges.subscribe((d) => this.onChange(d));
  }

  writeValue(obj: any): void {
    if (isMoment(obj)) {
      this.fecha.patchValue(obj);
    } else {
      this.fecha.patchValue(moment());
      this.onChange(moment());
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.fecha.disable() : this.fecha.enable();
  }

  onChange = (date: Moment) => {};
  onTouched = () => {};

  EventSelectDate(Value: moment.Moment) {
    this.DateChange.emit(Value);
  }
}
