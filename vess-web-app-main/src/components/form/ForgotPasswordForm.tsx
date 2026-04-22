import { useState } from "react";
import { Link } from "react-router-dom";
import Label from "./Label";
import Input from "./input/InputField";
import Button from "../ui/button/Button";
import { forgotPassword } from "../../services/AuthService";

export default function ForgotPasswordForm() {
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
      setMessage(
        "Se o e-mail informado estiver cadastrado, você receberá as instruções em breve."
      );
    } catch (err) {
      setError(
        "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde."
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
              Recuperar senha
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Informe seu e-mail cadastrado para receber o link de redefinição.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>
                E-mail <span className="text-error-500">*</span>{" "}
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
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
          <div className="mt-5">
            <Link to="/login" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
