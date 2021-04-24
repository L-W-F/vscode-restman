export const getKey = (segment: string) => {
  const matched = segment.match(/(?:#+\s)?\[(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)\]\s(\S+)/);

  return matched ? [matched[1], matched[2]] : [null, null];
};
