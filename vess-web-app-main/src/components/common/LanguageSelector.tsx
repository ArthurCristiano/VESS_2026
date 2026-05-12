import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Language, useLanguage } from "../../context/LanguageContext";

type LanguageOption = {
  value: Language;
  shortLabel: string;
  labelKey: "common.portuguese" | "common.english" | "common.spanish";
};

const options: LanguageOption[] = [
  { value: "pt-BR", shortLabel: "PT", labelKey: "common.portuguese" },
  { value: "en", shortLabel: "EN", labelKey: "common.english" },
  { value: "es", shortLabel: "ES", labelKey: "common.spanish" },
];

function FlagIcon({ language }: { language: Language }) {
  return (
    <span
      className="relative inline-flex size-7 shrink-0 overflow-hidden rounded-full border border-gray-200 shadow-sm dark:border-gray-700"
      aria-hidden="true"
    >
      {language === "pt-BR" && (
        <span className="relative size-full bg-[#229e45]">
          <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#f7df1e]" />
          <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1d4ed8]" />
        </span>
      )}
      {language === "en" && (
        <span className="relative size-full bg-[#1f3f8b]">
          <span className="absolute inset-x-0 top-[11px] h-[5px] bg-white" />
          <span className="absolute inset-y-0 left-[11px] w-[5px] bg-white" />
          <span className="absolute inset-x-0 top-[12px] h-[3px] bg-[#c8102e]" />
          <span className="absolute inset-y-0 left-[12px] w-[3px] bg-[#c8102e]" />
        </span>
      )}
      {language === "es" && (
        <span className="flex size-full flex-col">
          <span className="h-1/4 bg-[#aa151b]" />
          <span className="h-1/2 bg-[#f1bf00]" />
          <span className="h-1/4 bg-[#aa151b]" />
        </span>
      )}
    </span>
  );
}

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === language) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label={t("common.language")}
        aria-expanded={isOpen}
      >
        <FlagIcon language={selectedOption.value} />
        <span className="hidden sm:inline">{t(selectedOption.labelKey)}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[1000] mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setLanguage(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                option.value === language
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <FlagIcon language={option.value} />
              <span>{t(option.labelKey)}</span>
              <span className="ml-auto text-xs uppercase text-gray-400">{option.shortLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
