const API_BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return data;
}

export function registerUser(userData) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function createProduct(productData) {
  const token = localStorage.getItem("hayding-token");

  return request("/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
}

export function getMyProducts() {
    const token = localStorage.getItem("hayding-token");
  
    return request("/products/my", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }