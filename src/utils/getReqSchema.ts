export const getReqSchema = (segment: string) => {
  return segment.match(/[\n\r]+```json req[\n\r]+([\s\S]+?)[\n\r]+```[\n\r]+/)?.[1]?.trim() ?? null;
};
