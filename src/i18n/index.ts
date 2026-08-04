import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import darija from "./darija.json";
import en from "./en.json";
import fr from "./fr.json";

const resources = {
  en,
  fr,
  darija,
};

i18n.use(initReactI18next).init({
  resources,
  lng: "darija", // Defaulting to Darija for local testing
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already safeguards from XSS
  },
});

export default i18n;
