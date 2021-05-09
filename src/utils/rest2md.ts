import { debug } from './debug';
import { getKey } from './getKey';
import { getMethodAndUri } from './getMethodAndUri';
import { getReqSchema } from './getReqSchema';
import { getResSchema } from './getResSchema';
import { isDocHeader } from './isDocHeader';
import { renderSchemaTable } from './renderSchemaTable';
import { jsf } from '../utils/jsf';

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
        renderSchemaTable(req),
        req ? `\`\`\`json\n${JSON.stringify(jsf(req), null, 2)}\n\`\`\`` : '',
        '#### Response',
        renderSchemaTable(res),
        res ? `\`\`\`json\n${JSON.stringify(jsf(res), null, 2)}\n\`\`\`` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
    })
    .join('\n\n---\n\n');
};
