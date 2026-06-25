import { useRef, useState } from "react";
import { getProductImages } from "../utils/productImages";

function ProductCardImage({ product, children, showFavoriteButton = false }) {
  const images = getProductImages(product);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLocallyFavorite, setIsLocallyFavorite] = useState(false);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const didSwipeRef = useRef(false);

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex];

  function goToPreviousImage(event) {
    event.preventDefault();
    event.stopPropagation();

    showPreviousImage();
  }

  function goToNextImage(event) {
    event.preventDefault();
    event.stopPropagation();

    showNextImage();
  }

  function showPreviousImage() {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    );
  }

  function showNextImage() {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  }

  function handleTouchStart(event) {
    if (!hasMultipleImages) return;

    const touch = event.touches[0];

    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    didSwipeRef.current = false;
  }

  function handleTouchEnd(event) {
    if (!hasMultipleImages) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    const isHorizontalSwipe = Math.abs(deltaX) > 34 && Math.abs(deltaX) > Math.abs(deltaY) + 10;

    if (!isHorizontalSwipe) return;

    didSwipeRef.current = true;

    if (deltaX < 0) {
      showNextImage();
    } else {
      showPreviousImage();
    }
  }

  function handleImageClickCapture(event) {
    if (!didSwipeRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    didSwipeRef.current = false;
  }

  function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();

    setIsLocallyFavorite((currentValue) => !currentValue);
  }

  return (
    <div
      className="product-image my-product-image"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClickCapture={handleImageClickCapture}
    >
      {hasImages && (
        <img
          className="product-real-image"
          src={currentImage}
          alt={product.title}
          draggable="false"
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

      {showFavoriteButton && (
        <button
          className={`favorite-btn mobile-card-favorite-btn ${
            isLocallyFavorite ? "active" : ""
          }`}
          type="button"
          onClick={toggleFavorite}
          aria-label={isLocallyFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isLocallyFavorite}
        >
          {isLocallyFavorite ? "♥" : "♡"}
        </button>
      )}

      {children}
    </div>
  );
}

export default ProductCardImage;