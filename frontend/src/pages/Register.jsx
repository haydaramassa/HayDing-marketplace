import "../App.css";

function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo auth-logo">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </div>

        <p className="eyebrow">Neu bei HayDing?</p>

        <h1>Konto erstellen</h1>

        <p className="auth-text">
          Erstelle dein Konto und nutze HayDing zum Kaufen und Verkaufen.
        </p>

        <form className="auth-form">
          <label>
            Name
            <input type="text" placeholder="Dein Name" />
          </label>

          <label>
            E-Mail
            <input type="email" placeholder="name@example.com" />
          </label>

          <label>
            Passwort
            <input type="password" placeholder="Mindestens 8 Zeichen" />
          </label>

          <button className="btn btn-primary" type="button">
            Konto erstellen
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;