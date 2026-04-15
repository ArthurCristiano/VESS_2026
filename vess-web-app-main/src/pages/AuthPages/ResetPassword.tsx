import ResetPasswordForm from "../../components/form/ResetPasswordForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ResetPassword() {
  return (
    <>
      <PageMeta title="Redefinir senha | VESS" description="Redefina sua senha de acesso ao VESS." />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
