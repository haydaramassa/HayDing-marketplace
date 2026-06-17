import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  addFavorite,
  createOrGetConversation,
  getFavorites,
  getMyProductFavoriteCounts,
  getMyProducts,
  getProductById,
  getProductFavoriteUsers,
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
  const [ownerFavoriteCount, setOwnerFavoriteCount] = useState(0);

  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [isFavoriteUsersModalOpen, setIsFavoriteUsersModalOpen] =
    useState(false);
  const [isLoadingFavoriteUsers, setIsLoadingFavoriteUsers] = useState(false);
  const [favoriteUsersError, setFavoriteUsersError] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
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

  function getTextDirection(value) {
    const cleanValue = value || "";
  
    for (const character of cleanValue) {
      if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(character)) {
        return "rtl";
      }
  
      if (/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(character)) {
        return "ltr";
      }
    }
  
    return isArabic ? "rtl" : "ltr";
  }

  function isLoggedIn() {
    return Boolean(localStorage.getItem("hayding-token"));
  }

  function normalizeId(value) {
    return Number(value);
  }

  function buildProfileImageUrl(imageUrl) {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http") || imageUrl.startsWith("blob:")) {
      return imageUrl;
    }

    return `http://localhost:8080${imageUrl}`;
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

  async function loadOwnerFavoriteCount() {
    try {
      const countsData = await getMyProductFavoriteCounts();
      const counts = countsData?.data || countsData || [];

      const currentProductCount = Array.isArray(counts)
        ? counts.find(
            (item) => normalizeId(item.productId) === normalizeId(productId)
          )
        : null;

      setOwnerFavoriteCount(Number(currentProductCount?.favoriteCount || 0));
    } catch {
      setOwnerFavoriteCount(0);
    }
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
        setIsLightboxOpen(false);
        setOwnerFavoriteCount(0);

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

          if (ownsThisProduct) {
            await loadOwnerFavoriteCount();
          }
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

  useEffect(() => {
    function handleKeyDown(event) {
      if (!isLightboxOpen) return;

      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        goToPreviousImage();
      }

      if (event.key === "ArrowRight") {
        goToNextImage();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, selectedImageIndex, product]);

  async function handleFavoriteClick() {
    if (isOwner) {
      return;
    }

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

  async function handleOpenFavoriteUsersModal() {
    if (!isOwner || !product) return;

    setIsFavoriteUsersModalOpen(true);
    setFavoriteUsers([]);
    setFavoriteUsersError("");
    setIsLoadingFavoriteUsers(true);

    try {
      const data = await getProductFavoriteUsers(product.id);
      const users = data?.data || data || [];

      setFavoriteUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      setFavoriteUsersError(
        err.message ||
          text(
            "Favoriten konnten nicht geladen werden.",
            "تعذر تحميل المستخدمين الذين أضافوا الإعلان للمفضلة.",
            "Could not load favorite users."
          )
      );
    } finally {
      setIsLoadingFavoriteUsers(false);
    }
  }

  function closeFavoriteUsersModal() {
    setIsFavoriteUsersModalOpen(false);
    setFavoriteUsers([]);
    setFavoriteUsersError("");
    setIsLoadingFavoriteUsers(false);
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

  function openLightbox() {
    if (!selectedImage) return;
    setIsLightboxOpen(true);
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
                  {!isOwner && (
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
                  )}

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
                    <button
                      className="product-details-image-button"
                      type="button"
                      onClick={openLightbox}
                      aria-label={text(
                        "Bild vergrößern",
                        "تكبير الصورة",
                        "Enlarge image"
                      )}
                    >
                      <img
                        className="product-details-real-image"
                        src={selectedImage}
                        alt={product.title}
                      />
                    </button>
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

                <h1 dir={getTextDirection(product.title)}>{product.title}</h1>

                <div className="details-price-row">
                  <strong className="details-price">{product.price} €</strong>

                  {isOwner && (
                    <button
                      className="my-product-favorite-count details-owner-favorite-count"
                      type="button"
                      onClick={handleOpenFavoriteUsersModal}
                      title={text(
                        "Favoriten ansehen",
                        "عرض من أضاف للمفضلة",
                        "View favorites"
                      )}
                    >
                      ❤️ {ownerFavoriteCount}
                    </button>
                  )}
                </div>

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

                  <p dir={getTextDirection(product.description)}>
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

      {isFavoriteUsersModalOpen && product && (
        <div className="delete-confirm-modal" role="dialog" aria-modal="true">
          <section className="delete-confirm-card favorite-users-modal-card">
            <div className="favorite-users-modal-header">
              <div>
                <p className="eyebrow">
                  {text("Favoriten", "المفضلة", "Favorites")}
                </p>

                <h2>
                  {text(
                    "Wer hat diese Anzeige gespeichert?",
                    "من أضاف هذا الإعلان للمفضلة؟",
                    "Who saved this listing?"
                  )}
                </h2>

                <p>{product.title}</p>
              </div>

              <button
                className="crop-close"
                type="button"
                onClick={closeFavoriteUsersModal}
                aria-label={text("Schließen", "إغلاق", "Close")}
              >
                ×
              </button>
            </div>

            {isLoadingFavoriteUsers && (
              <p className="auth-message auth-success">
                {text(
                  "Favoriten werden geladen...",
                  "جارٍ تحميل المفضلة...",
                  "Loading favorites..."
                )}
              </p>
            )}

            {favoriteUsersError && (
              <p className="auth-message auth-error">{favoriteUsersError}</p>
            )}

            {!isLoadingFavoriteUsers &&
              !favoriteUsersError &&
              favoriteUsers.length === 0 && (
                <div className="favorite-users-empty">
                  <div>🤍</div>

                  <h3>
                    {text(
                      "Noch niemand hat diese Anzeige gespeichert.",
                      "لم يضف أحد هذا الإعلان للمفضلة بعد.",
                      "No one has saved this listing yet."
                    )}
                  </h3>
                </div>
              )}

            {!isLoadingFavoriteUsers &&
              !favoriteUsersError &&
              favoriteUsers.length > 0 && (
                <div className="favorite-users-list">
                  {favoriteUsers.map((favoriteUser) => (
                    <Link
                      className="favorite-user-row favorite-user-row-link"
                      key={favoriteUser.userId}
                      to={`/users/${favoriteUser.userId}`}
                      onClick={closeFavoriteUsersModal}
                    >
                      <UserAvatar
                        user={{
                          ...favoriteUser,
                          profileImageUrl: buildProfileImageUrl(
                            favoriteUser.profileImageUrl
                          ),
                        }}
                        size="medium"
                      />

                      <strong>{favoriteUser.fullName}</strong>
                    </Link>
                  ))}
                </div>
              )}
          </section>
        </div>
      )}

      {isLightboxOpen && selectedImage && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="image-lightbox-close"
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label={text("Schließen", "إغلاق", "Close")}
          >
            ×
          </button>

          {hasMultipleImages && (
            <button
              className="image-lightbox-arrow image-lightbox-arrow-left"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToPreviousImage();
              }}
              aria-label={text(
                "Vorheriges Bild",
                "الصورة السابقة",
                "Previous image"
              )}
            >
              ‹
            </button>
          )}

          <img
            className="image-lightbox-image"
            src={selectedImage}
            alt={product?.title || ""}
            onClick={(event) => event.stopPropagation()}
          />

          {hasMultipleImages && (
            <button
              className="image-lightbox-arrow image-lightbox-arrow-right"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToNextImage();
              }}
              aria-label={text(
                "Nächstes Bild",
                "الصورة التالية",
                "Next image"
              )}
            >
              ›
            </button>
          )}

          {hasMultipleImages && (
            <span className="image-lightbox-counter">
              {selectedImageIndex + 1}/{productImages.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductDetails;