import ForgotPasswordForm from "../../components/form/ForgotPasswordForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ForgotPassword() {
  return (
    <>
      <PageMeta title="Recuperar senha | VESS" description="Recupere o acesso à sua conta VESS." />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
