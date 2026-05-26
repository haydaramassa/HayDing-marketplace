import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../services/api";
import Navbar from "../components/Navbar";
import "../App.css";

function Account() {
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    city: "",
    preferredLanguage: "DE",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getInitials(nameOrEmail) {
    const source = nameOrEmail || profile.email || "H";

    return (
      source
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "H"
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

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const data = await updateCurrentUserProfile({
        fullName: profile.fullName,
        city: profile.city,
        preferredLanguage: profile.preferredLanguage,
      });

      const updatedUser = data?.data || data;

      setProfile((currentProfile) => ({
        ...currentProfile,
        fullName: updatedUser.fullName || currentProfile.fullName,
        city: updatedUser.city || currentProfile.city,
        preferredLanguage:
          updatedUser.preferredLanguage || currentProfile.preferredLanguage,
      }));

      const storedUser = JSON.parse(
        localStorage.getItem("hayding-user") || "{}"
      );

      localStorage.setItem(
        "hayding-user",
        JSON.stringify({
          ...storedUser,
          fullName: updatedUser.fullName || profile.fullName,
          city: updatedUser.city || profile.city,
          preferredLanguage:
            updatedUser.preferredLanguage || profile.preferredLanguage,
        })
      );

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

          <div className="account-avatar">
            {getInitials(profile.fullName || profile.email)}
          </div>
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