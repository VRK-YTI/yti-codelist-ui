import { FormControl } from '@angular/forms';
import { ValueType } from '../../entities/value-type';

export class MemberValueValidators {

  public static validateMemberValueAgainstRegexpAndRequired(valueType: ValueType) {
    return (control: FormControl) => {
      const value = control.value as String;
      if (valueType.regexp && ((value != null && value.length > 0) || (value && valueType.required))) {
        const isMemberValueValid = control.value.match(valueType.regexp);
        return !isMemberValueValid ? { 'memberValueValidatorError': { value: valueType.regexp } } : null;
      } else if (valueType.required && !valueType.regexp) {
        return { 'memberValueRequired': { value: value }};
      }
      return null;
    }
  }
}
