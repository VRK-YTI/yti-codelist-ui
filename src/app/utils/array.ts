
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

// return true if removed
export function removeMatching<T>(arr: T[], predicate: (item: T) => boolean) {

  const matchingIndices: number[] = [];

  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    if (predicate(item)) {
      matchingIndices.push(i);
    }
  }

  for (const index of matchingIndices) {
    arr.splice(index, 1);
  }

  return matchingIndices.length > 0;
}

export function remove<T>(arr: T[], item: T): void {
  removeMatching(arr, i => i === item);
}
