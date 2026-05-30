import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadProfileImage,
} from "../services/api";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function Account() {
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    city: "",
    bio: "",
    profileImageUrl: "",
    preferredLanguage: "DE",
  });

  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function buildProfileImageUrl(imageUrl) {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `http://localhost:8080${imageUrl}`;
  }

  function updateStoredUser(updatedUser) {
    const storedUser = JSON.parse(localStorage.getItem("hayding-user") || "{}");

    localStorage.setItem(
      "hayding-user",
      JSON.stringify({
        ...storedUser,
        fullName: updatedUser.fullName || profile.fullName,
        city: updatedUser.city || profile.city,
        bio: updatedUser.bio || profile.bio,
        profileImageUrl:
          updatedUser.profileImageUrl || profile.profileImageUrl,
        preferredLanguage:
          updatedUser.preferredLanguage || profile.preferredLanguage,
      })
    );
  }

  useEffect(() => {
    const token = localStorage.getItem("hayding-token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
      try {
        const data = await getCurrentUserProfile();
        const user = data?.data || data;

        setProfile({
          fullName: user.fullName || "",
          email: user.email || "",
          city: user.city || "",
          bio: user.bio || "",
          profileImageUrl: user.profileImageUrl || "",
          preferredLanguage: user.preferredLanguage || "DE",
        });
      } catch (err) {
        setError(
          err.message ||
            text(
              "Profil konnte nicht geladen werden.",
              "تعذر تحميل الملف الشخصي.",
              "Could not load profile."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  }

  function handleProfileImageChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError(
        text(
          "Bitte wähle nur JPG-, PNG- oder WEBP-Bilder.",
          "يرجى اختيار صور JPG أو PNG أو WEBP فقط.",
          "Please choose only JPG, PNG or WEBP images."
        )
      );
      return;
    }

    if (file.size > maxSize) {
      setError(
        text(
          "Das Bild darf maximal 5MB groß sein.",
          "يجب ألا يتجاوز حجم الصورة 5MB.",
          "The image must be 5MB or smaller."
        )
      );
      return;
    }

    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setSelectedProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));

    event.target.value = "";
  }

  async function handleUploadProfileImage() {
    if (!selectedProfileImage) {
      return;
    }

    setError("");
    setMessage("");
    setIsUploadingProfileImage(true);

    try {
      const data = await uploadProfileImage(selectedProfileImage);
      const updatedUser = data?.data || data;

      setProfile((currentProfile) => ({
        ...currentProfile,
        profileImageUrl:
          updatedUser.profileImageUrl || currentProfile.profileImageUrl,
      }));

      updateStoredUser(updatedUser);

      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }

      setSelectedProfileImage(null);
      setProfileImagePreview("");

      setMessage(
        text(
          "Profilbild wurde erfolgreich aktualisiert.",
          "تم تحديث صورة الملف الشخصي بنجاح.",
          "Profile image updated successfully."
        )
      );
    } catch (err) {
      setError(
        err.message ||
          text(
            "Profilbild konnte nicht hochgeladen werden.",
            "تعذر رفع صورة الملف الشخصي.",
            "Could not upload profile image."
          )
      );
    } finally {
      setIsUploadingProfileImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const data = await updateCurrentUserProfile({
        fullName: profile.fullName,
        city: profile.city,
        bio: profile.bio,
        preferredLanguage: profile.preferredLanguage,
      });

      const updatedUser = data?.data || data;

      setProfile((currentProfile) => ({
        ...currentProfile,
        fullName: updatedUser.fullName || currentProfile.fullName,
        city: updatedUser.city || currentProfile.city,
        bio: updatedUser.bio || currentProfile.bio,
        profileImageUrl:
          updatedUser.profileImageUrl || currentProfile.profileImageUrl,
        preferredLanguage:
          updatedUser.preferredLanguage || currentProfile.preferredLanguage,
      }));

      updateStoredUser(updatedUser);

      setMessage(
        text(
          "Profil wurde erfolgreich aktualisiert.",
          "تم تحديث الملف الشخصي بنجاح.",
          "Profile updated successfully."
        )
      );
    } catch (err) {
      setError(
        err.message ||
          text(
            "Profil konnte nicht gespeichert werden.",
            "تعذر حفظ الملف الشخصي.",
            "Could not save profile."
          )
      );
    } finally {
      setIsSaving(false);
    }
  }

  const bioLength = profile.bio.length;

  const avatarUser = {
    ...profile,
    profileImageUrl: profileImagePreview || buildProfileImageUrl(profile.profileImageUrl),
  };

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="account-page">
        <section className="account-hero">
          <div>
            <p className="eyebrow">
              {text("Mein Konto", "حسابي", "My account")}
            </p>

            <h1>
              {text(
                "Profil & Einstellungen",
                "الملف الشخصي والإعدادات",
                "Profile & settings"
              )}
            </h1>

            <p>
              {text(
                "Verwalte deine öffentlichen Profilinformationen.",
                "أدر معلومات ملفك الشخصي العامة.",
                "Manage your public profile information."
              )}
            </p>
          </div>

          <UserAvatar user={avatarUser} size="large" className="account-avatar" />
        </section>

        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Profil wird geladen...",
              "جارٍ تحميل الملف الشخصي...",
              "Loading profile..."
            )}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}
        {message && <p className="auth-message auth-success">{message}</p>}

        {!isLoading && (
          <form className="account-card" onSubmit={handleSubmit}>
            <div className="profile-image-section">
              <div className="profile-image-preview">
                <UserAvatar user={avatarUser} size="xl" />
              </div>

              <div className="profile-image-content">
                <p className="eyebrow">
                  {text("Profilbild", "صورة الملف الشخصي", "Profile image")}
                </p>

                <h2>
                  {text(
                    "Lade ein Bild hoch",
                    "ارفع صورة شخصية",
                    "Upload an image"
                  )}
                </h2>

                <p>
                  {text(
                    "JPG, PNG oder WEBP. Maximal 5MB.",
                    "JPG أو PNG أو WEBP. الحجم الأقصى 5MB.",
                    "JPG, PNG or WEBP. Maximum 5MB."
                  )}
                </p>

                <div className="profile-image-actions">
                  <label className="btn btn-secondary profile-image-picker">
                    {text("Bild auswählen", "اختيار صورة", "Choose image")}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfileImageChange}
                    />
                  </label>

                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleUploadProfileImage}
                    disabled={!selectedProfileImage || isUploadingProfileImage}
                  >
                    {isUploadingProfileImage
                      ? text("Wird hochgeladen...", "جارٍ الرفع...", "Uploading...")
                      : text("Bild speichern", "حفظ الصورة", "Save image")}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <label className="form-field form-field-full">
                {text("Vollständiger Name", "الاسم الكامل", "Full name")}
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field form-field-full">
                {text("E-Mail", "البريد الإلكتروني", "Email")}
                <input type="email" value={profile.email} disabled />
              </label>

              <label className="form-field">
                {text("Stadt", "المدينة", "City")}
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="Leipzig"
                />
              </label>

              <label className="form-field">
                {text(
                  "Bevorzugte Sprache",
                  "اللغة المفضلة",
                  "Preferred language"
                )}
                <select
                  name="preferredLanguage"
                  value={profile.preferredLanguage}
                  onChange={handleChange}
                >
                  <option value="DE">Deutsch</option>
                  <option value="EN">English</option>
                  <option value="AR">العربية</option>
                </select>
              </label>

              <label className="form-field form-field-full">
                {text("Kurzbeschreibung", "نبذة قصيرة", "Short bio")}
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  maxLength="500"
                  rows="4"
                  placeholder={text(
                    "Erzähle kurz etwas über dich, z. B. was du verkaufst oder wonach du suchst.",
                    "اكتب نبذة قصيرة عنك، مثلاً ماذا تبيع أو عمّ تبحث.",
                    "Write a short bio, for example what you sell or what you are looking for."
                  )}
                />
                <small className="field-hint">{bioLength}/500</small>
              </label>
            </div>

            <div className="form-actions">
              <Link className="btn btn-secondary" to="/">
                {text("Abbrechen", "إلغاء", "Cancel")}
              </Link>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
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
      </main>
    </div>
  );
}

export default Account;