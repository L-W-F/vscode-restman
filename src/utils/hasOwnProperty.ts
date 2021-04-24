export const hasOwnProperty = (o: any, k: string) =>
  o && typeof o === 'object' ? Object.prototype.hasOwnProperty.call(o, k) : false;
