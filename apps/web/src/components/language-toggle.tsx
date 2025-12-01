import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LanguageToggle() {
    const { i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ru' ? 'en' : 'ru';
        i18n.changeLanguage(newLang);
    };

    // Prevent hydration mismatch by rendering a placeholder or nothing until mounted
    if (!mounted) {
        return (
            <button className="p-2 text-muted-foreground flex items-center gap-1 opacity-50 cursor-wait">
                <Globe className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleLanguage}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            title={i18n.language === 'ru' ? 'Switch to English' : 'Переключить на Русский'}
        >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-medium uppercase">{i18n.language}</span>
        </button>
    );
}
