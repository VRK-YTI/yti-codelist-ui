
// returns true is replaced
export function replaceMatching<T>(arr: T[], predicate: (item: T) => boolean, replaceWith: T) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      arr[i] = replaceWith;
      return true;
    }
  }
  return false;
}
