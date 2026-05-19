import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getProductById, updateProduct } from "../services/api";
import "../App.css";

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isArabic, language, setLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    conditionStatus: "GOOD",
    productStatus: "ACTIVE",
    categoryId: "1",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  useEffect(() => {
    async function loadProduct() {
      const token = localStorage.getItem("hayding-token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const data = await getProductById(productId);
        const product = data?.data || data;

        setFormData({
          title: product.title || "",
          description: product.description || "",
          price: product.price || "",
          city: product.city || "",
          conditionStatus: product.conditionStatus || product.condition || "GOOD",
          productStatus: product.productStatus || "ACTIVE",
          categoryId: product.categoryId || product.category?.id || "1",
        });
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
  }, [productId, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      await updateProduct(productId, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        city: formData.city,
        conditionStatus: formData.conditionStatus,
        productStatus: formData.productStatus,
        categoryId: Number(formData.categoryId),
        imageUrls: [],
      });

      setSuccessMessage(
        text(
          "Anzeige wurde erfolgreich aktualisiert.",
          "تم تحديث الإعلان بنجاح.",
          "Listing updated successfully."
        )
      );

      setTimeout(() => {
        navigate("/my-products");
      }, 700);
    } catch (err) {
      setError(
        err.message ||
          text(
            "Anzeige konnte nicht aktualisiert werden.",
            "تعذر تحديث الإعلان.",
            "Could not update listing."
          )
      );
    } finally {
      setIsSaving(false);
    }
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

          <Link className="btn btn-secondary" to="/my-products">
            {text("Meine Anzeigen", "إعلاناتي", "My listings")}
          </Link>
        </div>
      </header>

      <main className="create-layout">
        <section className="create-main">
          <div className="create-title-block">
            <p className="eyebrow">
              {text("Anzeige bearbeiten", "تعديل الإعلان", "Edit listing")}
            </p>

            <h1>
              {text(
                "Aktualisiere deine Anzeige",
                "عدّل تفاصيل إعلانك",
                "Update your listing"
              )}
            </h1>

            <p>
              {text(
                "Passe Titel, Preis, Beschreibung oder Status deiner Anzeige an.",
                "عدّل العنوان أو السعر أو الوصف أو حالة الإعلان.",
                "Change the title, price, description or status of your listing."
              )}
            </p>
          </div>

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

          {successMessage && (
            <p className="auth-message auth-success">{successMessage}</p>
          )}

          {!isLoading && (
            <form className="listing-form" onSubmit={handleSubmit}>
              <section className="form-section">
                <div className="form-section-header">
                  <span>1</span>
                  <div>
                    <h2>{text("Grunddaten", "المعلومات الأساسية", "Basic info")}</h2>
                    <p>
                      {text(
                        "Diese Informationen sehen Käufer zuerst.",
                        "هذه المعلومات تظهر للمشترين أولاً.",
                        "Buyers see this information first."
                      )}
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <label className="form-field form-field-full">
                    {text("Titel", "العنوان", "Title")}
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className="form-field">
                    {text("Preis", "السعر", "Price")}
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className="form-field">
                    {text("Stadt", "المدينة", "City")}
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className="form-field">
                    {text("Zustand", "الحالة", "Condition")}
                    <select
                      name="conditionStatus"
                      value={formData.conditionStatus}
                      onChange={handleChange}
                    >
                      <option value="NEW">{text("Neu", "جديد", "New")}</option>
                      <option value="LIKE_NEW">
                        {text("Wie neu", "شبه جديد", "Like new")}
                      </option>
                      <option value="GOOD">{text("Gut", "جيد", "Good")}</option>
                      <option value="USED">
                        {text("Gebraucht", "مستعمل", "Used")}
                      </option>
                      <option value="ACCEPTABLE">
                        {text("Akzeptabel", "مقبول", "Acceptable")}
                      </option>
                    </select>
                  </label>

                  <label className="form-field">
                    {text("Status", "حالة الإعلان", "Listing status")}
                    <select
                      name="productStatus"
                      value={formData.productStatus}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">
                        {text("Aktiv", "نشط", "Active")}
                      </option>
                      <option value="RESERVED">
                        {text("Reserviert", "محجوز", "Reserved")}
                      </option>
                      <option value="SOLD">
                        {text("Verkauft", "مباع", "Sold")}
                      </option>
                    </select>
                  </label>

                  <label className="form-field">
                    {text("Kategorie", "الفئة", "Category")}
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <option value="1">{text("Elektronik", "إلكترونيات", "Electronics")}</option>
                      <option value="2">{text("Möbel", "أثاث", "Furniture")}</option>
                      <option value="3">{text("Kleidung", "ملابس", "Clothing")}</option>
                      <option value="4">{text("Haushalt", "منزل", "Home")}</option>
                      <option value="5">{text("Bücher", "كتب", "Books")}</option>
                      <option value="6">{text("Sport", "رياضة", "Sport")}</option>
                    </select>
                  </label>

                  <label className="form-field form-field-full">
                    {text("Beschreibung", "الوصف", "Description")}
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>
              </section>

              <div className="form-actions">
                <Link className="btn btn-secondary" to="/my-products">
                  {text("Abbrechen", "إلغاء", "Cancel")}
                </Link>

                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving
                    ? text("Wird gespeichert...", "جارٍ الحفظ...", "Saving...")
                    : text("Änderungen speichern", "حفظ التعديلات", "Save changes")}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="listing-preview">
          <div className="listing-preview-card">
            <div className="listing-preview-image">📦</div>

            <div className="listing-preview-content">
              <span className="product-tag">
                {formData.conditionStatus || text("Aktiv", "نشط", "Active")}
              </span>

              <h3>
                {formData.title ||
                  text("Titel deiner Anzeige", "عنوان إعلانك", "Your listing title")}
              </h3>

              <p>
                {formData.city ||
                  text("Deine Stadt", "مدينتك", "Your city")}
              </p>

              <strong>
                {formData.price ? `${formData.price} €` : "0 €"}
              </strong>
            </div>
          </div>

          <div className="preview-tip">
            <strong>
              {text("Tipp", "نصيحة", "Tip")}
            </strong>
            <p>
              {text(
                "Halte deine Anzeige aktuell, damit Käufer genau wissen, ob der Artikel noch verfügbar ist.",
                "حافظ على تحديث إعلانك حتى يعرف المشترون إذا كان المنتج ما زال متاحًا.",
                "Keep your listing up to date so buyers know whether the item is still available."
              )}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default EditProduct;