import { useState } from "react";
import { getProductImages } from "../utils/productImages";

function ProductCardImage({ product, children }) {
  const images = getProductImages(product);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex];

  function goToPreviousImage(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!hasMultipleImages) return;

    setCurrentImageIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    );
  }

  function goToNextImage(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!hasMultipleImages) return;

    setCurrentImageIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <div className="product-image my-product-image">
      {hasImages && (
        <img
          className="product-real-image"
          src={currentImage}
          alt={product.title}
        />
      )}

      {hasMultipleImages && (
        <>
          <button
            className="card-image-arrow card-image-arrow-left"
            type="button"
            onClick={goToPreviousImage}
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            className="card-image-arrow card-image-arrow-right"
            type="button"
            onClick={goToNextImage}
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

      {hasImages && (
        <span className="image-counter">
          {currentImageIndex + 1}/{images.length}
        </span>
      )}

      {children}
    </div>
  );
}

export default ProductCardImage;