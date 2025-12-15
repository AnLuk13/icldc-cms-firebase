"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locales = [
  { code: "ro", nameKey: "romanian", flag: "https://flagcdn.com/w320/ro.png" },
  { code: "en", nameKey: "english", flag: "https://flagcdn.com/w320/gb.png" },
  { code: "ru", nameKey: "russian", flag: "https://flagcdn.com/w320/ru.png" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  const currentLocale = locales.find((l) => l.code === locale);

  const handleLocaleChange = (newLocale: string) => {
    
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <img
            src={currentLocale?.flag}
            alt={currentLocale ? t(currentLocale.nameKey) : ""}
            className="w-4 h-4 rounded-full object-cover"
          />
          <span className="hidden sm:inline">
            {currentLocale ? t(currentLocale.nameKey) : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className="flex items-center gap-2"
          >
            <img
              src={locale.flag}
              alt={t(locale.nameKey)}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>{t(locale.nameKey)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
