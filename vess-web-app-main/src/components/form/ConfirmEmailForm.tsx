import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../ui/button/Button";
import { verifyConfirmEmailToken } from "../../services/AuthService";
import { getBackendErrorMessage } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

export default function ConfirmEmailForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(t("auth.confirm.initialMessage"));
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setSuccess(false);
        setMessage(t("auth.confirm.missingToken"));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await verifyConfirmEmailToken(token);
        setSuccess(Boolean(response.success));
        setMessage(response.message || t("auth.confirm.pendingApproval"));
        setEmail(response.email ?? null);
      } catch (error: unknown) {
        setSuccess(false);
        setMessage(getBackendErrorMessage(error) || t("auth.confirm.genericError"));
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token, t]);

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("auth.confirm.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading
                ? t("auth.confirm.validating")
                : success
                  ? t("auth.confirm.success")
                  : t("auth.confirm.error")}
            </p>
          </div>

          {!loading && success && (
            <>
              <p className="text-sm text-green-600 dark:text-green-400">{t("auth.confirm.success")}</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
              {email && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t("auth.confirm.confirmedAccount")}{" "}
                  <span className="font-medium">{email}</span>
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {t("auth.confirm.loginHint")}
              </p>
            </>
          )}

          {!loading && !success && (
            <p className="text-sm text-error-500">{message}</p>
          )}

          <div className="mt-6">
            <Button type="button" className="w-full" size="sm" onClick={() => navigate("/login")}>
              {t("auth.confirm.goToLogin")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
