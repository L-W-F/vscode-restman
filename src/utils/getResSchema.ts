export const getResSchema = (segment: string) => {
  return segment.match(/[\n\r]+```json res[\n\r]+([\s\S]+?)[\n\r]+```[\n\r]+/)?.[1]?.trim() ?? null;
};
