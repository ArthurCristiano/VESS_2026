import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from '../components/common/PageMeta';
import { useAuth } from "../context/AuthContext";

export default function UserProfiles() {
  const { user, loading } = useAuth();

  return (
    <>
      <PageMeta
        title="Perfil do Usuário | Sua Aplicação"
        description="Página de perfil do usuário"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Seu Perfil
        </h3>
        <div className="space-y-6">
          {loading ? (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
              Carregando dados do usuário autenticado...
            </div>
          ) : user ? (
            <UserInfoCard />
          ) : (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
              Usuário autenticado não encontrado.
            </div>
          )}
        </div>
      </div>
    </>
  );
}