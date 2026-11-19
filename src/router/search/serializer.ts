export function parseSearch(searchStr: string): Record<string, unknown> {
  if (!searchStr) return {};
  try {
    const params = new URLSearchParams(searchStr);
    const result: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) {
      if (value === 'true') result[key] = true;
      else if (value === 'false') result[key] = false;
      else if (/^\d+$/.test(value)) result[key] = Number(value);
      else result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const result = params.toString();
  return result ? `?${result}` : '';
}
