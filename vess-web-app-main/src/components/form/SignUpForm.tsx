import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import Label from "./Label";
import Input from "./input/InputField";
import Checkbox from "./input/Checkbox";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const { t } = useLanguage();

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
      setError(t("auth.register.acceptTermsError"));
      setLoading(false);
      return;
    }

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.institution ||
      !formData.country ||
      !formData.state ||
      !formData.city
    ) {
      setError(t("auth.register.requiredError"));
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      alert(t("auth.register.emailConfirmation"));
      navigate("/login");
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      let finalErrorMessage = t("auth.register.genericError");

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === "string") {
          finalErrorMessage = errorData;
        } else if (typeof errorData === "object" && errorData.message) {
          finalErrorMessage = errorData.message;
        } else if (typeof errorData === "object" && errorData.errors && Array.isArray(errorData.errors)) {
          finalErrorMessage = errorData.errors.map((e: any) => e.defaultMessage || t("auth.register.validationError")).join(" ");
        } else if (err.response.status === 400) {
          finalErrorMessage = t("auth.register.requiredError");
        }
      } else if (err.response && typeof err.response.data === "string") {
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
          {t("auth.register.backToLogin")}
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto pb-16 px-4 sm:px-0">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white/90 sm:text-2xl">
              {t("auth.register.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.register.subtitle")}
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="username">
                    {t("common.name")}<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder={t("auth.register.namePlaceholder")}
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    {t("common.email")}<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t("auth.register.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="institution">
                    {t("common.institution")}<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institution"
                    type="text"
                    name="institution"
                    placeholder={t("auth.register.institutionPlaceholder")}
                    value={formData.institution}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <Label htmlFor="country">
                      {t("common.country")}<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      name="country"
                      placeholder={t("auth.register.countryPlaceholder")}
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">
                      {t("common.state")}<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      name="state"
                      placeholder={t("auth.register.statePlaceholder")}
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">
                      {t("common.city")}<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      name="city"
                      placeholder={t("auth.register.cityPlaceholder")}
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">
                    {t("common.password")}<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder={t("auth.register.passwordPlaceholder")}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 dark:text-gray-400"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("auth.register.passwordHint")}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={isChecked} onChange={setIsChecked} />
                  <Label htmlFor="terms" className="mb-0 font-normal text-sm text-gray-500 dark:text-gray-400">
                    {t("auth.register.termsPrefix")}{" "}
                    <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {t("auth.register.terms")}
                    </a>{" "}
                    {t("auth.register.termsMiddle")}{" "}
                    <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {t("auth.register.privacy")}
                    </a>
                  </Label>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div>
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-blue-600 shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading || !isChecked}
                  >
                    {loading ? t("auth.register.loading") : t("auth.register.submit")}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t("auth.register.hasAccount")}{" "}
                <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                  {t("auth.login.title")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
