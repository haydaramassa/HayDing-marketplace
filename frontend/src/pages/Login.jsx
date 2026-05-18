import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../App.css";

function Login() {
  const { isArabic, t } = useLanguage();

  return (
    <div className={`auth-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="auth-card">
        <Link className="logo auth-logo" to="/">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </Link>

        <p className="eyebrow">{t.loginEyebrow}</p>

        <h1>{t.loginTitle}</h1>

        <p className="auth-text">{t.loginText}</p>

        <form className="auth-form">
          <label>
            {t.email}
            <input type="email" placeholder={t.loginEmailPlaceholder} />
          </label>

          <label>
            {t.password}
            <input type="password" placeholder={t.loginPasswordPlaceholder} />
          </label>

          <button className="btn btn-primary" type="button">
            {t.loginButton}
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