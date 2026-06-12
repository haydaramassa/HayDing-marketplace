import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getProducts, getPublicUserProfile } from "../services/api";
import ProductCardImage from "../components/ProductCardImage";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function PublicUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isArabic, language, setLanguage } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [error, setError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [notFound, setNotFound] = useState(false);

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/products");
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return text("Nicht angegeben", "غير محدد", "Not specified");
    }

    return new Intl.DateTimeFormat(
      language === "AR" ? "ar" : language === "EN" ? "en" : "de",
      {
        year: "numeric",
        month: "long",
      }
    ).format(new Date(dateValue));
  }

  function getConditionLabel(conditionStatus) {
    const labels = {
      NEW: text("Neu", "جديد", "New"),
      LIKE_NEW: text("Wie neu", "شبه جديد", "Like new"),
      GOOD: text("Gut", "جيد", "Good"),
      ACCEPTABLE: text("Akzeptabel", "مقبول", "Acceptable"),
      USED: text("Gebraucht", "مستعمل", "Used"),
    };

    return labels[conditionStatus] || conditionStatus;
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError("");
        setNotFound(false);
        setProfile(null);

        const data = await getPublicUserProfile(userId);
        const user = data?.data || data;

        if (!user || !user.id) {
          setNotFound(true);
          return;
        }

        setProfile(user);
      } catch (err) {
        const message = err.message || "";
        const isNumericUserId = /^\d+$/.test(String(userId));

        if (
          isNumericUserId ||
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
                "Profil konnte nicht geladen werden.",
                "تعذر تحميل الملف الشخصي.",
                "Could not load profile."
              )
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    async function loadSellerProducts() {
      try {
        setIsProductsLoading(true);
        setProductsError("");

        const data = await getProducts();
        const products = data?.data || data || [];

        const filteredProducts = Array.isArray(products)
          ? products.filter(
              (product) =>
                Number(product.seller?.id) === Number(userId) &&
                product.productStatus !== "SOLD"
            )
          : [];

        setSellerProducts(filteredProducts);
      } catch (err) {
        setProductsError(
          err.message ||
            text(
              "Anzeigen konnten nicht geladen werden.",
              "تعذر تحميل إعلانات البائع.",
              "Could not load seller listings."
            )
        );
      } finally {
        setIsProductsLoading(false);
      }
    }

    loadProfile();
    loadSellerProducts();
  }, [userId]);

  const sellerDisplayName =
    profile?.fullName || text("Unbekannt", "غير معروف", "Unknown");

  const sortedSellerProducts = useMemo(() => {
    return [...sellerProducts].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();

      if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
        return Number(b.id || 0) - Number(a.id || 0);
      }

      return dateB - dateA;
    });
  }, [sellerProducts]);

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
            onClick={handleBack}
          >
            {text("Zurück", "رجوع", "Back")}
          </button>
        </div>
      </header>

      <main className="account-page public-user-page">
        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Profil wird geladen...",
              "جارٍ تحميل الملف الشخصي...",
              "Loading profile..."
            )}
          </p>
        )}

        {!isLoading && notFound && (
          <section className="not-found-card product-not-found-card">
            <p className="eyebrow">404</p>

            <h1>
              {text(
                "Nutzer nicht verfügbar",
                "المستخدم غير متاح",
                "User unavailable"
              )}
            </h1>

            <p>
              {text(
                "Dieses Profil existiert nicht mehr oder ist aktuell nicht verfügbar.",
                "هذا الملف الشخصي لم يعد موجوداً أو غير متاح حالياً.",
                "This profile no longer exists or is currently unavailable."
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

        {error && !notFound && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && !notFound && profile && (
          <>
            <section className="public-profile-card">
              <UserAvatar
                user={profile}
                size="large"
                className="public-profile-avatar"
              />

              <div className="public-profile-info">
                <p className="eyebrow">
                  {text("Verkäuferprofil", "ملف البائع", "Seller profile")}
                </p>

                <h1>{sellerDisplayName}</h1>

                <div className="public-profile-meta">
                  <div>
                    <span>{text("Stadt", "المدينة", "City")}</span>
                    <strong>
                      {profile.city ||
                        text("Nicht angegeben", "غير محدد", "Not specified")}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {text("Mitglied seit", "عضو منذ", "Member since")}
                    </span>
                    <strong>{formatDate(profile.createdAt)}</strong>
                  </div>

                  <div>
                    <span>{text("Sprache", "اللغة", "Language")}</span>
                    <strong>{profile.preferredLanguage || "—"}</strong>
                  </div>
                </div>

                {profile.bio ? (
                  <div className="public-profile-bio">
                    <span>{text("Bio", "نبذة", "Bio")}</span>
                    <p>{profile.bio}</p>
                  </div>
                ) : (
                  <p className="public-profile-note">
                    {text(
                      "Dieser Nutzer hat noch keine Bio hinzugefügt.",
                      "لم يضف هذا المستخدم نبذة بعد.",
                      "This user has not added a bio yet."
                    )}
                  </p>
                )}
              </div>
            </section>

            <section className="public-profile-listings">
              <div className="public-profile-listings-header">
                <div>
                  <p className="eyebrow">
                    {text("Anzeigen", "الإعلانات", "Listings")}
                  </p>

                  <h2>
                    {text(
                      `Anzeigen von ${sellerDisplayName}`,
                      `إعلانات ${sellerDisplayName}`,
                      `Listings by ${sellerDisplayName}`
                    )}
                  </h2>
                </div>

                <span>
                  {text(
                    `${sortedSellerProducts.length} Anzeigen`,
                    `${sortedSellerProducts.length} إعلان`,
                    `${sortedSellerProducts.length} listings`
                  )}
                </span>
              </div>

              {isProductsLoading && (
                <p className="auth-message auth-success">
                  {text(
                    "Anzeigen werden geladen...",
                    "جارٍ تحميل الإعلانات...",
                    "Loading listings..."
                  )}
                </p>
              )}

              {productsError && (
                <p className="auth-message auth-error">{productsError}</p>
              )}

              {!isProductsLoading &&
                !productsError &&
                sortedSellerProducts.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>

                    <h2>
                      {text(
                        "Keine aktiven Anzeigen.",
                        "لا توجد إعلانات نشطة.",
                        "No active listings."
                      )}
                    </h2>

                    <p>
                      {text(
                        "Dieser Verkäufer hat aktuell keine aktiven Anzeigen.",
                        "هذا البائع لا يملك إعلانات نشطة حالياً.",
                        "This seller currently has no active listings."
                      )}
                    </p>
                  </div>
                )}

              {!isProductsLoading &&
                !productsError &&
                sortedSellerProducts.length > 0 && (
                  <div className="my-products-grid">
                    {sortedSellerProducts.map((product) => (
                      <Link
                        className="product-card my-product-card product-card-link"
                        key={product.id}
                        to={`/products/${product.id}`}
                      >
                        <ProductCardImage product={product} />

                        <div className="product-info">
                          <span className="product-tag">
                            {getConditionLabel(
                              product.conditionStatus || product.condition
                            ) || text("Aktiv", "نشط", "Active")}
                          </span>

                          <h3>{product.title}</h3>

                          <p>{product.city}</p>

                          <strong>{product.price} €</strong>
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

export default PublicUserProfile;
