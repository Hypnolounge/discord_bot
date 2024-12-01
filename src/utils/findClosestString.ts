// Stolen from https://stackoverflow.com/questions/5859561/getting-the-closest-string-match
// rewritten and improved with chatgpt

function levenshteinDistanceOptimized(s1: string, s2: string): number {
  const l1 = s1.length;
  const l2 = s2.length;

  if (l1 === 0) return l2;
  if (l2 === 0) return l1;

  let previousRow = Array(l2 + 1).fill(0);
  let currentRow = Array(l2 + 1).fill(0);

  // Initialize the first row
  for (let j = 0; j <= l2; j++) {
    previousRow[j] = j;
  }

  for (let i = 1; i <= l1; i++) {
    currentRow[0] = i;

    for (let j = 1; j <= l2; j++) {
      const cost = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? 0 : 1;

      currentRow[j] = Math.min(
        currentRow[j - 1] + 1, // Insertion
        previousRow[j] + 1, // Deletion
        previousRow[j - 1] + cost // Substitution
      );
    }

    // Swap rows for the next iteration
    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[l2];
}

export function findClosestString(
  target: string,
  candidates: string[],
  minDist: number = 5
): string {
  let closestString = "";
  let smallestDistance = Infinity;

  for (const candidate of candidates) {
    const distance = levenshteinDistanceOptimized(target, candidate);

    // If a perfect match is found, return immediately
    if (distance === 0) {
      return candidate;
    }

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestString = candidate;
    }
  }
  if (smallestDistance > minDist) {
    throw new Error(`No close enough match found for ${target}`);
  }
  return closestString;
}
