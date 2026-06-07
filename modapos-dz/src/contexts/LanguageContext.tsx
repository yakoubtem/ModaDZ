import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// Statically import all JSON translation modules for maximum performance (loaded once at startup)
import commonFr from "@/locales/fr/common.json";
import dashboardFr from "@/locales/fr/dashboard.json";
import posFr from "@/locales/fr/pos.json";
import productsFr from "@/locales/fr/products.json";
import inventoryFr from "@/locales/fr/inventory.json";
import customersFr from "@/locales/fr/customers.json";
import salesFr from "@/locales/fr/sales.json";
import debtsFr from "@/locales/fr/debts.json";
import expensesFr from "@/locales/fr/expenses.json";
import usersFr from "@/locales/fr/users.json";
import settingsFr from "@/locales/fr/settings.json";

import commonAr from "@/locales/ar/common.json";
import dashboardAr from "@/locales/ar/dashboard.json";
import posAr from "@/locales/ar/pos.json";
import productsAr from "@/locales/ar/products.json";
import inventoryAr from "@/locales/ar/inventory.json";
import customersAr from "@/locales/ar/customers.json";
import salesAr from "@/locales/ar/sales.json";
import debtsAr from "@/locales/ar/debts.json";
import expensesAr from "@/locales/ar/expenses.json";
import usersAr from "@/locales/ar/users.json";
import settingsAr from "@/locales/ar/settings.json";

export type Language = "fr" | "ar";

const translations = {
  fr: {
    common: commonFr,
    dashboard: dashboardFr,
    pos: posFr,
    products: productsFr,
    inventory: inventoryFr,
    customers: customersFr,
    sales: salesFr,
    debts: debtsFr,
    expenses: expensesFr,
    users: usersFr,
    settings: settingsFr,
  },
  ar: {
    common: commonAr,
    dashboard: dashboardAr,
    pos: posAr,
    products: productsAr,
    inventory: inventoryAr,
    customers: customersAr,
    sales: salesAr,
    debts: debtsAr,
    expenses: expensesAr,
    users: usersAr,
    settings: settingsAr,
  },
} as const;

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language, userId?: number) => Promise<boolean>;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to lookup nested properties (e.g. "common.buttons.save")
const getNestedValue = (obj: any, path: string): string | undefined => {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
};

// Helper for {variable} string interpolation
const interpolate = (str: string, replacements?: Record<string, string | number>): string => {
  if (!replacements) return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return replacements[key] !== undefined ? String(replacements[key]) : match;
  });
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from SQLite on startup
  useEffect(() => {
    const fetchSavedLanguage = async () => {
      try {
        if (window.api && typeof window.api.invoke === "function") {
          const res = await window.api.invoke("settings:getAll") as Record<string, string>;
          const savedLanguage = res?.language as Language;
          if (savedLanguage === "fr" || savedLanguage === "ar") {
            setLanguage(savedLanguage);
            document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = savedLanguage;
          }
        }
      } catch (err) {
        console.error("Failed to restore language from SQLite settings:", err);
      } finally {
        setIsInitialized(true);
      }
    };
    fetchSavedLanguage();
  }, []);

  const changeLanguage = useCallback(async (newLang: Language, userId?: number): Promise<boolean> => {
    setLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;

    // Persist to SQLite
    try {
      if (window.api && typeof window.api.invoke === "function") {
        await window.api.invoke("settings:updateMany", {
          currentUserId: userId,
          updates: { language: newLang },
        });
        return true;
      }
    } catch (err) {
      console.error("Failed to save language setting in SQLite:", err);
    }
    return false;
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[language], key);
    if (value !== undefined) {
      return interpolate(value, replacements);
    }

    // Fallback to French if translation is missing in the current language
    if (language !== "fr") {
      const fallbackValue = getNestedValue(translations["fr"], key);
      if (fallbackValue !== undefined) {
        return interpolate(fallbackValue, replacements);
      }
    }

    return key; // Return the key itself as fallback
  }, [language]);

  const dir = language === "ar" ? "rtl" : "ltr";
  const isRtl = language === "ar";

  // Hide children or show a loading state until initialized to avoid flashes of untranslated text
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, dir, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
