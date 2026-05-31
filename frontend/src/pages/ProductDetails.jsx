import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  addFavorite,
  createOrGetConversation,
  getFavorites,
  getMyProducts,
  getProductById,
  getProducts,
  removeFavorite,
} from "../services/api";
import { getProductImages } from "../utils/productImages";
import Navbar from "../components/Navbar";
import ProductCardImage from "../components/ProductCardImage";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function ProductDetails() {
  const { productId } = useParams();
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

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

  function getProductCategoryId(item) {
    return String(item?.categoryId || item?.category?.id || "");
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
        setIsLoading(true);
        setError("");
        setNotFound(false);
        setProduct(null);
        setSimilarProducts([]);
        setSelectedImageIndex(0);

        const productData = await getProductById(productId);
        const loadedProduct = productData?.data || productData;

        if (!loadedProduct || !loadedProduct.id) {
          setNotFound(true);
          return;
        }

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
        const message = err.message || "";
        const isNumericProductId = /^\d+$/.test(String(productId));

        if (
          isNumericProductId ||
          message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("bad request") ||
          message.includes("404") ||
          message.includes("400")
        ) {
          setNotFound(true);
        } else {
          setError(
            message ||
              text(
                "Anzeige konnte nicht geladen werden.",
                "تعذر تحميل الإعلان.",
                "Could not load listing."
              )
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!product) {
      return;
    }

    async function loadSimilarProducts() {
      const currentCategoryId = getProductCategoryId(product);

      if (!currentCategoryId) {
        return;
      }

      try {
        setIsSimilarLoading(true);

        const data = await getProducts();
        const products = data?.data || data || [];

        const relatedProducts = Array.isArray(products)
          ? products
              .filter((item) => {
                const isSameProduct = Number(item.id) === Number(productId);

                const isSameCategory =
                  getProductCategoryId(item) === currentCategoryId;

                const isSold = item.productStatus === "SOLD";

                return !isSameProduct && isSameCategory && !isSold;
              })
              .sort((a, b) => {
                const dateA = new Date(
                  a.updatedAt || a.createdAt || 0
                ).getTime();
                const dateB = new Date(
                  b.updatedAt || b.createdAt || 0
                ).getTime();

                if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
                  return Number(b.id || 0) - Number(a.id || 0);
                }

                return dateB - dateA;
              })
              .slice(0, 3)
          : [];

        setSimilarProducts(relatedProducts);
      } catch {
        setSimilarProducts([]);
      } finally {
        setIsSimilarLoading(false);
      }
    }

    loadSimilarProducts();
  }, [product, productId]);

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
  const seller = product?.seller;

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
      <Navbar variant="app" />

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

        {!isLoading && notFound && (
          <section className="not-found-card product-not-found-card">
            <p className="eyebrow">404</p>

            <h1>
              {text(
                "Anzeige nicht gefunden",
                "الإعلان غير موجود",
                "Listing not found"
              )}
            </h1>

            <p>
              {text(
                "Diese Anzeige existiert nicht mehr oder wurde entfernt.",
                "هذا الإعلان لم يعد موجوداً أو تم حذفه.",
                "This listing no longer exists or has been removed."
              )}
            </p>

            <div className="not-found-actions">
              <Link className="btn btn-primary" to="/products">
                {text(
                  "Anzeigen entdecken",
                  "استكشف الإعلانات",
                  "Explore listings"
                )}
              </Link>

              <Link className="btn btn-secondary" to="/">
                {text("Zur Startseite", "إلى الرئيسية", "Back home")}
              </Link>
            </div>
          </section>
        )}

        {error && !notFound && (
          <p className="auth-message auth-error">{error}</p>
        )}

        {!isLoading && !error && !notFound && product && (
          <>
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

                {seller && (
                  <Link
                    className="seller-card seller-card-link"
                    to={`/users/${seller.id}`}
                  >
                    <UserAvatar user={seller} size="medium" />

                    <div>
                      <span>{text("Verkäufer", "البائع", "Seller")}</span>

                      <strong>
                        {seller.fullName ||
                          text("Unbekannt", "غير معروف", "Unknown")}
                      </strong>

                      <p>
                        {seller.city ||
                          text(
                            "Ort nicht angegeben",
                            "المدينة غير محددة",
                            "City not specified"
                          )}
                      </p>
                    </div>
                  </Link>
                )}

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
                      {text(
                        "Anzeige bearbeiten",
                        "تعديل الإعلان",
                        "Edit listing"
                      )}
                    </Link>
                  )}
                </div>
              </section>
            </div>

            <section className="similar-listings-section">
              <div className="similar-listings-header">
                <div>
                  <p className="eyebrow">
                    {text(
                      "Ähnliche Anzeigen",
                      "إعلانات مشابهة",
                      "Similar listings"
                    )}
                  </p>

                  <h2>
                    {text(
                      "Vielleicht interessiert dich auch",
                      "قد يعجبك أيضاً",
                      "You might also like"
                    )}
                  </h2>
                </div>

                <Link className="btn btn-secondary" to="/products">
                  {text("Alle anzeigen", "عرض الكل", "View all")}
                </Link>
              </div>

              {isSimilarLoading && (
                <p className="auth-message auth-success">
                  {text(
                    "Ähnliche Anzeigen werden geladen...",
                    "جارٍ تحميل الإعلانات المشابهة...",
                    "Loading similar listings..."
                  )}
                </p>
              )}

              {!isSimilarLoading && similarProducts.length === 0 && (
                <div className="empty-state similar-empty-state">
                  <div className="empty-icon">🔎</div>

                  <h2>
                    {text(
                      "Keine ähnlichen Anzeigen gefunden.",
                      "لا توجد إعلانات مشابهة حالياً.",
                      "No similar listings found."
                    )}
                  </h2>

                  <p>
                    {text(
                      "Entdecke weitere Anzeigen in der Übersicht.",
                      "استكشف المزيد من الإعلانات في صفحة المنتجات.",
                      "Explore more listings on the products page."
                    )}
                  </p>
                </div>
              )}

              {!isSimilarLoading && similarProducts.length > 0 && (
                <div className="my-products-grid similar-listings-grid">
                  {similarProducts.map((similarProduct) => (
                    <Link
                      className="product-card my-product-card product-card-link"
                      key={similarProduct.id}
                      to={`/products/${similarProduct.id}`}
                    >
                      <ProductCardImage product={similarProduct} />

                      <div className="product-info">
                        <span className="product-tag">
                          {getConditionLabel(
                            similarProduct.conditionStatus ||
                              similarProduct.condition
                          ) || text("Aktiv", "نشط", "Active")}
                        </span>

                        <h3>{similarProduct.title}</h3>

                        <p>{similarProduct.city}</p>

                        <strong>{similarProduct.price} €</strong>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;