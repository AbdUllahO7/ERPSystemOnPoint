'use client';

// import { useI18n } from "./translate-api";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "../../context/translate-api";

export function LanguageSwitcher() {
    const { changeLanguage, locale } = useI18n();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 bg-muted hover:bg-muted/80"
                >
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" dir="rtl">
                <DropdownMenuItem
                    onClick={() => changeLanguage("ar")}
                    className={locale === "ar" ? "bg-primary/10 text-primary" : ""}
                >
                    🇸🇦 العربية
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage("en")}
                    className={locale === "en" ? "bg-primary/10 text-primary" : ""}
                >
                    🇬🇧 English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
