import { FormControl } from '@angular/forms';

export function nonEmptyLocalizableValidator(control: FormControl) {

  if (allExistingObjectKeysHaveAnEmptyValue(control) || objectHasNoKeys(control)) {
    return {
      localizableValueRequired: {
        valid: false
      }
    }
  } else {
    return null;
  }

  function objectHasNoKeys(controlValue: Object): boolean {
    return Object.keys(control.value).length === 0 ? true : false;
  }

  function allExistingObjectKeysHaveAnEmptyValue(controlValue: Object): boolean {
    let oneOrMoreKeysHaveANonEmptyValue = false;
    Object.values(control.value).forEach(value => {
      if ((<string>value).length > 0) {
        oneOrMoreKeysHaveANonEmptyValue = true;
      }
    });
    return !oneOrMoreKeysHaveANonEmptyValue;
  }
}
