import { useState } from "react"
import "./App.css";

function App() {
  const [language, setLanguage] = useState("DE");
  const categories = [
    "Elektronik",
    "Möbel",
    "Kleidung",
    "Haushalt",
    "Bücher",
    "Sport",
  ];

  const products = [
    {
      title: "Vintage Holzstuhl",
      location: "Berlin",
      price: "35 €",
      tag: "Sehr gut",
    },
    {
      title: "iPhone 12 Mini",
      location: "Hamburg",
      price: "220 €",
      tag: "Gebraucht",
    },
    {
      title: "Kinderfahrrad",
      location: "München",
      price: "60 €",
      tag: "Gut",
    },
  ];

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </div>

        <nav className="nav-links">
          <a href="#categories">Kategorien</a>
          <a href="#how-it-works">So funktioniert&apos;s</a>
          <a href="#products">Entdecken</a>
        </nav>

        <div className="nav-actions">
        <div className="language-switcher" aria-label="Language switcher">
  {["DE", "AR", "EN"].map((lang) => (
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

  <button className="btn btn-secondary">Login</button>
  <button className="btn btn-primary">Anzeige erstellen</button>
</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Marketplace für Deutschland</p>

            <h1>
              Was du hast,
              <br />
              sucht jemand.
            </h1>

            <p className="hero-text">
              HayDing verbindet Menschen, Dinge und Möglichkeiten. Verkaufe,
              kaufe oder entdecke gebrauchte und neue Artikel in deiner Nähe.
            </p>

            <div className="search-box">
              <input
                type="text"
                placeholder="Was suchst du heute?"
                aria-label="Search products"
              />
              <input
                type="text"
                placeholder="Ort oder PLZ"
                aria-label="Search location"
              />
              <button>Suchen</button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Deutschland</strong>
                <span>Startmarkt</span>
              </div>
              <div>
                <strong>3 Sprachen</strong>
                <span>DE · AR · EN</span>
              </div>
              <div>
                <strong>Ein Konto</strong>
                <span>Kaufen & verkaufen</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-header">
              <span className="status-dot"></span>
              <span>Neue Anzeige</span>
            </div>

            <div className="preview-card">
              <div className="preview-image">📦</div>
              <div>
                <h3>Schöne Dinge finden ein neues Zuhause</h3>
                <p>
                  Einfach einstellen, lokal entdecken und direkt Kontakt
                  aufnehmen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="categories">
          <div className="section-header">
            <p className="eyebrow">Kategorien</p>
            <h2>Entdecke, was in deiner Nähe angeboten wird</h2>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <button className="category-card" key={category}>
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="section" id="products">
          <div className="section-header">
            <p className="eyebrow">Vorschau</p>
            <h2>Aktuelle Angebote</h2>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <article className="product-card" key={product.title}>
                <div className="product-image"></div>
                <div className="product-info">
                  <span className="product-tag">{product.tag}</span>
                  <h3>{product.title}</h3>
                  <p>{product.location}</p>
                  <strong>{product.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="how-it-works" id="how-it-works">
          <div>
            <p className="eyebrow">So funktioniert&apos;s</p>
            <h2>Einfach starten mit HayDing</h2>
          </div>

          <div className="steps">
            <div className="step">
              <span>1</span>
              <h3>Artikel einstellen</h3>
              <p>Beschreibe dein Ding, wähle eine Kategorie und veröffentliche es.</p>
            </div>

            <div className="step">
              <span>2</span>
              <h3>Gefunden werden</h3>
              <p>Interessierte Nutzer können dein Angebot sehen und kontaktieren.</p>
            </div>

            <div className="step">
              <span>3</span>
              <h3>Direkt handeln</h3>
              <p>Einigt euch einfach über Nachricht, Abholung oder Übergabe.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="logo">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </div>

        <p>Was du hast, sucht jemand.</p>
      </footer>
    </div>
  );
}

export default App;