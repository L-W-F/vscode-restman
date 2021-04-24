import { debug } from './debug';
import { getKey } from './getKey';
import { getMethodAndUri } from './getMethodAndUri';
import { getReqSchema } from './getReqSchema';
import { getResSchema } from './getResSchema';
import { isDocHeader } from './isDocHeader';
import { renderSchemaTable } from './renderSchemaTable';

export const rest2md = (text: string) => {
  return text
    .split('\n---\n')
    .map((segment) => {
      if (isDocHeader(segment)) {
        return segment;
      }

      const [method, uri] = getKey(segment);

      if (!method || !uri) {
        debug('rest2md', `method or uri is NOT found in: ${segment}`);

        return '';
      }

      const req = getReqSchema(segment);
      const res = getResSchema(segment);

      const [title, description = ''] = getMethodAndUri(segment);

      // { key, title, description, req, res }
      return [
        `### ${title ?? 'Untitled'}`,
        description,
        '#### URI',
        `${uri}`,
        '#### Method',
        `${method}`,
        '#### Request',
        `${renderSchemaTable(req as string)}`,
        '#### Response',
        `${renderSchemaTable(res as string)}`,
      ].join('\n\n');
    })
    .join('\n\n---\n\n');
};
