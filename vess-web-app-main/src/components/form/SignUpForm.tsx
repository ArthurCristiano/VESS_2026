import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronLeftIcon, Eye, EyeClosed, EyeIcon, EyeOff } from "lucide-react";
import Label from "./Label";
import Input from "./input/InputField";
import Checkbox from "./input/Checkbox";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    institution: "",
    country: "",
    state: "",
    city: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isChecked) {
        setError("Você deve concordar com os Termos e Condições e Política de Privacidade.");
        setLoading(false);
        return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.institution || !formData.country || !formData.state || !formData.city) {
        setError("Todos os campos marcados com * são obrigatórios.");
        setLoading(false);
        return;
    }

    try {
      await registerUser(formData);
      alert("Verifique a caixa de entrada do seu e-mail e acesse o link para confirmar o seu cadastro.");
      navigate("/login");
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      let finalErrorMessage = "Ocorreu um erro inesperado durante o cadastro. Tente novamente.";

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === "string") {
          finalErrorMessage = errorData;
        } else if (typeof errorData === "object" && errorData.message) {
          finalErrorMessage = errorData.message;
        } else if (typeof errorData === "object" && errorData.errors && Array.isArray(errorData.errors)) {
          finalErrorMessage = errorData.errors.map((e: any) => e.defaultMessage || 'Erro de validação').join(' ');
        } else if (err.response.status === 400) {
           finalErrorMessage = "Dados inválidos. Verifique as informações fornecidas.";
        }
      } else if (err.response && typeof err.response.data === 'string') {
          finalErrorMessage = err.response.data;
      }

      setError(finalErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 pt-6 sm:pt-10">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeft className="size-5" />
          Voltar para o login
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto pb-16 px-4 sm:px-0">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white/90 sm:text-2xl">
              Cadastre-se
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Digite suas informações para se cadastrar!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="username">
                    Nome<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Digite seu nome"
                    value={formData.username}
                    onChange={handleChange}

                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    E-mail<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Digite seu e-mail"
                    value={formData.email}
                    onChange={handleChange}

                  />
                </div>

                <div>
                  <Label htmlFor="institution">
                    Instituição/Empresa<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institution"
                    type="text"
                    name="institution"
                    placeholder="Sua instituição ou empresa"
                    value={formData.institution}
                    onChange={handleChange}

                  />
                </div>

                 <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                     <div>
                       <Label htmlFor="country">
                         País<span className="text-red-500">*</span>
                       </Label>
                       <Input
                         id="country"
                         type="text"
                         name="country"
                         placeholder="Seu país"
                         value={formData.country}
                         onChange={handleChange}
      
                       />
                     </div>
                      <div>
                       <Label htmlFor="state">
                         Estado<span className="text-red-500">*</span>
                       </Label>
                       <Input
                         id="state"
                         type="text"
                         name="state"
                         placeholder="Seu estado"
                         value={formData.state}
                         onChange={handleChange}
      
                       />
                     </div>
                      <div>
                       <Label htmlFor="city">
                         Cidade<span className="text-red-500">*</span>
                       </Label>
                       <Input
                         id="city"
                         type="text"
                         name="city"
                         placeholder="Sua cidade"
                         value={formData.city}
                         onChange={handleChange}
      
                       />
                     </div>
                 </div>

                <div>
                  <Label htmlFor="password">
                    Senha<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Digite sua senha"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 dark:text-gray-400"
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                   <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mínimo 6 caracteres, com maiúscula, minúscula e número.</p>
                </div>

                <div className="flex items-start gap-3">
                   <Checkbox
                     id="terms"
                     checked={isChecked}
                     onChange={setIsChecked}
                   />
                   <Label htmlFor="terms" className="mb-0 font-normal text-sm text-gray-500 dark:text-gray-400">
                     Ao criar uma conta, você concorda com os{" "}
                     <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                       Termos e Condições
                     </a>{" "}
                     e com a nossa{" "}
                     <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                       Política de Privacidade
                     </a>
                   </Label>
                 </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <div>
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-blue-600 shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading || !isChecked}
                  >
                    {loading ? "Cadastrando..." : "Cadastrar"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}