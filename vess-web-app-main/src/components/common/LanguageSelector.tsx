import { Languages } from "lucide-react";
import { Language, useLanguage } from "../../context/LanguageContext";

const options: Array<{ value: Language; shortLabel: string; labelKey: "common.portuguese" | "common.english" | "common.spanish" }> = [
  { value: "pt-BR", shortLabel: "PT", labelKey: "common.portuguese" },
  { value: "en", shortLabel: "EN", labelKey: "common.english" },
  { value: "es", shortLabel: "ES", labelKey: "common.spanish" },
];

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <Languages size={16} className="shrink-0 text-gray-500 dark:text-gray-400" />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label={t("common.language")}
        className="min-w-0 bg-transparent text-sm font-medium outline-none dark:bg-gray-800"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.shortLabel} - {t(option.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
