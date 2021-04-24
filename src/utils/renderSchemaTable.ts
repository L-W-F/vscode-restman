import { Schema } from 'json-schema-faker';
import { debug } from './debug';

export const renderSchemaTable = (schema: string) => {
  if (!schema) {
    return '';
  }

  try {
    const json = JSON.parse(schema);

    const blocks: string[] = [];

    if (json.type === 'object') {
      if (json.properties?.status?.enum) {
        blocks.push('##### Status');
        blocks.push(renderBlock(json.properties.status, (json.required as string[])?.includes('status') ?? false));
      }

      if (json.properties?.headers?.properties) {
        blocks.push('##### Headers');
        blocks.push(renderBlocks(json.properties.headers));
      }

      if (json.properties?.params?.properties) {
        blocks.push('##### Params');
        blocks.push(renderBlocks(json.properties.params));
      }

      if (json.properties?.data) {
        blocks.push('##### Data');

        if (json.properties.data.properties) {
          blocks.push(renderBlocks(json.properties.data));
        } else {
          blocks.push(renderBlock(json.properties.data, (json.required as string[])?.includes('data') ?? false));
        }
      }
    }

    return blocks.join('\n\n');
  } catch (error) {
    debug('render', error.message);
  }

  return '';
};

function renderBlocks(params: Schema, level = 0) {
  return Object.entries(params.properties!)
    .reduce(
      (a, [name, schema]) => {
        const {
          type = 'unknown',
          description = '',
          default: defaultValue = '',
          enum: options = '',
          examples = '',
        } = schema;

        const required = (params.required as string[])?.includes(name) ?? false;

        a.push(
          `| ${padLevel(name, level)}${
            required ? '*' : ''
          } | ${type} | ${defaultValue} | ${description} | ${options} | ${examples} |`,
        );

        if (type === 'object' && schema.properties) {
          a.push(renderBlocks(schema, level + 1));
        }

        if (type === 'array' && schema.items) {
          a.push(
            renderBlocks(
              {
                properties: {
                  '[]': schema.items,
                },
              },
              level + 1,
            ),
          );
        }

        return a;
      },
      level === 0 ? ['| Name | Type | Default | Description | Enum | Examples |', '|---|---|---|---|---|---|'] : [],
    )
    .join('\n');
}

function renderBlock(param: Schema, required = false) {
  const { type = 'unknown', description = '', default: defaultValue = '', enum: options = '', examples = '' } = param;

  return [
    '|  Name | Type | Default | Description | Enum | Examples |',
    '|---|---|---|---|---|---|',
    `| -${required ? '*' : ''} | ${type} | ${defaultValue} | ${description} | ${options} | ${examples} |`,
  ].join('\n');
}

function padLevel(name: string, level: number) {
  if (level === 0) {
    return name;
  }

  return '┈'.repeat(level).concat(name);
}
