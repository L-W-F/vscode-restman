import { get } from 'lodash';

export const tmpl = (str: string, mix: Record<string, any>) => {
  return str.replace(/{{(.*?)}}/gm, (_, key: string) => get(mix, key) ?? get(mix, key.split('.')) ?? `{{${key}}}`);
};
