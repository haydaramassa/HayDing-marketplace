import { useState } from "react";
import "./App.css";

function App() {
  const [language, setLanguage] = useState("DE");

  const content = {
    DE: {
      navCategories: "Kategorien",
      navHowItWorks: "So funktioniert's",
      navExplore: "Entdecken",
      login: "Login",
      createAd: "Anzeige erstellen",
      eyebrow: "Marketplace für Deutschland",
      titleLine1: "Was du hast,",
      titleLine2: "sucht",
      titleLine3: "jemand.",
      heroText:
        "HayDing verbindet Menschen, Dinge und Möglichkeiten. Verkaufe, kaufe oder entdecke gebrauchte und neue Artikel in deiner Nähe.",
      searchPlaceholder: "Was suchst du heute?",
      locationPlaceholder: "Ort oder PLZ",
      searchButton: "Suchen",
      statMarketTitle: "Deutschland",
      statMarketText: "Startmarkt",
      statLanguagesTitle: "3 Sprachen",
      statLanguagesText: "DE · AR · EN",
      statAccountTitle: "Ein Konto",
      statAccountText: "Kaufen & verkaufen",
      newAd: "Neue Anzeige",
      previewTitle: "Schöne Dinge finden ein neues Zuhause",
      previewText:
        "Einfach einstellen, lokal entdecken und direkt Kontakt aufnehmen.",
      categoriesEyebrow: "Kategorien",
      categoriesTitle: "Entdecke, was in deiner Nähe angeboten wird",
      productsEyebrow: "Vorschau",
      productsTitle: "Aktuelle Angebote",
      howEyebrow: "So funktioniert's",
      howTitle: "Einfach starten mit HayDing",
      step1Title: "Artikel einstellen",
      step1Text:
        "Beschreibe dein Ding, wähle eine Kategorie und veröffentliche es.",
      step2Title: "Gefunden werden",
      step2Text:
        "Interessierte Nutzer können dein Angebot sehen und kontaktieren.",
      step3Title: "Direkt handeln",
      step3Text:
        "Einigt euch einfach über Nachricht, Abholung oder Übergabe.",
      footerText: "Was du hast, sucht jemand.",
      categories: [
        "Elektronik",
        "Möbel",
        "Kleidung",
        "Haushalt",
        "Bücher",
        "Sport",
      ],
      products: [
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
      ],
    },

    AR: {
      navCategories: "الفئات",
      navHowItWorks: "كيف يعمل",
      navExplore: "استكشف",
      login: "تسجيل الدخول",
      createAd: "إضافة إعلان",
      eyebrow: "سوق إلكتروني في ألمانيا",
      titleLine1: "ما تملكه،",
      titleLine2: "يبحث عنه",
      titleLine3: "شخص آخر.",
      heroText:
        "HayDing يربط الناس بالأشياء والفرص. بِع، اشترِ أو اكتشف منتجات جديدة ومستعملة بالقرب منك.",
      searchPlaceholder: "ماذا تبحث اليوم؟",
      locationPlaceholder: "المدينة أو الرمز البريدي",
      searchButton: "بحث",
      statMarketTitle: "ألمانيا",
      statMarketText: "السوق الأول",
      statLanguagesTitle: "3 لغات",
      statLanguagesText: "DE · AR · EN",
      statAccountTitle: "حساب واحد",
      statAccountText: "للبيع والشراء",
      newAd: "إعلان جديد",
      previewTitle: "غرض لا تحتاجه، فرصة يحتاجها غيرك",
      previewText: "اعرض غرضك بسهولة، ودع المهتمين يتواصلون معك مباشرة.",
      categoriesEyebrow: "الفئات",
      categoriesTitle: "اكتشف ما يُعرض بالقرب منك",
      productsEyebrow: "معاينة",
      productsTitle: "عروض حالية",
      howEyebrow: "كيف يعمل",
      howTitle: "ابدأ بسهولة مع HayDing",
      step1Title: "أضف المنتج",
      step1Text: "اكتب وصفًا بسيطًا، اختر الفئة، ثم انشر الإعلان.",
      step2Title: "ليجدك المهتمون",
      step2Text: "يمكن للمستخدمين مشاهدة إعلانك والتواصل معك.",
      step3Title: "تواصل واتفق",
      step3Text: "اتفقوا عبر الرسائل على السعر، الاستلام أو التسليم.",
      footerText: "ما تملكه، يبحث عنه شخص آخر.",
      categories: [
        "إلكترونيات",
        "أثاث",
        "ملابس",
        "منزل",
        "كتب",
        "رياضة",
      ],
      products: [
        {
          title: "كرسي خشبي كلاسيكي",
          location: "برلين",
          price: "35 €",
          tag: "جيد جدًا",
        },
        {
          title: "iPhone 12 Mini",
          location: "هامبورغ",
          price: "220 €",
          tag: "مستعمل",
        },
        {
          title: "دراجة أطفال",
          location: "ميونخ",
          price: "60 €",
          tag: "جيد",
        },
      ],
    },

    EN: {
      navCategories: "Categories",
      navHowItWorks: "How it works",
      navExplore: "Explore",
      login: "Login",
      createAd: "Create listing",
      eyebrow: "Marketplace for Germany",
      titleLine1: "What you have,",
      titleLine2: "someone",
      titleLine3: "is looking for.",
      heroText:
        "HayDing connects people, things and opportunities. Sell, buy or discover new and used items near you.",
      searchPlaceholder: "What are you looking for?",
      locationPlaceholder: "City or ZIP code",
      searchButton: "Search",
      statMarketTitle: "Germany",
      statMarketText: "First market",
      statLanguagesTitle: "3 languages",
      statLanguagesText: "DE · AR · EN",
      statAccountTitle: "One account",
      statAccountText: "Buy & sell",
      newAd: "New listing",
      previewTitle: "Beautiful things find a new home",
      previewText: "List easily, discover locally and contact directly.",
      categoriesEyebrow: "Categories",
      categoriesTitle: "Discover what is offered near you",
      productsEyebrow: "Preview",
      productsTitle: "Current offers",
      howEyebrow: "How it works",
      howTitle: "Start easily with HayDing",
      step1Title: "Create a listing",
      step1Text: "Describe your item, choose a category and publish it.",
      step2Title: "Get discovered",
      step2Text: "Interested users can see your offer and contact you.",
      step3Title: "Deal directly",
      step3Text: "Agree via messages on pickup, handover or details.",
      footerText: "What you have, someone is looking for.",
      categories: [
        "Electronics",
        "Furniture",
        "Clothing",
        "Home",
        "Books",
        "Sport",
      ],
      products: [
        {
          title: "Vintage wooden chair",
          location: "Berlin",
          price: "35 €",
          tag: "Very good",
        },
        {
          title: "iPhone 12 Mini",
          location: "Hamburg",
          price: "220 €",
          tag: "Used",
        },
        {
          title: "Kids bicycle",
          location: "Munich",
          price: "60 €",
          tag: "Good",
        },
      ],
    },
  };

  const t = content[language];
  const isArabic = language === "AR";

  return (
    <div className={`app ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <header className="navbar">
        <div className="logo">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </div>

        <nav className="nav-links">
          <a href="#categories">{t.navCategories}</a>
          <a href="#how-it-works">{t.navHowItWorks}</a>
          <a href="#products">{t.navExplore}</a>
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

          <button className="btn btn-secondary">{t.login}</button>
          <button className="btn btn-primary">{t.createAd}</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">{t.eyebrow}</p>

            <h1>
              {t.titleLine1}
              <br />
              {t.titleLine2}
              <br />
              {t.titleLine3}
            </h1>

            <p className="hero-text">{t.heroText}</p>

            <div className="search-box">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                aria-label="Search products"
              />
              <input
                type="text"
                placeholder={t.locationPlaceholder}
                aria-label="Search location"
              />
              <button>{t.searchButton}</button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{t.statMarketTitle}</strong>
                <span>{t.statMarketText}</span>
              </div>
              <div>
                <strong>{t.statLanguagesTitle}</strong>
                <span>{t.statLanguagesText}</span>
              </div>
              <div>
                <strong>{t.statAccountTitle}</strong>
                <span>{t.statAccountText}</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-header">
              <span className="status-dot"></span>
              <span>{t.newAd}</span>
            </div>

            <div className="preview-card">
              <div className="preview-image">📦</div>
              <div>
                <h3>{t.previewTitle}</h3>
                <p>{t.previewText}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="categories">
          <div className="section-header">
            <p className="eyebrow">{t.categoriesEyebrow}</p>
            <h2>{t.categoriesTitle}</h2>
          </div>

          <div className="categories-grid">
            {t.categories.map((category) => (
              <button className="category-card" key={category}>
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="section" id="products">
          <div className="section-header">
            <p className="eyebrow">{t.productsEyebrow}</p>
            <h2>{t.productsTitle}</h2>
          </div>

          <div className="products-grid">
            {t.products.map((product) => (
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
            <p className="eyebrow">{t.howEyebrow}</p>
            <h2>{t.howTitle}</h2>
          </div>

          <div className="steps">
            <div className="step">
              <span>1</span>
              <h3>{t.step1Title}</h3>
              <p>{t.step1Text}</p>
            </div>

            <div className="step">
              <span>2</span>
              <h3>{t.step2Title}</h3>
              <p>{t.step2Text}</p>
            </div>

            <div className="step">
              <span>3</span>
              <h3>{t.step3Title}</h3>
              <p>{t.step3Text}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="logo">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </div>

        <p>{t.footerText}</p>
      </footer>
    </div>
  );
}

export default App;