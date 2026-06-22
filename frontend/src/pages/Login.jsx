import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { loginUser } from "../services/api";
import "../App.css";

function Login() {
  const { isArabic, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(() =>
    searchParams.get("sessionExpired") === "true"
      ? isArabic
        ? "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى."
        : "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an."
      : ""
  );

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
      const data = await loginUser(formData);

      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken ||
        data?.data?.jwt;

      const user = data?.user || data?.data?.user;

      if (user) {
        localStorage.setItem("hayding-user", JSON.stringify(user));
      }

      if (!token) {
        throw new Error(
          isArabic
            ? "تم تسجيل الدخول، لكن لم يتم استلام رمز الدخول من السيرفر."
            : "Login succeeded, but no token was received from the server."
        );
      }

      localStorage.setItem("hayding-token", token);
      window.dispatchEvent(new Event("hayding-auth-updated"));

      setMessage(
        isArabic
          ? "تم تسجيل الدخول بنجاح. سيتم نقلك إلى الصفحة الرئيسية."
          : "Login successful. Redirecting to homepage."
      );

      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (err) {
      setError(
        err.message ||
          (isArabic
            ? "فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور."
            : "Login failed. Please check your email and password.")
      );
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

        <p className="eyebrow">{t.loginEyebrow}</p>

        <h1>{t.loginTitle}</h1>

        <p className="auth-text">{t.loginText}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            {t.email}
            <input
              type="email"
              name="email"
              placeholder={t.loginEmailPlaceholder}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t.password}
            <input
              type="password"
              name="password"
              placeholder={t.loginPasswordPlaceholder}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <p className="auth-message auth-error">{error}</p>}
          {message && <p className="auth-message auth-success">{message}</p>}

          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading
              ? isArabic
                ? "جارٍ تسجيل الدخول..."
                : "Logging in..."
              : t.loginButton}
          </button>
        </form>

        <p className="auth-switch">
          {t.loginSwitchText} <Link to="/register">{t.loginSwitchLink}</Link>
        </p>

        <Link className="auth-back-link" to="/">
          {t.backHome}
        </Link>
      </div>
    </div>
  );
}

export default Login;