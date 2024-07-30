export async function getAll<T>(g: AsyncGenerator<T>): Promise<T[]> {
  const result = [];
  for await (const item of g) {
    result.push(item);
  }
  return result;
}
