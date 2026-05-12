import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import UserDropdown from "../components/header/UserDropdown";
import { Menu } from "lucide-react";
import LanguageSelector from "../components/common/LanguageSelector";

const AppHeader: React.FC = () => {
  const { toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between h-16 z-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMobileSidebar}
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
