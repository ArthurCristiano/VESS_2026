import {useState} from "react";
import {DropdownItem} from "../ui/dropdown/DropdownItem";
import {Dropdown} from "../ui/dropdown/Dropdown";
import {Link, useNavigate} from "react-router";
import {ChevronDown, LogOut, UserIcon} from "lucide-react";
import {useAuth} from "../../context/AuthContext";

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const {user, logoutUser} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    if (!user) {
        return (
            <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
                Entrar
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
        <span
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600">
          <UserIcon size={20} className="text-gray-700 dark:text-gray-300"/>
        </span>

                <span className="hidden font-medium sm:block text-theme-sm">
          {user.username}
        </span>
                <ChevronDown
                    size={20}
                    className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="absolute right-0 mt-3 flex w-[260px] flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
                <div className="px-3 py-2">
          <span className="block font-bold text-gray-800 text-theme-sm dark:text-gray-200">
            {user.username}
          </span>
                    <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
                </div>

                <ul className="flex flex-col gap-1 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <li>
                        <DropdownItem
                            tag="a"
                            to="/perfil"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
                        >
                            <UserIcon
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            Perfil
                        </DropdownItem>
                    </li>
                    <li>
                        <DropdownItem
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 font-medium text-red-600 rounded-lg group text-theme-sm hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"
                        >
                            <LogOut size={18}/>
                            Sair
                        </DropdownItem>
                    </li>
                </ul>
            </Dropdown>
        </div>
    );
}
