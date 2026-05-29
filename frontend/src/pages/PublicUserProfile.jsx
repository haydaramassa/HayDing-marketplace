import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getPublicUserProfile } from "../services/api";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function PublicUserProfile() {
  const { userId } = useParams();
  const { isArabic, language, setLanguage } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
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

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getPublicUserProfile(userId);
        const user = data?.data || data;
        setProfile(user);
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
  }, [userId]);

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

          <Link className="btn btn-secondary" to="/products">
            {text("Zurück", "رجوع", "Back")}
          </Link>
        </div>
      </header>

      <main className="account-page">
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

        {!isLoading && !error && profile && (
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

              <h1>
                {profile.fullName ||
                  text("Unbekannt", "غير معروف", "Unknown")}
              </h1>

              <div className="public-profile-meta">
                <div>
                  <span>{text("Stadt", "المدينة", "City")}</span>
                  <strong>
                    {profile.city ||
                      text("Nicht angegeben", "غير محدد", "Not specified")}
                  </strong>
                </div>

                <div>
                  <span>{text("Mitglied seit", "عضو منذ", "Member since")}</span>
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
        )}
      </main>
    </div>
  );
}

export default PublicUserProfile;