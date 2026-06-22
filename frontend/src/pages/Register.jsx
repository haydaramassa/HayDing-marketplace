import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { registerUser } from "../services/api";
import "../App.css";

function Register() {
  const { isArabic, language, t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    city: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getRegisterErrorMessage(err) {
    const rawMessage = String(err?.message || "").toLowerCase();

    const isEmailAlreadyUsed =
      rawMessage.includes("email") ||
      rawMessage.includes("already") ||
      rawMessage.includes("exists") ||
      rawMessage.includes("duplicate") ||
      rawMessage.includes("bad request") ||
      rawMessage.includes("400");

    if (isEmailAlreadyUsed) {
      return text(
        "Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an oder verwende eine andere E-Mail-Adresse.",
        "هذا البريد الإلكتروني مستخدم مسبقاً. جرّب تسجيل الدخول أو استخدم بريداً آخر.",
        "This email is already registered. Please sign in or use another email."
      );
    }

    return (
      err.message ||
      text(
        "Beim Erstellen deines Kontos ist ein Fehler aufgetreten.",
        "حدث خطأ أثناء إنشاء الحساب.",
        "Something went wrong while creating your account."
      )
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await registerUser({
        ...formData,
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        city: formData.city.trim(),
        preferredLanguage: isArabic ? "AR" : "DE",
      });

      setMessage(
        text(
          "Konto erfolgreich erstellt. Du wirst zur Anmeldung weitergeleitet.",
          "تم إنشاء الحساب بنجاح. سيتم نقلك إلى تسجيل الدخول.",
          "Account created successfully. Redirecting to login."
        )
      );

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`auth-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="auth-card">
        <Link className="logo auth-logo" to="/">
          <span className="logo-mark logo-image-mark">
            <img src="/icon/hayding-mark.png" alt="" aria-hidden="true" />
          </span>

          <span>HayDing</span>
        </Link>

        <p className="eyebrow">{t.registerEyebrow}</p>

        <h1>{t.registerTitle}</h1>

        <p className="auth-text">{t.registerText}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            {t.name}
            <input
              type="text"
              name="fullName"
              placeholder={t.registerNamePlaceholder}
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t.email}
            <input
              type="email"
              name="email"
              placeholder={t.registerEmailPlaceholder}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {isArabic ? "المدينة" : "City"}
            <input
              type="text"
              name="city"
              placeholder={isArabic ? "مثال: Berlin" : "Example: Berlin"}
              value={formData.city}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t.password}
            <input
              type="password"
              name="password"
              placeholder={t.registerPasswordPlaceholder}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </label>

          {error && <p className="auth-message auth-error">{error}</p>}
          {message && <p className="auth-message auth-success">{message}</p>}

          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading
              ? text(
                  "Konto wird erstellt...",
                  "جارٍ إنشاء الحساب...",
                  "Creating account..."
                )
              : t.registerButton}
          </button>
        </form>

        <p className="auth-switch">
          {t.registerSwitchText} <Link to="/login">{t.registerSwitchLink}</Link>
        </p>

        <Link className="auth-back-link" to="/">
          {t.backHome}
        </Link>
      </div>
    </div>
  );
}

export default Register;