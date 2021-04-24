export const getMethodAndUri = (segment: string) => {
  const matched = segment
    .replace(/```json (?:req|res)[\s\S]+?```/g, '')
    .match(
      /(?:#+\s)?\[(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)\]\s\S+[\n\r]+([^\n\r]+)[\n\r\s]*(\S+[\s\S]+\S+)?/,
    );

  return matched ? [matched[1], matched[2]] : [null, null];
};
