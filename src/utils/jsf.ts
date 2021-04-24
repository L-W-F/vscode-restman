import _jsf, { Schema } from 'json-schema-faker';

_jsf.option({ fillProperties: false, useDefaultValue: true, useExamplesValue: true });

export const jsf = (payload: string | Schema) =>
  _jsf.generate(typeof payload === 'string' ? JSON.parse(payload) : payload);
