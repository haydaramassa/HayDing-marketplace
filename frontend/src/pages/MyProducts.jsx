import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  deleteProduct,
  getMyProductFavoriteCounts,
  getMyProducts,
  getProductFavoriteUsers,
  markProductAsSold,
} from "../services/api";
import ProductCardImage from "../components/ProductCardImage";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function MyProducts() {
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [favoriteCounts, setFavoriteCounts] = useState({});
  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [favoriteUsersProduct, setFavoriteUsersProduct] = useState(null);
  const [isLoadingFavoriteUsers, setIsLoadingFavoriteUsers] = useState(false);
  const [favoriteUsersError, setFavoriteUsersError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTargetProduct, setDeleteTargetProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRefs = useRef({});

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function buildProfileImageUrl(imageUrl) {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http") || imageUrl.startsWith("blob:")) {
      return imageUrl;
    }

    return `http://localhost:8080${imageUrl}`;
  }

  function getStatusLabel(status) {
    const productStatus = status || "ACTIVE";

    if (productStatus === "SOLD") {
      return text("Verkauft", "مباع", "Sold");
    }

    if (productStatus === "RESERVED") {
      return text("Reserviert", "محجوز", "Reserved");
    }

    return text("Aktiv", "نشط", "Active");
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
      text("Zustand", "الحالة", "Condition")
    );
  }

  function getFavoriteCount(productId) {
    return Number(favoriteCounts[productId] || 0);
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";

    try {
      return new Intl.DateTimeFormat(
        language === "AR" ? "ar" : language === "EN" ? "en" : "de-DE",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ).format(new Date(dateValue));
    } catch {
      return dateValue;
    }
  }

  async function openFavoriteUsersModal(product) {
    setFavoriteUsersProduct(product);
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
    setFavoriteUsersProduct(null);
    setFavoriteUsers([]);
    setFavoriteUsersError("");
    setIsLoadingFavoriteUsers(false);
  }

  async function handleMarkAsSold(productId) {
    const confirmed = window.confirm(
      text(
        "Diese Anzeige als verkauft markieren?",
        "هل تريد تحديد هذا الإعلان كمباع؟",
        "Mark this listing as sold?"
      )
    );

    if (!confirmed) return;

    try {
      await markProductAsSold(productId);

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? { ...product, productStatus: "SOLD" }
            : product
        )
      );
    } catch (err) {
      setError(
        err.message ||
          text(
            "Anzeige konnte nicht als verkauft markiert werden.",
            "تعذر تحديد الإعلان كمباع.",
            "Could not mark listing as sold."
          )
      );
    }
  }

  function openDeleteConfirm(product) {
    setOpenMenuId(null);
    setError("");
    setDeleteTargetProduct(product);
  }

  function closeDeleteConfirm() {
    if (isDeleting) return;
    setDeleteTargetProduct(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTargetProduct?.id) return;

    try {
      setIsDeleting(true);
      setError("");

      await deleteProduct(deleteTargetProduct.id);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== deleteTargetProduct.id
        )
      );

      setFavoriteCounts((currentCounts) => {
        const nextCounts = { ...currentCounts };
        delete nextCounts[deleteTargetProduct.id];
        return nextCounts;
      });

      setDeleteTargetProduct(null);
    } catch (err) {
      setError(
        err.message ||
          text(
            "Anzeige konnte nicht gelöscht werden.",
            "تعذر حذف الإعلان.",
            "Could not delete listing."
          )
      );
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("hayding-token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function loadMyProducts() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getMyProducts();
        const items = data?.data || data || [];

        setProducts(Array.isArray(items) ? items : []);

        const countsData = await getMyProductFavoriteCounts();
        const counts = countsData?.data || countsData || [];

        const countsMap = Array.isArray(counts)
          ? counts.reduce((result, item) => {
              result[item.productId] = item.favoriteCount;
              return result;
            }, {})
          : {};

        setFavoriteCounts(countsMap);
      } catch (err) {
        setError(
          err.message ||
            text(
              "Deine Anzeigen konnten nicht geladen werden.",
              "تعذر تحميل إعلاناتك.",
              "Could not load your listings."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMyProducts();
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      const openMenuElement = menuRefs.current[openMenuId];

      if (openMenuElement && !openMenuElement.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="my-products-page">
        <div className="my-products-header">
          <div>
            <p className="eyebrow">
              {text("Meine Anzeigen", "إعلاناتي", "My listings")}
            </p>

            <h1>{text("Deine Anzeigen", "إعلاناتك", "Your listings")}</h1>

            <p>
              {text(
                "Verwalte deine veröffentlichten Artikel an einem Ort.",
                "أدر إعلاناتك المنشورة من مكان واحد.",
                "Manage your published items in one place."
              )}
            </p>
          </div>

          <Link className="btn btn-primary" to="/create-product">
            {text("Neue Anzeige", "إعلان جديد", "New listing")}
          </Link>
        </div>

        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Anzeigen werden geladen...",
              "جارٍ تحميل الإعلانات...",
              "Loading listings..."
            )}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>

            <h2>
              {text(
                "Du hast noch keine Anzeigen.",
                "ليس لديك إعلانات بعد.",
                "You do not have any listings yet."
              )}
            </h2>

            <p>
              {text(
                "Erstelle deine erste Anzeige und gib Dingen eine neue Chance.",
                "أنشئ إعلانك الأول وامنح أغراضك فرصة جديدة.",
                "Create your first listing and give things a new chance."
              )}
            </p>

            <Link className="btn btn-primary" to="/create-product">
              {text("Anzeige erstellen", "إضافة إعلان", "Create listing")}
            </Link>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="my-products-grid">
            {products.map((product) => (
              <article
                className="product-card my-product-card my-management-card"
                key={product.id}
              >
                <div
                  className={`card-menu ${
                    openMenuId === product.id ? "open" : ""
                  }`}
                  ref={(element) => {
                    menuRefs.current[product.id] = element;
                  }}
                >
                  <button
                    className="card-menu-button"
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setOpenMenuId((currentId) =>
                        currentId === product.id ? null : product.id
                      );
                    }}
                    aria-label={text("Aktionen", "خيارات", "Actions")}
                    aria-expanded={openMenuId === product.id}
                  >
                    ⋯
                  </button>

                  <div className="card-menu-list">
                    <Link
                      to={`/products/${product.id}`}
                      onClick={() => setOpenMenuId(null)}
                    >
                      {text("Ansehen", "عرض", "View")}
                    </Link>

                    <Link
                      to={`/edit-product/${product.id}`}
                      onClick={() => setOpenMenuId(null)}
                    >
                      {text("Bearbeiten", "تعديل", "Edit")}
                    </Link>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpenMenuId(null);
                        handleMarkAsSold(product.id);
                      }}
                      disabled={product.productStatus === "SOLD"}
                    >
                      {text(
                        "Als verkauft markieren",
                        "تحديد كمباع",
                        "Mark as sold"
                      )}
                    </button>

                    <button
                      className="danger"
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openDeleteConfirm(product);
                      }}
                    >
                      {text("Löschen", "حذف", "Delete")}
                    </button>
                  </div>
                </div>

                <Link
                  className="product-card-link"
                  to={`/products/${product.id}`}
                >
                  <ProductCardImage product={product} />

                  <div className="product-info">
                    <div className="product-card-tags">
                      <span className="product-tag">
                        {getConditionLabel(
                          product.conditionStatus || product.condition
                        )}
                      </span>

                      <span
                        className={`status-pill status-${(
                          product.productStatus || "ACTIVE"
                        ).toLowerCase()}`}
                      >
                        {getStatusLabel(product.productStatus)}
                      </span>
                    </div>

                    <h3>{product.title}</h3>

                    <p>{product.city}</p>

                    <div className="my-product-card-footer">
                      <strong>{product.price} €</strong>

                      <button
                        className="my-product-favorite-count"
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openFavoriteUsersModal(product);
                        }}
                        title={text(
                          "Favoriten ansehen",
                          "عرض من أضاف للمفضلة",
                          "View favorites"
                        )}
                      >
                        ❤️ {getFavoriteCount(product.id)}
                      </button>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      {favoriteUsersProduct && (
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

                <p>{favoriteUsersProduct.title}</p>
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
                    <div className="favorite-user-row" key={favoriteUser.userId}>
                      <UserAvatar
                        user={{
                          ...favoriteUser,
                          profileImageUrl: buildProfileImageUrl(
                            favoriteUser.profileImageUrl
                          ),
                        }}
                        size="medium"
                      />

                      <div>
                        <strong>{favoriteUser.fullName}</strong>

                        <span>
                          {favoriteUser.city ||
                            text("Keine Stadt", "لا توجد مدينة", "No city")}
                        </span>

                        <small>
                          {text("Gespeichert am", "تمت الإضافة في", "Saved on")}{" "}
                          {formatDate(favoriteUser.favoritedAt)}
                        </small>
                      </div>

                      <Link
                        className="btn btn-secondary favorite-user-profile-link"
                        to={`/users/${favoriteUser.userId}`}
                        onClick={closeFavoriteUsersModal}
                      >
                        {text("Profil", "الملف", "Profile")}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </div>
      )}

      {deleteTargetProduct && (
        <div className="delete-confirm-modal" role="dialog" aria-modal="true">
          <section className="delete-confirm-card">
            <p className="eyebrow">{text("Achtung", "تنبيه", "Warning")}</p>

            <h2>
              {text("Anzeige löschen?", "حذف الإعلان؟", "Delete listing?")}
            </h2>

            <p>
              {text(
                "Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.",
                "هل أنت متأكد؟ لا يمكن التراجع عن هذه العملية.",
                "Are you sure? This action cannot be undone."
              )}
            </p>

            <div className="delete-confirm-product">
              {deleteTargetProduct.title}
            </div>

            <div className="delete-confirm-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
              >
                {text("Abbrechen", "إلغاء", "Cancel")}
              </button>

              <button
                className="btn btn-danger"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting
                  ? text("Wird gelöscht...", "جارٍ الحذف...", "Deleting...")
                  : text("Löschen", "حذف", "Delete")}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default MyProducts;