export const HTTPStatus = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
});

export class RequestFailedError extends Error {
  /** @type {number} */
  status;
  /** @type {Response} */
  response;
  /** @type {Record<string, any>} */
  error;

  /**
   * @param {Response} response
   */
  constructor(response) {
    super();
    this.response = response;
    this.status = response.status;
    this.error = response.json();
  }
}

/**
 * @param {string} path
 * @param {Exclude<Parameters<typeof fetch>[0], URL>} options
 */
export async function http(path, options) {
  const h = new Headers();

  if (options.headers) {
    for (const key in options.headers) {
      h.append(key, options.headers[key]);
    }
  }

  const response = await fetch(path, {
    ...options,
    headers: h,
    credentials: "same-origin",
  });

  if (response.status >= HTTPStatus.BAD_REQUEST) {
    throw new RequestFailedError(response);
  }

  try {
    const data = await response.json();
    return {
      data,
      response,
    };
  } catch (e) {
    console.error(e);
    return { data: { data: { message: "Error parsing JSON" } }, response };
  }
}

/**
 * @param {string} path
 * @param {Exclude<Parameters<typeof fetch>[0], URL>} options
 */
export async function GET(path, options) {
  return http(path, {
    ...options,
    method: "GET",
  });
}

/**
 * @param {string} path
 * @param {object} payload
 * @param {Exclude<Parameters<typeof fetch>[0], URL>} options
 */
export async function POST(path, payload, options) {
  return http(path, {
    ...options,
    body: JSON.stringify(payload),
    method: "POST",
  });
}

/**
 * @param {string} path
 * @param {Exclude<Parameters<typeof fetch>[0], URL>} options
 */
export async function PUT(path, options) {
  return http(path, {
    ...options,
    method: "PUT",
  });
}

/**
 * @param {string} path
 * @param {Exclude<Parameters<typeof fetch>[0], URL>} options
 */
export async function DELETE(path, options) {
  return http(path, {
    ...options,
    method: "DELETE",
  });
}
