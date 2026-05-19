import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { createProduct, uploadProductImage } from "../services/api";
import "../App.css";

function CreateProduct() {
  const { isArabic, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    conditionStatus: "",
    price: "",
    city: "",
    deliveryOption: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("hayding-token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getConditionLabel(conditionStatus) {
    const labels = {
      NEW: text("Neu", "جديد", "New"),
      LIKE_NEW: text("Wie neu", "شبه جديد", "Like new"),
      GOOD: text("Gut", "جيد", "Good"),
      ACCEPTABLE: text("Akzeptabel", "مقبول", "Acceptable"),
      USED: text("Gebraucht", "مستعمل", "Used"),
    };

    return labels[conditionStatus] || text("Zustand", "الحالة", "Condition");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setError("");

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError(
        text(
          "Bitte wähle ein JPG-, PNG- oder WEBP-Bild.",
          "يرجى اختيار صورة JPG أو PNG أو WEBP.",
          "Please choose a JPG, PNG or WEBP image."
        )
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        text(
          "Das Bild darf maximal 5MB groß sein.",
          "يجب ألا يتجاوز حجم الصورة 5MB.",
          "The image must be 5MB or smaller."
        )
      );
      return;
    }

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      let uploadedImageUrl = "";

      if (selectedImage) {
        setIsUploadingImage(true);
        uploadedImageUrl = await uploadProductImage(selectedImage);
        setIsUploadingImage(false);
      }

      await createProduct({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        city: formData.city,
        conditionStatus: formData.conditionStatus,
        categoryId: Number(formData.categoryId),
        imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
      });

      setMessage(
        text(
          "Anzeige wurde erfolgreich erstellt.",
          "تم إنشاء الإعلان بنجاح.",
          "Listing created successfully."
        )
      );

      setTimeout(() => {
        navigate("/my-products");
      }, 900);
    } catch (err) {
      setError(
        err.message ||
          text(
            "Anzeige konnte nicht erstellt werden.",
            "تعذر إنشاء الإعلان.",
            "Could not create listing."
          )
      );
    } finally {
      setIsUploadingImage(false);
      setIsLoading(false);
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

          <Link className="btn btn-secondary" to="/">
            {text("Zurück", "رجوع", "Back")}
          </Link>
        </div>
      </header>

      <main className="create-layout">
        <section className="create-main">
          <div className="create-title-block">
            <p className="eyebrow">
              {text("Neue Anzeige", "إعلان جديد", "New listing")}
            </p>

            <h1>
              {text(
                "Was möchtest du anbieten?",
                "ماذا تريد أن تعرض؟",
                "What would you like to list?"
              )}
            </h1>

            <p>
              {text(
                "Füge Bilder, Details und einen fairen Preis hinzu. Je klarer deine Anzeige ist, desto schneller finden dich passende Käufer.",
                "أضف الصور والتفاصيل والسعر المناسب. كلما كان إعلانك أوضح، زادت فرصة أن يصل للمهتمين بسرعة.",
                "Add photos, details and a fair price. The clearer your listing is, the easier it is for interested buyers to find you."
              )}
            </p>
          </div>

          <form className="listing-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <div className="form-section-header">
                <span>1</span>
                <div>
                  <h2>{text("Fotos", "الصور", "Photos")}</h2>
                  <p>
                    {text(
                      "Zeige deinen Artikel mit einem echten Foto.",
                      "اعرض الغرض بصورة حقيقية.",
                      "Show your item with a real photo."
                    )}
                  </p>
                </div>
              </div>

              <label className="upload-box upload-box-clickable">
                {selectedImagePreview ? (
                  <img
                    className="upload-preview-image"
                    src={selectedImagePreview}
                    alt={text("Vorschau", "معاينة", "Preview")}
                  />
                ) : (
                  <>
                    <div className="upload-icon">＋</div>
                    <h3>
                      {text("Foto hinzufügen", "إضافة صورة", "Add photo")}
                    </h3>
                    <p>
                      {text(
                        "JPG, PNG oder WEBP bis maximal 5MB.",
                        "JPG أو PNG أو WEBP حتى 5MB كحد أقصى.",
                        "JPG, PNG or WEBP up to 5MB."
                      )}
                    </p>
                  </>
                )}

                <input
                  className="upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </label>

              {selectedImage && (
                <p className="upload-file-name">
                  {text("Ausgewählt:", "تم الاختيار:", "Selected:")}{" "}
                  {selectedImage.name}
                </p>
              )}
            </section>

            <section className="form-section">
              <div className="form-section-header">
                <span>2</span>
                <div>
                  <h2>{text("Details", "التفاصيل", "Details")}</h2>
                  <p>
                    {text(
                      "Beschreibe deinen Artikel klar und ehrlich.",
                      "اكتب وصفًا واضحًا وصادقًا عن الغرض.",
                      "Describe your item clearly and honestly."
                    )}
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label className="form-field form-field-full">
                  {text("Titel", "عنوان الإعلان", "Title")}
                  <input
                    type="text"
                    name="title"
                    placeholder={text(
                      "z. B. Holzstuhl in gutem Zustand",
                      "مثال: كرسي خشبي بحالة جيدة",
                      "e.g. Wooden chair in good condition"
                    )}
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-field form-field-full">
                  {text("Beschreibung", "الوصف", "Description")}
                  <textarea
                    name="description"
                    rows="5"
                    placeholder={text(
                      "Erzähle etwas über Zustand, Nutzung und Besonderheiten.",
                      "اكتب عن الحالة، الاستخدام، وأي تفاصيل مهمة.",
                      "Share condition, usage and any important details."
                    )}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-field">
                  {text("Kategorie", "الفئة", "Category")}
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {text("Kategorie wählen", "اختر الفئة", "Choose category")}
                    </option>
                    <option value="1">
                      {text("Elektronik", "إلكترونيات", "Electronics")}
                    </option>
                    <option value="2">
                      {text("Möbel", "أثاث", "Furniture")}
                    </option>
                    <option value="3">
                      {text("Kleidung", "ملابس", "Clothing")}
                    </option>
                    <option value="5">
                      {text("Haushalt", "منزل", "Home")}
                    </option>
                    <option value="6">
                      {text("Bücher", "كتب", "Books")}
                    </option>
                    <option value="8">
                      {text("Sport", "رياضة", "Sport")}
                    </option>
                  </select>
                </label>

                <label className="form-field">
                  {text("Zustand", "الحالة", "Condition")}
                  <select
                    name="conditionStatus"
                    value={formData.conditionStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {text("Zustand wählen", "اختر الحالة", "Choose condition")}
                    </option>
                    <option value="NEW">{text("Neu", "جديد", "New")}</option>
                    <option value="LIKE_NEW">
                      {text("Wie neu", "شبه جديد", "Like new")}
                    </option>
                    <option value="GOOD">{text("Gut", "جيد", "Good")}</option>
                    <option value="ACCEPTABLE">
                      {text("Akzeptabel", "مقبول", "Acceptable")}
                    </option>
                    <option value="USED">
                      {text("Gebraucht", "مستعمل", "Used")}
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-header">
                <span>3</span>
                <div>
                  <h2>
                    {text("Preis & Ort", "السعر والموقع", "Price & location")}
                  </h2>
                  <p>
                    {text(
                      "Mach dein Angebot leicht auffindbar.",
                      "اجعل إعلانك واضحًا وسهل الوصول.",
                      "Make your listing easy to find."
                    )}
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label className="form-field">
                  {text("Preis", "السعر", "Price")}
                  <input
                    type="number"
                    name="price"
                    placeholder="35"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </label>

                <label className="form-field">
                  {text("Stadt", "المدينة", "City")}
                  <input
                    type="text"
                    name="city"
                    placeholder="Berlin"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-field form-field-full">
                  {text("Übergabe", "طريقة التسليم", "Handover")}
                  <select
                    name="deliveryOption"
                    value={formData.deliveryOption}
                    onChange={handleChange}
                  >
                    <option value="">
                      {text("Option wählen", "اختر الطريقة", "Choose option")}
                    </option>
                    <option value="pickup">
                      {text("Abholung", "استلام شخصي", "Pickup")}
                    </option>
                    <option value="shipping">
                      {text(
                        "Versand möglich",
                        "الشحن ممكن",
                        "Shipping possible"
                      )}
                    </option>
                    <option value="both">
                      {text("Beides möglich", "كلاهما ممكن", "Both possible")}
                    </option>
                  </select>
                </label>
              </div>
            </section>

            {error && <p className="auth-message auth-error">{error}</p>}
            {message && <p className="auth-message auth-success">{message}</p>}

            <div className="form-actions">
              <button className="btn btn-secondary" type="button">
                {text("Entwurf speichern", "حفظ كمسودة", "Save draft")}
              </button>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={isLoading}
              >
                {isUploadingImage
                  ? text("Bild wird hochgeladen...", "جارٍ رفع الصورة...", "Uploading image...")
                  : isLoading
                    ? text(
                        "Wird veröffentlicht...",
                        "جارٍ نشر الإعلان...",
                        "Publishing..."
                      )
                    : text(
                        "Anzeige veröffentlichen",
                        "نشر الإعلان",
                        "Publish listing"
                      )}
              </button>
            </div>
          </form>
        </section>

        <aside className="listing-preview">
          <p className="eyebrow">{text("Vorschau", "معاينة", "Preview")}</p>

          <div className="listing-preview-card">
            <div className="listing-preview-image">
              {selectedImagePreview ? (
                <img
                  src={selectedImagePreview}
                  alt={text("Vorschau", "معاينة", "Preview")}
                />
              ) : (
                "📦"
              )}
            </div>

            <div className="listing-preview-content">
              <span className="product-tag">
                {getConditionLabel(formData.conditionStatus)}
              </span>

              <h3>
                {formData.title ||
                  text(
                    "Dein Titel erscheint hier",
                    "سيظهر العنوان هنا",
                    "Your title appears here"
                  )}
              </h3>

              <p>
                {formData.city || text("Deine Stadt", "مدينتك", "Your city")}
              </p>

              <strong>{formData.price ? `${formData.price} €` : "0 €"}</strong>
            </div>
          </div>

          <div className="preview-tip">
            <strong>{text("Tipp", "نصيحة", "Tip")}</strong>
            <p>
              {text(
                "Gute Fotos und ein ehrlicher Zustand schaffen Vertrauen.",
                "الصور الجيدة والوصف الصادق يزيدان الثقة.",
                "Good photos and an honest condition build trust."
              )}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CreateProduct;