import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../ui/button/Button";
import { verifyConfirmEmailToken } from "../../services/AuthService";
import { getBackendErrorMessage } from "../../services/api";

export default function ConfirmEmailForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Validando confirmação de e-mail...");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setSuccess(false);
        setMessage("Token de confirmação não informado.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await verifyConfirmEmailToken(token);
        setSuccess(Boolean(response.success));
        setMessage(response.message || "Confirmação concluída.");
        setEmail(response.email ?? null);
      } catch (error: unknown) {
        setSuccess(false);
        setMessage(
          getBackendErrorMessage(error) ||
            "Não foi possível confirmar o e-mail. O token pode estar inválido ou expirado."
        );
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Confirmar e-mail
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading
                ? "Validando seu token de confirmação..."
                : success
                  ? "Seu e-mail foi confirmado com sucesso."
                  : "Não foi possível confirmar seu e-mail."}
            </p>
          </div>

          {!loading && (
            <>
              <p className={`text-sm ${success ? "text-green-600" : "text-error-500"}`}>{message}</p>
              {success && email && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Conta confirmada: <span className="font-medium">{email}</span>
                </p>
              )}
            </>
          )}

          <div className="mt-6">
            <Button type="button" className="w-full" size="sm" onClick={() => navigate("/login")}>
              Ir para login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

