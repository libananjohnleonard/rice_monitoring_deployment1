export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);
  const rawText = await response.text();

  let data: unknown = null;

  if (rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      const preview = rawText.slice(0, 240).replace(/\s+/g, ' ').trim();
      const parseMessage =
        error instanceof Error ? error.message : 'Unknown JSON parse error';

      throw new Error(
        `Invalid JSON response (${response.status} ${response.statusText}): ${parseMessage}${preview ? ` | Body starts with: ${preview}` : ''}`
      );
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}
