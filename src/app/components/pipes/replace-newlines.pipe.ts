import {Pipe, PipeTransform} from '@angular/core';
import {Localizable} from 'yti-common-ui/types/localization';

@Pipe({
  name: 'nonewlines',
  pure: false
  })
export class ReplaceNewlinesPipe implements PipeTransform {

  ret: string;
  constructor() {
  }

  transform(value: Localizable): string {
    this.ret = value.toString().replace(/(\\n)+/g, '<br/>');
    return this.ret;
    }
}
