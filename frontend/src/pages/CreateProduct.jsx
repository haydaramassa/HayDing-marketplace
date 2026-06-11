import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  createProduct,
  getCategories,
  uploadProductImage,
} from "../services/api";
import Navbar from "../components/Navbar";
import "../App.css";

function CreateProduct() {
  const { isArabic, language } = useLanguage();
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

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        const items = data?.data || data || [];

        setCategories(Array.isArray(items) ? items : []);
      } catch {
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getCategoryName(category) {
    if (isArabic) return category.nameAr;
    if (language === "EN") return category.nameEn;
    return category.nameDe;
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
    const files = Array.from(event.target.files || []);

    setError("");

    if (files.length === 0) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxImages = 5;
    const maxSize = 5 * 1024 * 1024;

    const availableSlots = maxImages - selectedImages.length;

    if (availableSlots <= 0) {
      setError(
        text(
          "Du kannst maximal 5 Bilder hinzufügen.",
          "يمكنك إضافة 5 صور كحد أقصى.",
          "You can add up to 5 images."
        )
      );
      return;
    }

    const limitedFiles = files.slice(0, availableSlots);

    const invalidFile = limitedFiles.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFile) {
      setError(
        text(
          "Bitte wähle nur JPG-, PNG- oder WEBP-Bilder.",
          "يرجى اختيار صور JPG أو PNG أو WEBP فقط.",
          "Please choose only JPG, PNG or WEBP images."
        )
      );
      return;
    }

    const tooLargeFile = limitedFiles.find((file) => file.size > maxSize);

    if (tooLargeFile) {
      setError(
        text(
          "Jedes Bild darf maximal 5MB groß sein.",
          "يجب ألا يتجاوز حجم كل صورة 5MB.",
          "Each image must be 5MB or smaller."
        )
      );
      return;
    }

    const newPreviews = limitedFiles.map((file) => URL.createObjectURL(file));

    setSelectedImages((currentImages) => [...currentImages, ...limitedFiles]);
    setSelectedImagePreviews((currentPreviews) => [
      ...currentPreviews,
      ...newPreviews,
    ]);

    if (selectedImagePreviews.length === 0) {
      setActivePreviewIndex(0);
    }

    event.target.value = "";
  }

  function handleRemoveImage(indexToRemove) {
    setSelectedImages((currentImages) =>
      currentImages.filter((_, index) => index !== indexToRemove)
    );

    setSelectedImagePreviews((currentPreviews) => {
      const previewToRemove = currentPreviews[indexToRemove];

      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove);
      }

      return currentPreviews.filter((_, index) => index !== indexToRemove);
    });

    setActivePreviewIndex((currentIndex) => {
      if (indexToRemove === currentIndex) {
        return 0;
      }

      if (indexToRemove < currentIndex) {
        return currentIndex - 1;
      }

      return currentIndex;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      let uploadedImageUrls = [];

      if (selectedImages.length > 0) {
        setIsUploadingImage(true);

        uploadedImageUrls = await Promise.all(
          selectedImages.map((imageFile) => uploadProductImage(imageFile))
        );

        setIsUploadingImage(false);
      }

      await createProduct({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        city: formData.city,
        conditionStatus: formData.conditionStatus,
        categoryId: Number(formData.categoryId),
        imageUrls: uploadedImageUrls,
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

  const activePreviewImage = selectedImagePreviews[activePreviewIndex] || "";
  const imageCount = selectedImagePreviews.length;

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

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
                      "Füge bis zu 5 echte Fotos hinzu.",
                      "أضف حتى 5 صور حقيقية.",
                      "Add up to 5 real photos."
                    )}
                  </p>
                </div>
              </div>

              <label className="upload-box upload-box-clickable">
                {activePreviewImage ? (
                  <img
                    className="upload-preview-image"
                    src={activePreviewImage}
                    alt={text("Vorschau", "معاينة", "Preview")}
                  />
                ) : (
                  <>
                    <div className="upload-icon">＋</div>
                    <h3>
                      {text("Fotos hinzufügen", "إضافة صور", "Add photos")}
                    </h3>
                    <p>
                      {text(
                        "JPG, PNG oder WEBP. Maximal 5 Bilder, je 5MB.",
                        "JPG أو PNG أو WEBP. حتى 5 صور، كل صورة 5MB.",
                        "JPG, PNG or WEBP. Up to 5 images, 5MB each."
                      )}
                    </p>
                  </>
                )}

                <input
                  className="upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                />
              </label>

              {imageCount > 0 && (
                <div className="upload-thumbnails">
                  {selectedImagePreviews.map((previewUrl, index) => (
                    <div
                      className={`upload-thumbnail ${
                        activePreviewIndex === index ? "active" : ""
                      }`}
                      key={previewUrl}
                    >
                      <button
                        className="upload-thumbnail-image"
                        type="button"
                        onClick={() => setActivePreviewIndex(index)}
                        aria-label={text(
                          "Bild auswählen",
                          "اختيار الصورة",
                          "Select image"
                        )}
                      >
                        <img
                          src={previewUrl}
                          alt={`${text("Bild", "صورة", "Image")} ${index + 1}`}
                        />
                      </button>

                      <button
                        className="upload-thumbnail-remove"
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={text(
                          "Bild entfernen",
                          "إزالة الصورة",
                          "Remove image"
                        )}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {imageCount < 5 && (
                    <label className="upload-thumbnail upload-thumbnail-add">
                      ＋
                      <input
                        className="upload-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
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

                    {categories.map((category) => (
                      <option value={category.id} key={category.id}>
                        {getCategoryName(category)}
                      </option>
                    ))}
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
                  ? text(
                      "Bilder werden hochgeladen...",
                      "جارٍ رفع الصور...",
                      "Uploading images..."
                    )
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
              {activePreviewImage ? (
                <img
                  src={activePreviewImage}
                  alt={text("Vorschau", "معاينة", "Preview")}
                />
              ) : (
                "📦"
              )}

              {imageCount > 0 && (
                <span className="image-counter">
                  {activePreviewIndex + 1}/{imageCount}
                </span>
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
                "Mehrere gute Fotos helfen Käufern, den Artikel besser einzuschätzen.",
                "عدة صور جيدة تساعد المشترين على فهم حالة الغرض بشكل أفضل.",
                "Several good photos help buyers understand the item better."
              )}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CreateProduct;