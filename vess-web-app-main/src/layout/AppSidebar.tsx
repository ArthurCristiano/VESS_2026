import { useCallback } from "react";
import { Link, useLocation } from "react-router";

import { MapIcon, MapPinnedIcon, UsersIcon } from "lucide-react";

import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
// @ts-ignore: allow importing image without module declarations
import img from "../assets/utfpr_img.png";
// @ts-ignore: allow importing image without module declarations
import img_dark from "../assets/utfpr_dark_img.png";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    icon: <MapIcon />,
    name: "Mapa",
    path: "/mapa",
  },
  {
    icon: <MapPinnedIcon />,
    name: "Relatório de Localizações",
    path: "/relatorio-localizacao",
  },
/*  {
    icon: <UsersIcon />,
    name: "Relatório de Pessoas",
    path: "/relatorio-pessoas",
  },*/
  {
    icon: <UsersIcon />,
    name: "Relatório de Usuarios",
    path: "/relatorio-usuarios",
    adminOnly: true,
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const accessibleNavItems = navItems.filter((item) => {
    return !item.adminOnly || (item.adminOnly && user?.admin === true);
  });

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="block dark:hidden"
                src={img}
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src={img_dark}
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src={img}
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        {(isExpanded || isHovered || isMobileOpen) && (
          <h3 className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Menu
          </h3>
        )}

        <nav className="mb-6">
          <ul className="flex flex-col gap-4">
            {accessibleNavItems.map((nav) => (
              <li key={nav.name}>
                <Link
                  to={nav.path}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-gray-600 dark:text-gray-400 duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isActive(nav.path)
                      ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                      : ""
                  }`}
                >
                  <span
                    className={` ${
                      isActive(nav.path)
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="text-sm">{nav.name}</span>
                  )}

                  {!isExpanded && !isHovered && !isMobileOpen && (
                    <span className="absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded-md bg-gray-900 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 pointer-events-none z-50">
                      {nav.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
