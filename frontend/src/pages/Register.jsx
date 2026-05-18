import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../App.css";

function Register() {
  const { isArabic, t } = useLanguage();

  return (
    <div className={`auth-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="auth-card">
        <Link className="logo auth-logo" to="/">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </Link>

        <p className="eyebrow">{t.registerEyebrow}</p>

        <h1>{t.registerTitle}</h1>

        <p className="auth-text">{t.registerText}</p>

        <form className="auth-form">
          <label>
            {t.name}
            <input type="text" placeholder={t.registerNamePlaceholder} />
          </label>

          <label>
            {t.email}
            <input type="email" placeholder={t.registerEmailPlaceholder} />
          </label>

          <label>
            {t.password}
            <input type="password" placeholder={t.registerPasswordPlaceholder} />
          </label>

          <button className="btn btn-primary" type="button">
            {t.registerButton}
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