import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getCategories,
  getProductById,
  updateProduct,
  uploadProductImage,
} from "../services/api";
import {
  getProductImagePaths,
  getProductImages,
} from "../utils/productImages";
import Navbar from "../components/Navbar";
import "../App.css";

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isArabic, language } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    conditionStatus: "GOOD",
    productStatus: "ACTIVE",
    categoryId: "1",
  });

  const [categories, setCategories] = useState([]);

  const [existingImagePaths, setExistingImagePaths] = useState([]);
  const [existingImagePreviews, setExistingImagePreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const allImagePreviews = [...existingImagePreviews, ...newImagePreviews];
  const imageCount = allImagePreviews.length;
  const activePreviewImage = allImagePreviews[activeImageIndex] || "";

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
          conditionStatus:
            product.conditionStatus || product.condition || "GOOD",
          productStatus: product.productStatus || "ACTIVE",
          categoryId: String(product.categoryId || product.category?.id || "1"),
        });

        setExistingImagePaths(getProductImagePaths(product));
        setExistingImagePreviews(getProductImages(product));
        setActiveImageIndex(0);
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

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);

    setError("");

    if (files.length === 0) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxImages = 5;
    const maxSize = 5 * 1024 * 1024;
    const availableSlots = maxImages - imageCount;

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

    const previews = limitedFiles.map((file) => URL.createObjectURL(file));

    setNewImages((currentImages) => [...currentImages, ...limitedFiles]);
    setNewImagePreviews((currentPreviews) => [...currentPreviews, ...previews]);

    if (imageCount === 0) {
      setActiveImageIndex(0);
    }

    event.target.value = "";
  }

  function handleRemoveImage(indexToRemove) {
    const existingCount = existingImagePreviews.length;

    if (indexToRemove < existingCount) {
      setExistingImagePaths((currentPaths) =>
        currentPaths.filter((_, index) => index !== indexToRemove)
      );

      setExistingImagePreviews((currentPreviews) =>
        currentPreviews.filter((_, index) => index !== indexToRemove)
      );
    } else {
      const newImageIndex = indexToRemove - existingCount;

      setNewImages((currentImages) =>
        currentImages.filter((_, index) => index !== newImageIndex)
      );

      setNewImagePreviews((currentPreviews) => {
        const previewToRemove = currentPreviews[newImageIndex];

        if (previewToRemove) {
          URL.revokeObjectURL(previewToRemove);
        }

        return currentPreviews.filter((_, index) => index !== newImageIndex);
      });
    }

    setActiveImageIndex((currentIndex) => {
      const nextImageCount = imageCount - 1;

      if (nextImageCount <= 0) {
        return 0;
      }

      if (indexToRemove === currentIndex) {
        return Math.min(currentIndex, nextImageCount - 1);
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
    setSuccessMessage("");
    setIsSaving(true);

    try {
      let uploadedNewImagePaths = [];

      if (newImages.length > 0) {
        setIsUploadingImage(true);

        uploadedNewImagePaths = await Promise.all(
          newImages.map((imageFile) => uploadProductImage(imageFile))
        );

        setIsUploadingImage(false);
      }

      const finalImageUrls = [...existingImagePaths, ...uploadedNewImagePaths];

      await updateProduct(productId, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        city: formData.city,
        conditionStatus: formData.conditionStatus,
        productStatus: formData.productStatus,
        categoryId: Number(formData.categoryId),
        imageUrls: finalImageUrls,
      });

      setSuccessMessage(
        text(
          "Anzeige wurde erfolgreich aktualisiert.",
          "تم تحديث الإعلان بنجاح.",
          "Listing updated successfully."
        )
      );

      setTimeout(() => {
        navigate(`/products/${productId}`);
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
      setIsUploadingImage(false);
      setIsSaving(false);
    }
  }

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
                "Passe Titel, Preis, Beschreibung, Status oder Bilder deiner Anzeige an.",
                "عدّل العنوان أو السعر أو الوصف أو الحالة أو صور الإعلان.",
                "Change the title, price, description, status or images of your listing."
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
            <form
              id="edit-product-form"
              className="listing-form"
              onSubmit={handleSubmit}
            >
              <section className="form-section">
                <div className="form-section-header">
                  <span>1</span>
                  <div>
                    <h2>{text("Fotos", "الصور", "Photos")}</h2>
                    <p>
                      {text(
                        "Verwalte bis zu 5 Bilder deiner Anzeige.",
                        "أدر حتى 5 صور لإعلانك.",
                        "Manage up to 5 images for your listing."
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
                    {allImagePreviews.map((previewUrl, index) => (
                      <div
                        className={`upload-thumbnail ${
                          activeImageIndex === index ? "active" : ""
                        }`}
                        key={`${previewUrl}-${index}`}
                      >
                        <button
                          className="upload-thumbnail-image"
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          aria-label={text(
                            "Bild auswählen",
                            "اختيار الصورة",
                            "Select image"
                          )}
                        >
                          <img
                            src={previewUrl}
                            alt={`${text("Bild", "صورة", "Image")} ${
                              index + 1
                            }`}
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
                    <h2>
                      {text("Grunddaten", "المعلومات الأساسية", "Basic info")}
                    </h2>
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
                      {categories.length === 0 && (
                        <option value={formData.categoryId}>
                          {text(
                            "Kategorie wird geladen...",
                            "جارٍ تحميل الفئات...",
                            "Loading category..."
                          )}
                        </option>
                      )}

                      {categories.map((category) => (
                        <option value={category.id} key={category.id}>
                          {getCategoryName(category)}
                        </option>
                      ))}
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

                <button
                  className="btn btn-primary"
                  type="submit"
                  form="edit-product-form"
                  disabled={isSaving}
                >
                  {isUploadingImage
                    ? text(
                        "Bilder werden hochgeladen...",
                        "جارٍ رفع الصور...",
                        "Uploading images..."
                      )
                    : isSaving
                      ? text("Wird gespeichert...", "جارٍ الحفظ...", "Saving...")
                      : text(
                          "Änderungen speichern",
                          "حفظ التعديلات",
                          "Save changes"
                        )}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="listing-preview">
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
                  {activeImageIndex + 1}/{imageCount}
                </span>
              )}
            </div>

            <div className="listing-preview-content">
              <span className="product-tag">
                {formData.conditionStatus || text("Aktiv", "نشط", "Active")}
              </span>

              <h3>
                {formData.title ||
                  text(
                    "Titel deiner Anzeige",
                    "عنوان إعلانك",
                    "Your listing title"
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
                "Du kannst bestehende Bilder entfernen oder neue Bilder hinzufügen.",
                "يمكنك حذف الصور الحالية أو إضافة صور جديدة.",
                "You can remove existing images or add new ones."
              )}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default EditProduct;