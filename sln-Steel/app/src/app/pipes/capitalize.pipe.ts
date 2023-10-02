/* eslint-disable curly */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string, query: string): unknown {
    if (!value) return value;

    const arrayName = value.split(' ');
    console.log('capitalize');

    arrayName.forEach((pal: string, index: number) => {
      //hacemos el capitalize en cada palabra
      arrayName[index] = pal.charAt(0).toUpperCase() + pal.toLowerCase().slice(1);
    });

    return arrayName.join(' ');
  }
}
