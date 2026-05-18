import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

const DEFAULT_LANGUAGE = "DE";

export const translations = {
  DE: {
    login: "Login",
    register: "Konto erstellen",
    backHome: "Zurück zur Startseite",
    email: "E-Mail",
    password: "Passwort",
    name: "Name",

    loginEyebrow: "Willkommen zurück",
    loginTitle: "Login",
    loginText:
      "Melde dich an, um deine Anzeigen, Favoriten und Nachrichten zu verwalten.",
    loginButton: "Einloggen",
    loginSwitchText: "Noch kein Konto?",
    loginSwitchLink: "Konto erstellen",
    loginEmailPlaceholder: "name@example.com",
    loginPasswordPlaceholder: "Dein Passwort",

    registerEyebrow: "Neu bei HayDing?",
    registerTitle: "Konto erstellen",
    registerText:
      "Erstelle dein Konto und nutze HayDing zum Kaufen und Verkaufen.",
    registerButton: "Konto erstellen",
    registerSwitchText: "Schon ein Konto?",
    registerSwitchLink: "Einloggen",
    registerNamePlaceholder: "Dein Name",
    registerEmailPlaceholder: "name@example.com",
    registerPasswordPlaceholder: "Mindestens 8 Zeichen",
  },

  AR: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    backHome: "العودة إلى الصفحة الرئيسية",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "الاسم",

    loginEyebrow: "أهلًا بعودتك",
    loginTitle: "تسجيل الدخول",
    loginText:
      "سجّل دخولك لإدارة إعلاناتك، المفضلة، والرسائل الخاصة بك.",
    loginButton: "دخول",
    loginSwitchText: "ليس لديك حساب؟",
    loginSwitchLink: "أنشئ حسابًا",
    loginEmailPlaceholder: "name@example.com",
    loginPasswordPlaceholder: "كلمة المرور",

    registerEyebrow: "جديد في HayDing؟",
    registerTitle: "إنشاء حساب",
    registerText:
      "أنشئ حسابك وابدأ باستخدام HayDing للبيع والشراء.",
    registerButton: "إنشاء حساب",
    registerSwitchText: "لديك حساب بالفعل؟",
    registerSwitchLink: "تسجيل الدخول",
    registerNamePlaceholder: "اسمك",
    registerEmailPlaceholder: "name@example.com",
    registerPasswordPlaceholder: "8 أحرف على الأقل",
  },

  EN: {
    login: "Login",
    register: "Create account",
    backHome: "Back to homepage",
    email: "Email",
    password: "Password",
    name: "Name",

    loginEyebrow: "Welcome back",
    loginTitle: "Login",
    loginText:
      "Sign in to manage your listings, favorites and messages.",
    loginButton: "Log in",
    loginSwitchText: "No account yet?",
    loginSwitchLink: "Create account",
    loginEmailPlaceholder: "name@example.com",
    loginPasswordPlaceholder: "Your password",

    registerEyebrow: "New to HayDing?",
    registerTitle: "Create account",
    registerText:
      "Create your account and use HayDing to buy and sell.",
    registerButton: "Create account",
    registerSwitchText: "Already have an account?",
    registerSwitchLink: "Log in",
    registerNamePlaceholder: "Your name",
    registerEmailPlaceholder: "name@example.com",
    registerPasswordPlaceholder: "At least 8 characters",
  },
};

function getSavedLanguage() {
  const savedLanguage = localStorage.getItem("hayding-language");

  if (savedLanguage === "DE" || savedLanguage === "AR" || savedLanguage === "EN") {
    return savedLanguage;
  }

  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getSavedLanguage);

  useEffect(() => {
    localStorage.setItem("hayding-language", language);
  }, [language]);

  const isArabic = language === "AR";
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isArabic, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}