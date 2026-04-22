import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ConfirmEmailForm from "../../components/form/ConfirmEmailForm";

export default function ConfirmEmail() {
  return (
    <>
      <PageMeta
        title="Confirmar e-mail | VESS"
        description="Validação de e-mail para ativação de conta no VESS."
      />
      <AuthLayout>
        <ConfirmEmailForm />
      </AuthLayout>
    </>
  );
}

