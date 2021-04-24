import Ajv from 'ajv';

const _ajv = new Ajv({ strict: false });

export const ajv = (payload: any, data: any) => {
  const validate = _ajv.compile(typeof payload === 'string' ? JSON.parse(payload) : payload);

  if (!validate(data)) {
    return validate.errors;
  }

  return null;
};
