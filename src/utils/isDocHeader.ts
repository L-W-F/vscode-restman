export const isDocHeader = (segment: string) => {
  return /^## /.test(segment);
};
