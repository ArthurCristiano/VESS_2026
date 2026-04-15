import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Label from "./Label";
import Input from "./input/InputField";
import Button from "../ui/button/Button";
import { resetPassword, validateResetToken } from "../../services/AuthService";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    try {
      await resetPassword(token, newPassword);
      setMessage("Senha redefinida com sucesso. Você já pode fazer login.");
      setTimeout(() => navigate("/login", { state: { message: "Senha redefinida com sucesso!" } }), 2000);
    } catch (err) {
      setError("Não foi possível redefinir a senha. O link pode estar expirado ou inválido.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return <div className="p-8 text-center">Validando link...</div>;
  }

  if (!tokenValid) {
    return (
      <div className="p-8 text-center">
        <p className="text-error-500 mb-4">Link inválido ou expirado.</p>
        <Link to="/recuperar-senha" className="text-brand-500 hover:text-brand-600">Solicitar novo link</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Redefinir senha
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Insira sua nova senha abaixo.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Nova senha <span className="text-error-500">*</span></Label>
              <Input
                type="password"
                placeholder="Digite a nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Confirmar nova senha <span className="text-error-500">*</span></Label>
              <Input
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-error-500">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}
            <div>
              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
