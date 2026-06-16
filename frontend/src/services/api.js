const API_BASE_URL = "http://localhost:8080/api";

const AUTH_TOKEN_KEY = "hayding-token";
const AUTH_USER_KEY = "hayding-user";

function getTokenExpirationMs(token) {
  if (!token) return null;

  try {
    const tokenPayload = token.split(".")[1];
    const base64 = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(atob(paddedBase64));

    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAuthTokenExpired() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expirationMs = getTokenExpirationMs(token);

  return Boolean(expirationMs && expirationMs <= Date.now());
}

export function handleAuthExpired() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);

  if (window.location.pathname !== "/login") {
    window.location.href = "/login?sessionExpired=true";
  }
}

export function startAuthSessionWatcher() {
  let timeoutId = null;
  let intervalId = null;

  function clearTimers() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function checkSession() {
    if (isAuthTokenExpired()) {
      clearTimers();
      handleAuthExpired();
    }
  }

  function scheduleSessionExpiry() {
    clearTimers();

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expirationMs = getTokenExpirationMs(token);

    if (!expirationMs) return;

    const delayMs = expirationMs - Date.now();

    if (delayMs <= 0) {
      handleAuthExpired();
      return;
    }

    timeoutId = setTimeout(checkSession, Math.min(delayMs, 2147483647));
    intervalId = setInterval(checkSession, 60000);
  }

  function handleVisibilityOrFocus() {
    checkSession();
    scheduleSessionExpiry();
  }

  scheduleSessionExpiry();

  window.addEventListener("focus", handleVisibilityOrFocus);
  window.addEventListener("storage", scheduleSessionExpiry);
  window.addEventListener("hayding-auth-updated", scheduleSessionExpiry);
  document.addEventListener("visibilitychange", handleVisibilityOrFocus);

  return () => {
    clearTimers();
    window.removeEventListener("focus", handleVisibilityOrFocus);
    window.removeEventListener("storage", scheduleSessionExpiry);
    window.removeEventListener("hayding-auth-updated", scheduleSessionExpiry);
    document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
  };
}

async function request(path, options = {}) {
  if (isAuthTokenExpired()) {
    handleAuthExpired();
    throw new Error("Session expired. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthExpired();
    }

    const message =
      data?.message ||
      data?.error ||
      "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  return {
    Authorization: `Bearer ${token}`,
  };
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
  return request("/products", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
}

export function getMyProducts() {
  return request("/products/my", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function getProducts() {
  return request("/products", {
    method: "GET",
  });
}

export function getProductById(productId) {
  return request(`/products/${productId}`, {
    method: "GET",
  });
}

export function markProductAsSold(productId) {
  return request(`/products/${productId}/mark-sold`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

export function deleteProduct(productId) {
  return request(`/products/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export function getFavorites() {
  return request("/favorites", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function addFavorite(productId) {
  return request(`/favorites/${productId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
}

export function removeFavorite(productId) {
  return request(`/favorites/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export function updateProduct(productId, productData) {
  return request(`/products/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
}

export async function uploadProductImage(file) {
  if (isAuthTokenExpired()) {
    handleAuthExpired();
    throw new Error("Session expired. Please log in again.");
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/product-images/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthExpired();
    }

    const message =
      data?.message ||
      data?.error ||
      "Image upload failed. Please try again.";

    throw new Error(message);
  }

  return data?.data || data;
}

export function createOrGetConversation(productId) {
  return request("/conversations", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      productId: Number(productId),
    }),
  });
}

export function getConversations() {
  return request("/conversations", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function getConversationMessages(conversationId) {
  return request(`/conversations/${conversationId}/messages`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function sendConversationMessage(conversationId, content) {
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content,
    }),
  });
}

export function getUnreadNotificationCount() {
  return request("/notifications/unread-count", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function getNotifications() {
  return request("/notifications", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function markAllNotificationsAsRead() {
  return request("/notifications/read-all", {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

export function markConversationNotificationsAsRead(conversationId) {
  return request(`/notifications/conversations/${conversationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

export function getCurrentUserProfile() {
  return request("/users/me", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function updateCurrentUserProfile(profileData) {
  return request("/users/me", {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
}

export function getPublicUserProfile(userId) {
  return request(`/public/users/${userId}`, {
    method: "GET",
  });
}

export async function uploadProfileImage(file) {
  if (isAuthTokenExpired()) {
    handleAuthExpired();
    throw new Error("Session expired. Please log in again.");
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/users/me/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthExpired();
    }

    const message =
      data?.message ||
      data?.error ||
      "Profile image could not be uploaded.";

    throw new Error(message);
  }

  return data;
}

export function markNotificationAsRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

export function getMyProductFavoriteCounts() {
  return request("/favorites/my-products/counts", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function deleteCurrentUserAccount() {
  return request("/users/me", {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export function getProductFavoriteUsers(productId) {
  return request(`/favorites/products/${productId}/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function getCategories() {
  return request("/categories", {
    method: "GET",
  });
}