import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Label from "./Label";
import Input from "./input/InputField";
import Button from "../ui/button/Button";
import { resetPassword, validateResetToken } from "../../services/AuthService";
import { useLanguage } from "../../context/LanguageContext";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    async function checkToken() {
      setTokenChecked(false);
      try {
        await validateResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    }
    if (token) checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError(t("auth.reset.passwordMismatch"));
      setLoading(false);
      return;
    }
    try {
      await resetPassword(token, newPassword);
      setMessage(t("auth.reset.success"));
      setTimeout(() => navigate("/login", { state: { message: t("auth.reset.successShort") } }), 2000);
    } catch (err) {
      setError(t("auth.reset.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return <div className="p-8 text-center">{t("auth.reset.validating")}</div>;
  }

  if (!tokenValid) {
    return (
      <div className="p-8 text-center">
        <p className="text-error-500 mb-4">{t("auth.reset.invalidLink")}</p>
        <Link to="/recuperar-senha" className="text-brand-500 hover:text-brand-600">
          {t("auth.reset.requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("auth.reset.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.reset.subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>{t("auth.reset.newPassword")} <span className="text-error-500">*</span></Label>
              <Input
                type="password"
                placeholder={t("auth.reset.newPasswordPlaceholder")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>{t("auth.reset.confirmPassword")} <span className="text-error-500">*</span></Label>
              <Input
                type="password"
                placeholder={t("auth.reset.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-error-500">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}
            <div>
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? t("auth.reset.loading") : t("auth.reset.submit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
