import { useState } from "react";
import { Link } from "react-router-dom";
import Label from "./Label";
import Input from "./input/InputField";
import Button from "../ui/button/Button";
import { forgotPassword } from "../../services/AuthService";
import { useLanguage } from "../../context/LanguageContext";

export default function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await forgotPassword(email);
      setMessage(t("auth.forgot.success"));
    } catch (err) {
      setError(t("auth.forgot.error"));
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
              {t("auth.forgot.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.forgot.subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>
                {t("common.email")} <span className="text-error-500">*</span>{" "}
              </Label>
              <Input
                placeholder="info@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            {error && <p className="text-sm text-error-500">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}
            <div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? t("auth.forgot.loading") : t("auth.forgot.submit")}
              </Button>
            </div>
          </form>
          <div className="mt-5">
            <Link to="/login" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
              {t("auth.forgot.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
