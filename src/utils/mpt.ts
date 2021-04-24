import * as fs from 'fs';
import FormData from 'form-data';
import { hasOwnProperty } from './hasOwnProperty';

export const mpt = (payload: Record<string, any>, variables: Record<string, string>) => {
  const keys = Object.entries(variables)
    .filter((a) => a[0].charAt(0) === '@')
    .map((v) => v[1]);

  if (keys.length === 0) {
    return payload;
  }

  if (hasOwnProperty(payload, 'data')) {
    const { data } = payload;
    const form = new FormData();

    payload.headers = {
      ...payload.headers,
      ...form.getHeaders(),
    };

    Object.entries(data).forEach(([k, v]: any) => {
      form.append(k, keys.includes(v) ? fs.createReadStream(v) : v);
    });

    payload.data = form;
  }

  return payload;
};
