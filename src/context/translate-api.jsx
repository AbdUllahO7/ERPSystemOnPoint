'use client';

import { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";

import en from "../../public/locales/en";
import ar from "../../public/locales/ar";
import Cookies from "js-cookie";

const makeCallableDict = (dict) => {
    const fn = (path, fallback) => {
        if (!path || typeof path !== "string") return fallback || "";
        const keys = path.split(".");
        let cur = dict;
        for (const k of keys) {
            if (cur === undefined || cur === null) return fallback !== undefined ? fallback : path;
            cur = cur[k];
        }
        return (cur !== undefined && cur !== null) ? cur : (fallback !== undefined ? fallback : path);
    };
    return Object.assign(fn, dict);
};

const defaultDict = makeCallableDict(ar);

const context = {
    locale: "ar",
    t: defaultDict,
    changeLanguage: () => { },
};

const I18nContext = createContext(context);

export const I18nProvider = ({ initialLocal = "ar", children }) => {
    const [locale, setLocale] = useState(initialLocal);

    /**
     * INFO: Hydration error:
     *   The hydration error occurs because `I18nProvider` is a client-side component, 
     *   but it's being used in a server-rendered context (the root layout) WITHOUT proper synchronization between server and client states.
    */

    // Sync with cookie on mount (client-side only)
    useEffect(() => {
        const cookieLang = Cookies.get('lang');
        if (cookieLang && cookieLang !== locale) {
            setLocale(cookieLang);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const changeLanguage = useCallback((lang) => {
        setLocale(lang);
        Cookies.set("lang", lang, { expires: 365 }); // Store in cookie (expires in 1 year)
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }, []);

    const t = useMemo(() => {
        const dict = locale === "ar" ? ar : en;
        return makeCallableDict(dict);
    }, [locale]);

    return (
        <I18nContext.Provider value={{ locale, t, changeLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);
