export function chunkArrayByNumber<T>(items: T[], elements: number): T[][] {
  const res = [];
  for (let i = 0; i < items.length; i += elements) {
    const chunk = items.slice(i, i + elements);
    res.push(chunk);
  }
  return res;
}
