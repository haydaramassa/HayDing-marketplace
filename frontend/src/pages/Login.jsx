import "../App.css";

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo auth-logo">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </div>

        <p className="eyebrow">Willkommen zurück</p>

        <h1>Login</h1>

        <p className="auth-text">
          Melde dich an, um deine Anzeigen, Favoriten und Nachrichten zu
          verwalten.
        </p>

        <form className="auth-form">
          <label>
            E-Mail
            <input type="email" placeholder="name@example.com" />
          </label>

          <label>
            Passwort
            <input type="password" placeholder="Dein Passwort" />
          </label>

          <button className="btn btn-primary" type="button">
            Einloggen
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;