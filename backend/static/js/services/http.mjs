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

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
    return { data: { message: "Error parsing JSON" } };
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
