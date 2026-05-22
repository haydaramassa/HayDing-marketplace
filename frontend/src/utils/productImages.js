const API_ORIGIN = "http://localhost:8080";

export function getProductImagePaths(product) {
  const rawImages = product?.images || product?.imageUrls || [];

  if (!Array.isArray(rawImages)) {
    return [];
  }

  return rawImages
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }

      return image?.imageUrl || image?.url || "";
    })
    .filter(Boolean);
}

export function getProductImages(product) {
  return getProductImagePaths(product).map((url) => {
    if (url.startsWith("http")) {
      return url;
    }

    return `${API_ORIGIN}${url}`;
  });
}

export function getPrimaryProductImage(product) {
  return getProductImages(product)[0] || "";
}