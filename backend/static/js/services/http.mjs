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
  });

  const data = response.json();
  return data;
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
 * @param {Exclude<Parameters<typeof fetch>[0], URL>} options
 */
export async function POST(path, options) {
  return http(path, {
    ...options,
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
