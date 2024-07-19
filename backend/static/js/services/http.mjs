export async function http(path, options) {
  const h = new Headers();

  for (const key in options) {
    h.append(key, options[key]);
  }

  const response = await fetch(path, {
    ...options,
    headers: h,
  });

  const data = response.json();
  return data;
}

export async function GET(path, options) {
  return http(path, {
    ...options,
    method: "GET",
  });
}

export async function POST(path, options) {
  return http(path, {
    ...options,
    method: "POST",
  });
}

export async function PUT(path, options) {
  return http(path, {
    ...options,
    method: "PUT",
  });
}

export async function DELETE(path, options) {
  return http(path, {
    ...options,
    method: "DELETE",
  });
}
