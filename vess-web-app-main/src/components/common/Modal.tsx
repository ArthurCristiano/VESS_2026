import { X } from "lucide-react";
import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useEffect } from "react";

interface ModalProps {
  id?: string;               
  isOpen: boolean;           
  onClose: () => void;       
  title: string;           
  children: React.ReactNode; 
  maxWidthClass?: string;
}

export default function Modal({
  id,
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-xl",
}: ModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidthClass} max-h-[95vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-100 transition-transform duration-300 dark:bg-gray-900 dark:ring-gray-800`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            title={t("common.closeModal")}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}
