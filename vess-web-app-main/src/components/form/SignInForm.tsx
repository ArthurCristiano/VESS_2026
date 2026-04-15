import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeClosed, EyeIcon } from "lucide-react";
import Label from "./Label";
import Input from "./input/InputField";
import Checkbox from "./input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { getBackendErrorMessage } from "../../services/api";

export default function SignInForm() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      navigate("/mapa");
    } catch (err: unknown) {
      console.error(err);
      setError(
        getBackendErrorMessage(err) ??
          "Não foi possível entrar. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Entrar
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Digite seu e-mail e senha para entrar!
            </p>
          </div>
          <div>
            {successMessage && (
              <p className="text-sm text-green-500 bg-green-100 p-3 rounded-md mb-4">
                {successMessage}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    E-mail <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Senha <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeClosed className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Manter-me conectado
                    </span>
                  </div>
                  <Link
                    to="/recuperar-senha"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                {error && <p className="text-sm text-error-500">{error}</p>}

                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Não tem uma conta?{" "}
                <Link
                  to="/cadastro"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
