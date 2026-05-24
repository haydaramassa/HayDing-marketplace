import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  addFavorite,
  createOrGetConversation,
  getFavorites,
  getMyProducts,
  getProductById,
  removeFavorite,
} from "../services/api";
import { getProductImages } from "../utils/productImages";
import "../App.css";

function ProductDetails() {
  const { productId } = useParams();
  const { isArabic, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function isLoggedIn() {
    return Boolean(localStorage.getItem("hayding-token"));
  }

  function normalizeId(value) {
    return Number(value);
  }

  function getConditionLabel(conditionStatus) {
    const labels = {
      NEW: text("Neu", "جديد", "New"),
      LIKE_NEW: text("Wie neu", "شبه جديد", "Like new"),
      GOOD: text("Gut", "جيد", "Good"),
      ACCEPTABLE: text("Akzeptabel", "مقبول", "Acceptable"),
      USED: text("Gebraucht", "مستعمل", "Used"),
    };

    return (
      labels[conditionStatus] ||
      conditionStatus ||
      text("Nicht angegeben", "غير محدد", "Not specified")
    );
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        const productData = await getProductById(productId);
        const loadedProduct = productData?.data || productData;

        setProduct(loadedProduct);

        if (isLoggedIn()) {
          const favoritesData = await getFavorites();
          const favorites = favoritesData?.data || favoritesData || [];

          const favoriteIds = Array.isArray(favorites)
            ? favorites.map((item) =>
                normalizeId(item.productId || item.product?.id || item.id)
              )
            : [];

          setIsFavorite(favoriteIds.includes(normalizeId(productId)));

          const myProductsData = await getMyProducts();
          const myProducts = myProductsData?.data || myProductsData || [];

          const ownsThisProduct = Array.isArray(myProducts)
            ? myProducts.some(
                (item) => normalizeId(item.id) === normalizeId(productId)
              )
            : false;

          setIsOwner(ownsThisProduct);
        }
      } catch (err) {
        setError(
          err.message ||
            text(
              "Anzeige konnte nicht geladen werden.",
              "تعذر تحميل الإعلان.",
              "Could not load listing."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleFavoriteClick() {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(productId);
        setIsFavorite(false);
      } else {
        await addFavorite(productId);
        setIsFavorite(true);
      }
    } catch (err) {
      setError(
        err.message ||
          text(
            "Favorit konnte nicht aktualisiert werden.",
            "تعذر تحديث المفضلة.",
            "Could not update favorite."
          )
      );
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleStartConversation() {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
  
    try {
      setIsStartingConversation(true);
  
      const data = await createOrGetConversation(productId);
      const conversation = data?.data || data;
      const conversationId = conversation?.id || conversation?.conversationId;
  
      if (!conversationId) {
        throw new Error(
          text(
            "Konversation konnte nicht gestartet werden.",
            "تعذر بدء المحادثة.",
            "Could not start conversation."
          )
        );
      }
  
      navigate(`/conversations/${conversationId}`);
    } catch (err) {
      setError(
        err.message ||
          text(
            "Konversation konnte nicht gestartet werden.",
            "تعذر بدء المحادثة.",
            "Could not start conversation."
          )
      );
    } finally {
      setIsStartingConversation(false);
    }
  }

  const productImages = getProductImages(product);
  const selectedImage = productImages[selectedImageIndex] || "";
  const hasMultipleImages = productImages.length > 1;

  function goToPreviousImage() {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? productImages.length - 1 : currentIndex - 1
    );
  }

  function goToNextImage() {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((currentIndex) =>
      currentIndex === productImages.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <header className="create-header">
        <Link className="logo" to="/">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </Link>

        <div className="create-header-actions">
          <div className="language-switcher" aria-label="Language switcher">
            {["DE", "EN", "AR"].map((lang) => (
              <button
                className={`language-btn ${language === lang ? "active" : ""}`}
                type="button"
                key={lang}
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate(-1)}
          >
            {text("Zurück", "رجوع", "Back")}
          </button>
        </div>
      </header>

      <main className="product-details-page">
        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Anzeige wird geladen...",
              "جارٍ تحميل الإعلان...",
              "Loading listing..."
            )}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && product && (
          <div className="product-details-layout">
            <section className="product-details-gallery">
              <div className="product-details-image">
                <button
                  className={`favorite-btn details-favorite-btn ${
                    isFavorite ? "active" : ""
                  }`}
                  type="button"
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                  aria-label={
                    isFavorite
                      ? text(
                          "Aus Favoriten entfernen",
                          "إزالة من المفضلة",
                          "Remove from favorites"
                        )
                      : text(
                          "Zu Favoriten hinzufügen",
                          "إضافة إلى المفضلة",
                          "Add to favorites"
                        )
                  }
                >
                  {isFavorite ? "♥" : "♡"}
                </button>

                {hasMultipleImages && (
                  <>
                    <button
                      className="details-image-arrow details-image-arrow-left"
                      type="button"
                      onClick={goToPreviousImage}
                      aria-label={text(
                        "Vorheriges Bild",
                        "الصورة السابقة",
                        "Previous image"
                      )}
                    >
                      ‹
                    </button>

                    <button
                      className="details-image-arrow details-image-arrow-right"
                      type="button"
                      onClick={goToNextImage}
                      aria-label={text(
                        "Nächstes Bild",
                        "الصورة التالية",
                        "Next image"
                      )}
                    >
                      ›
                    </button>

                    <span className="details-image-counter">
                      {selectedImageIndex + 1}/{productImages.length}
                    </span>
                  </>
                )}

                {selectedImage ? (
                  <img
                    className="product-details-real-image"
                    src={selectedImage}
                    alt={product.title}
                  />
                ) : (
                  <span>📦</span>
                )}
              </div>

              <div className="product-thumbnails product-thumbnails-scroll">
                {productImages.length > 0 ? (
                  productImages.map((imageUrl, index) => (
                    <button
                      type="button"
                      className={`thumbnail ${
                        selectedImageIndex === index ? "active" : ""
                      }`}
                      key={imageUrl}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.title} ${index + 1}`}
                      />
                    </button>
                  ))
                ) : (
                  <>
                    <button type="button" className="thumbnail active">
                      📦
                    </button>
                    <button type="button" className="thumbnail">
                      ＋
                    </button>
                    <button type="button" className="thumbnail">
                      ＋
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="product-details-info">
              <p className="eyebrow">{text("Anzeige", "إعلان", "Listing")}</p>

              <h1>{product.title}</h1>

              <strong className="details-price">{product.price} €</strong>

              <div className="details-meta">
                <div>
                  <span>{text("Stadt", "المدينة", "City")}</span>
                  <strong>
                    {product.city ||
                      text("Nicht angegeben", "غير محدد", "Not specified")}
                  </strong>
                </div>

                <div>
                  <span>{text("Zustand", "الحالة", "Condition")}</span>
                  <strong>
                    {getConditionLabel(
                      product.conditionStatus || product.condition
                    )}
                  </strong>
                </div>

                <div>
                  <span>{text("Status", "الحالة العامة", "Status")}</span>
                  <strong>
                    {product.productStatus || text("Aktiv", "نشط", "Active")}
                  </strong>
                </div>
              </div>

              <div className="details-section">
                <h2>{text("Beschreibung", "الوصف", "Description")}</h2>
                <p>
                  {product.description ||
                    text(
                      "Keine Beschreibung vorhanden.",
                      "لا يوجد وصف متاح.",
                      "No description available."
                    )}
                </p>
              </div>

              <div className="details-actions">
              {!isOwner && (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleStartConversation}
                  disabled={isStartingConversation}
                >
                  {isStartingConversation
                    ? text("Wird geöffnet...", "جارٍ الفتح...", "Opening...")
                    : text("Nachricht senden", "إرسال رسالة", "Send message")}
                </button>
              )}

                {isOwner && (
                  <Link
                    className="btn btn-secondary"
                    to={`/edit-product/${product.id}`}
                  >
                    {text("Anzeige bearbeiten", "تعديل الإعلان", "Edit listing")}
                  </Link>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;