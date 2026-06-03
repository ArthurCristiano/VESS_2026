import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "pt-BR" | "en" | "es";

type TranslationKey =
  | "common.language"
  | "common.portuguese"
  | "common.english"
  | "common.spanish"
  | "common.loading"
  | "common.email"
  | "common.password"
  | "common.name"
  | "common.country"
  | "common.state"
  | "common.city"
  | "common.institution"
  | "common.view"
  | "common.edit"
  | "common.cancel"
  | "common.saveChanges"
  | "common.saving"
  | "common.refresh"
  | "common.closeModal"
  | "common.yes"
  | "common.no"
  | "common.notInformed"
  | "common.noName"
  | "common.creationDate"
  | "nav.menu"
  | "nav.map"
  | "nav.locationReport"
  | "nav.peopleReport"
  | "nav.userReport"
  | "nav.adminUsers"
  | "nav.regions"
  | "regions.title"
  | "regions.create"
  | "regions.loading"
  | "regions.loadError"
  | "regions.type"
  | "regions.description"
  | "regions.nameRequired"
  | "regions.namePlaceholder"
  | "regions.typeRequired"
  | "regions.descriptionPlaceholder"
  | "regions.areaAndColor"
  | "regions.pointsCount"
  | "regions.removeLastPoint"
  | "regions.resetPoints"
  | "regions.maxPointsReached"
  | "regions.pointsValidation"
  | "regions.nameValidation"
  | "regions.descriptionValidation"
  | "regions.colorValidation"
  | "regions.createSuccess"
  | "regions.createError"
  | "regions.type.city"
  | "regions.type.state"
  | "regions.type.stateRegion"
  | "regions.type.projectArea"
  | "regions.type.other"
  | "user.signIn"
  | "user.profile"
  | "user.signOut"
  | "auth.login.title"
  | "auth.login.subtitle"
  | "auth.login.passwordPlaceholder"
  | "auth.login.keepConnected"
  | "auth.login.forgotPassword"
  | "auth.login.loading"
  | "auth.login.noAccount"
  | "auth.login.register"
  | "auth.login.error"
  | "auth.register.title"
  | "auth.register.subtitle"
  | "auth.register.backToLogin"
  | "auth.register.namePlaceholder"
  | "auth.register.emailPlaceholder"
  | "auth.register.institutionPlaceholder"
  | "auth.register.countryPlaceholder"
  | "auth.register.statePlaceholder"
  | "auth.register.cityPlaceholder"
  | "auth.register.passwordPlaceholder"
  | "auth.register.passwordHint"
  | "auth.register.termsPrefix"
  | "auth.register.terms"
  | "auth.register.termsMiddle"
  | "auth.register.privacy"
  | "auth.register.acceptTermsError"
  | "auth.register.requiredError"
  | "auth.register.validationError"
  | "auth.register.genericError"
  | "auth.register.emailConfirmation"
  | "auth.register.loading"
  | "auth.register.submit"
  | "auth.register.hasAccount"
  | "auth.forgot.title"
  | "auth.forgot.subtitle"
  | "auth.forgot.success"
  | "auth.forgot.error"
  | "auth.forgot.loading"
  | "auth.forgot.submit"
  | "auth.forgot.backToLogin"
  | "auth.reset.title"
  | "auth.reset.subtitle"
  | "auth.reset.newPassword"
  | "auth.reset.confirmPassword"
  | "auth.reset.newPasswordPlaceholder"
  | "auth.reset.confirmPasswordPlaceholder"
  | "auth.reset.passwordMismatch"
  | "auth.reset.success"
  | "auth.reset.successShort"
  | "auth.reset.error"
  | "auth.reset.validating"
  | "auth.reset.invalidLink"
  | "auth.reset.requestNewLink"
  | "auth.reset.loading"
  | "auth.reset.submit"
  | "auth.confirm.title"
  | "auth.confirm.validating"
  | "auth.confirm.success"
  | "auth.confirm.error"
  | "auth.confirm.initialMessage"
  | "auth.confirm.missingToken"
  | "auth.confirm.completed"
  | "auth.confirm.genericError"
  | "auth.confirm.confirmedAccount"
  | "auth.confirm.goToLogin"
  | "page.notFound"
  | "page.profile.title"
  | "page.profile.metaTitle"
  | "page.profile.metaDescription"
  | "page.profile.loading"
  | "page.profile.notFound"
  | "profile.infoTitle"
  | "profile.username"
  | "profile.user"
  | "profile.editTitle"
  | "profile.editSubtitle"
  | "profile.newPassword"
  | "profile.newPasswordPlaceholder"
  | "profile.reloginMessage"
  | "profile.saveError"
  | "profile.endpointError"
  | "profile.permissionError"
  | "profile.loading"
  | "profile.notFound"
  | "map.title"
  | "map.loading"
  | "map.unnamedEvaluation"
  | "map.viewDetails"
  | "map.regionFilter"
  | "map.allRegions"
  | "map.visibleEvaluations"
  | "map.noEvaluations"
  | "map.loadError"
  | "map.score"
  | "map.sample"
  | "map.location"
  | "map.region"
  | "reports.evaluationsTitle"
  | "reports.evaluationName"
  | "reports.evaluator"
  | "reports.totalSamples"
  | "reports.averageScore"
  | "reports.loadingEvaluations"
  | "reports.noEvaluations"
  | "reports.viewEvaluation"
  | "reports.usersTitle"
  | "reports.usersSubtitle"
  | "reports.user"
  | "reports.location"
  | "reports.admin"
  | "reports.loadingUsers"
  | "reports.noUsers"
  | "reports.usersError"
  | "reports.viewUserDetails"
  | "reports.userDetails"
  | "reports.userDetailsFor"
  | "reports.configTitle"
  | "reports.configSubtitle"
  | "reports.cityState"
  | "reports.loadingConfigs"
  | "reports.noConfigs"
  | "reports.configError"
  | "reports.viewDetails"
  | "reports.details"
  | "reports.detailsFor"
  | "adminUsers.title"
  | "adminUsers.subtitle"
  | "adminUsers.profile"
  | "adminUsers.status"
  | "adminUsers.actions"
  | "adminUsers.currentProfile"
  | "adminUsers.manage"
  | "adminUsers.inactivate"
  | "adminUsers.inactivateUser"
  | "adminUsers.viewEditTitle"
  | "adminUsers.cannotInactivateSelf"
  | "adminUsers.inactivateTitle"
  | "adminUsers.alreadyInactive"
  | "adminUsers.confirmInactivate"
  | "adminUsers.loadUserError"
  | "adminUsers.updateSuccess"
  | "adminUsers.updateError"
  | "adminUsers.inactivateSuccess"
  | "adminUsers.inactivateError"
  | "role.admin"
  | "role.researcher"
  | "role.visitor"
  | "status.active"
  | "status.inactive"
  | "status.pendingEmail"
  | "forbidden.title"
  | "forbidden.message"
  | "forbidden.currentProfile"
  | "forbidden.back"
  | "forbidden.home"
  | "modal.evaluationDetails"
  | "modal.loadingInfo"
  | "modal.evaluator"
  | "modal.averageScore"
  | "modal.evaluationInfo"
  | "modal.summary"
  | "modal.localManagement"
  | "modal.status"
  | "modal.collectedSamples"
  | "modal.sampleSingular"
  | "modal.samplePlural"
  | "modal.layerSingular"
  | "modal.layerPlural"
  | "modal.order"
  | "modal.management"
  | "modal.loadError";

type LanguageContextValue = {
    language: Language;
    locale: string;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const STORAGE_KEY = "vess-language";

const translations: Record<Language, Record<TranslationKey, string>> = {
  "pt-BR": {
    "common.language": "Idioma",
    "common.portuguese": "Português",
    "common.english": "Inglês",
    "common.spanish": "Espanhol",
    "common.loading": "Carregando...",
    "common.email": "E-mail",
    "common.password": "Senha",
    "common.name": "Nome",
    "common.country": "País",
    "common.state": "Estado",
    "common.city": "Cidade",
    "common.institution": "Instituição/Empresa",
    "common.view": "Visualizar",
    "common.edit": "Editar",
    "common.cancel": "Cancelar",
    "common.saveChanges": "Salvar Alterações",
    "common.saving": "Salvando...",
    "common.refresh": "Atualizar",
    "common.closeModal": "Fechar modal",
    "common.yes": "Sim",
    "common.no": "Não",
    "common.notInformed": "Não informado",
    "common.noName": "Sem nome",
    "common.creationDate": "Data de Criação",
    "nav.menu": "Menu",
    "nav.map": "Mapa das Avaliações",
    "nav.locationReport": "Lista de avaliações",
    "nav.peopleReport": "Relatório de Pessoas",
    "nav.userReport": "Relatório de Usuários",
    "nav.adminUsers": "Cadastro de usuários",
    "nav.regions": "Cadastro de Regiões",
    "regions.title": "Regiões Cadastradas",
    "regions.create": "Cadastrar Região",
    "regions.loading": "Carregando regiões...",
    "regions.loadError": "Falha ao carregar as regiões.",
    "regions.type": "Tipo",
    "regions.description": "Descrição",
    "regions.nameRequired": "Nome *",
    "regions.namePlaceholder": "Ex.: Sudoeste do Paraná",
    "regions.typeRequired": "Tipo *",
    "regions.descriptionPlaceholder": "Descrição opcional da região",
    "regions.areaAndColor": "Área da Região e Cor (clique no mapa para adicionar pontos)",
    "regions.pointsCount": "{count}/{max} pontos",
    "regions.removeLastPoint": "Remover Último Ponto",
    "regions.resetPoints": "Resetar Pontos",
    "regions.maxPointsReached": "Máximo de {max} pontos atingido.",
    "regions.pointsValidation": "A região deve ter entre 3 e {max} pontos.",
    "regions.nameValidation": "O nome deve ter entre 2 e 100 caracteres.",
    "regions.descriptionValidation": "A descrição deve ter no máximo 500 caracteres.",
    "regions.colorValidation": "A cor deve estar no formato #RRGGBB.",
    "regions.createSuccess": "Região cadastrada com sucesso.",
    "regions.createError": "Não foi possível cadastrar a região.",
    "regions.type.city": "Cidade",
    "regions.type.state": "Estado",
    "regions.type.stateRegion": "Região de Estado",
    "regions.type.projectArea": "Área de Projeto",
    "regions.type.other": "Outro",
    "user.signIn": "Entrar",
    "user.profile": "Perfil",
    "user.signOut": "Sair",
    "auth.login.title": "Entrar",
    "auth.login.subtitle": "Digite seu e-mail e senha para entrar!",
    "auth.login.passwordPlaceholder": "Digite sua senha",
    "auth.login.keepConnected": "Manter-me conectado",
    "auth.login.forgotPassword": "Esqueci minha senha",
    "auth.login.loading": "Entrando...",
    "auth.login.noAccount": "Não tem uma conta?",
    "auth.login.register": "Cadastre-se",
    "auth.login.error": "Não foi possível entrar. Verifique sua conexão e tente novamente.",
    "auth.register.title": "Cadastre-se",
    "auth.register.subtitle": "Digite suas informações para se cadastrar!",
    "auth.register.backToLogin": "Voltar para o login",
    "auth.register.namePlaceholder": "Digite seu nome",
    "auth.register.emailPlaceholder": "Digite seu e-mail",
    "auth.register.institutionPlaceholder": "Sua instituição ou empresa",
    "auth.register.countryPlaceholder": "Seu país",
    "auth.register.statePlaceholder": "Seu estado",
    "auth.register.cityPlaceholder": "Sua cidade",
    "auth.register.passwordPlaceholder": "Digite sua senha",
    "auth.register.passwordHint": "Mínimo 6 caracteres, com maiúscula, minúscula e número.",
    "auth.register.termsPrefix": "Ao criar uma conta, você concorda com os",
    "auth.register.terms": "Termos e Condições",
    "auth.register.termsMiddle": "e com a nossa",
    "auth.register.privacy": "Política de Privacidade",
    "auth.register.acceptTermsError": "Você deve concordar com os Termos e Condições e Política de Privacidade.",
    "auth.register.requiredError": "Todos os campos marcados com * são obrigatórios.",
    "auth.register.validationError": "Erro de validação",
    "auth.register.genericError": "Ocorreu um erro inesperado durante o cadastro. Tente novamente.",
    "auth.register.emailConfirmation": "Verifique a caixa de entrada do seu e-mail e acesse o link para confirmar o seu cadastro.",
    "auth.register.loading": "Cadastrando...",
    "auth.register.submit": "Cadastrar",
    "auth.register.hasAccount": "Já tem uma conta?",
    "auth.forgot.title": "Recuperar senha",
    "auth.forgot.subtitle": "Informe seu e-mail cadastrado para receber o link de redefinição.",
    "auth.forgot.success": "Se o e-mail informado estiver cadastrado, você receberá as instruções em breve.",
    "auth.forgot.error": "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde.",
    "auth.forgot.loading": "Enviando...",
    "auth.forgot.submit": "Enviar",
    "auth.forgot.backToLogin": "Voltar para login",
    "auth.reset.title": "Redefinir senha",
    "auth.reset.subtitle": "Insira sua nova senha abaixo.",
    "auth.reset.newPassword": "Nova senha",
    "auth.reset.confirmPassword": "Confirmar nova senha",
    "auth.reset.newPasswordPlaceholder": "Digite a nova senha",
    "auth.reset.confirmPasswordPlaceholder": "Confirme a nova senha",
    "auth.reset.passwordMismatch": "As senhas não coincidem.",
    "auth.reset.success": "Senha redefinida com sucesso. Você já pode fazer login.",
    "auth.reset.successShort": "Senha redefinida com sucesso!",
    "auth.reset.error": "Não foi possível redefinir a senha. O link pode estar expirado ou inválido.",
    "auth.reset.validating": "Validando link...",
    "auth.reset.invalidLink": "Link inválido ou expirado.",
    "auth.reset.requestNewLink": "Solicitar novo link",
    "auth.reset.loading": "Redefinindo...",
    "auth.reset.submit": "Redefinir senha",
    "auth.confirm.title": "Confirmar e-mail",
    "auth.confirm.validating": "Validando seu token de confirmação...",
    "auth.confirm.success": "Seu e-mail foi confirmado com sucesso.",
    "auth.confirm.error": "Não foi possível confirmar seu e-mail.",
    "auth.confirm.initialMessage": "Validando confirmação de e-mail...",
    "auth.confirm.missingToken": "Token de confirmação não informado.",
    "auth.confirm.completed": "Confirmação concluída.",
    "auth.confirm.genericError": "Não foi possível confirmar o e-mail. O token pode estar inválido ou expirado.",
    "auth.confirm.confirmedAccount": "Conta confirmada:",
    "auth.confirm.goToLogin": "Ir para login",
    "page.notFound": "Página não encontrada (404)",
    "page.profile.title": "Seu Perfil",
    "page.profile.metaTitle": "Perfil do Usuário | Sua Aplicação",
    "page.profile.metaDescription": "Página de perfil do usuário",
    "page.profile.loading": "Carregando dados do usuário autenticado...",
    "page.profile.notFound": "Usuário autenticado não encontrado.",
    "profile.infoTitle": "Informações do Usuário",
    "profile.username": "Nome de Usuário",
    "profile.user": "Usuário",
    "profile.editTitle": "Editar Usuário",
    "profile.editSubtitle": "Atualize seus dados. Deixe a senha em branco para não alterá-la.",
    "profile.newPassword": "Nova Senha (opcional)",
    "profile.newPasswordPlaceholder": "Deixe em branco para manter a atual",
    "profile.reloginMessage": "Dados de acesso atualizados. Faça login novamente para continuar.",
    "profile.saveError": "Não foi possível salvar as alterações. Tente novamente.",
    "profile.endpointError": "Endpoint de atualização não encontrado no servidor.",
    "profile.permissionError": "Você não tem permissão para realizar esta ação.",
    "profile.loading": "Carregando informações do usuário...",
    "profile.notFound": "Usuário não encontrado ou não logado.",
    "map.title": "Mapa das Avaliações",
    "map.loading": "Carregando mapa...",
    "map.unnamedEvaluation": "Avaliação sem nome",
    "map.viewDetails": "Ver Detalhes",
    "map.regionFilter": "Filtrar por região",
    "map.allRegions": "Todas as regiões",
    "map.visibleEvaluations": "avaliações ativas no mapa",
    "map.noEvaluations": "Nenhuma avaliação ativa encontrada para o filtro selecionado.",
    "map.loadError": "Não foi possível carregar as informações do mapa.",
    "map.score": "Score VESS",
    "map.sample": "Amostra",
    "map.location": "Localização",
    "map.region": "Região",
    "reports.evaluationsTitle": "Relatório de Avaliações",
    "reports.evaluationName": "Nome da Avaliação",
    "reports.evaluator": "Avaliador",
    "reports.totalSamples": "Total de Amostras",
    "reports.averageScore": "Escore Médio Geral",
    "reports.loadingEvaluations": "Carregando avaliações...",
    "reports.noEvaluations": "Nenhuma avaliação encontrada.",
    "reports.viewEvaluation": "Visualizar avaliação",
    "reports.usersTitle": "Relatório de Usuários",
    "reports.usersSubtitle": "Visualize os usuários cadastrados no sistema.",
    "reports.user": "Usuário",
    "reports.location": "Localização",
    "reports.admin": "Admin",
    "reports.loadingUsers": "Carregando usuários...",
    "reports.noUsers": "Nenhum usuário encontrado.",
    "reports.usersError": "Falha ao buscar os usuários do servidor.",
    "reports.viewUserDetails": "Visualizar detalhes do usuário",
    "reports.userDetails": "Detalhes do Usuário",
    "reports.userDetailsFor": "Detalhes de: {name}",
    "reports.configTitle": "Relatório de Configurações",
    "reports.configSubtitle": "Visualize as configurações cadastradas no sistema.",
    "reports.cityState": "Cidade / Estado",
    "reports.loadingConfigs": "Carregando configurações...",
    "reports.noConfigs": "Nenhuma configuração encontrada.",
    "reports.configError": "Falha ao buscar as configurações do servidor.",
    "reports.viewDetails": "Visualizar detalhes",
    "reports.details": "Detalhes",
    "reports.detailsFor": "Detalhes de: {name}",
    "adminUsers.title": "Cadastro de usuários",
    "adminUsers.subtitle": "Visualize e gerencie os usuários cadastrados no sistema.",
    "adminUsers.profile": "Perfil",
    "adminUsers.status": "Status",
    "adminUsers.actions": "Ações",
    "adminUsers.currentProfile": "Perfil atual",
    "adminUsers.manage": "Gerenciar",
    "adminUsers.inactivate": "Inativar",
    "adminUsers.inactivateUser": "Inativar usuário",
    "adminUsers.viewEditTitle": "Visualizar e editar usuário",
    "adminUsers.cannotInactivateSelf": "Você não pode inativar o próprio usuário logado.",
    "adminUsers.inactivateTitle": "Você não pode inativar o próprio usuário",
    "adminUsers.alreadyInactive": "Este usuário já está inativo.",
    "adminUsers.confirmInactivate": "Inativar o usuário {name}? Ele não poderá mais acessar o sistema.",
    "adminUsers.loadUserError": "Falha ao carregar os dados do usuário.",
    "adminUsers.updateSuccess": "Usuário atualizado com sucesso.",
    "adminUsers.updateError": "Falha ao atualizar o usuário.",
    "adminUsers.inactivateSuccess": "Usuário inativado com sucesso.",
    "adminUsers.inactivateError": "Falha ao inativar o usuário.",
    "role.admin": "Administrador",
    "role.researcher": "Pesquisador",
    "role.visitor": "Visitante",
    "status.active": "Ativo",
    "status.inactive": "Inativo",
    "status.pendingEmail": "Pendente e-mail",
    "forbidden.title": "Acesso negado",
    "forbidden.message": "Você não tem permissão para acessar esta página.",
    "forbidden.currentProfile": "Perfil atual:",
    "forbidden.back": "Voltar",
    "forbidden.home": "Ir para o início",
    "modal.evaluationDetails": "Detalhes da Avaliação",
    "modal.loadingInfo": "Carregando informações...",
    "modal.evaluator": "Avaliador",
    "modal.averageScore": "Escore Médio Geral",
    "modal.evaluationInfo": "Informações da Avaliação",
    "modal.summary": "Resumo",
    "modal.localManagement": "Manejo Local",
    "modal.status": "Status",
    "modal.collectedSamples": "Amostras Coletadas",
    "modal.sampleSingular": "amostra",
    "modal.samplePlural": "amostras",
    "modal.layerSingular": "camada",
    "modal.layerPlural": "camadas",
    "modal.order": "Ordem: {order}",
    "modal.management": "Manejo",
    "modal.loadError": "Não foi possível carregar os dados.",
  },
  en: {
    "common.language": "Language",
    "common.portuguese": "Portuguese",
    "common.english": "English",
    "common.spanish": "Spanish",
    "common.loading": "Loading...",
    "common.email": "Email",
    "common.password": "Password",
    "common.name": "Name",
    "common.country": "Country",
    "common.state": "State",
    "common.city": "City",
    "common.institution": "Institution/Company",
    "common.view": "View",
    "common.edit": "Edit",
    "common.cancel": "Cancel",
    "common.saveChanges": "Save Changes",
    "common.saving": "Saving...",
    "common.refresh": "Refresh",
    "common.closeModal": "Close modal",
    "common.yes": "Yes",
    "common.no": "No",
    "common.notInformed": "Not informed",
    "common.noName": "No name",
    "common.creationDate": "Creation Date",
    "nav.menu": "Menu",
    "nav.map": "Evaluation Map",
    "nav.locationReport": "Evaluation List",
    "nav.peopleReport": "People Report",
    "nav.userReport": "User Report",
    "nav.adminUsers": "User Management",
    "nav.regions": "Regions",
    "regions.title": "Registered Regions",
    "regions.create": "Register Region",
    "regions.loading": "Loading regions...",
    "regions.loadError": "Failed to load regions.",
    "regions.type": "Type",
    "regions.description": "Description",
    "regions.nameRequired": "Name *",
    "regions.namePlaceholder": "E.g.: Southwest of Parana",
    "regions.typeRequired": "Type *",
    "regions.descriptionPlaceholder": "Optional region description",
    "regions.areaAndColor": "Region Area and Color (click the map to add points)",
    "regions.pointsCount": "{count}/{max} points",
    "regions.removeLastPoint": "Remove Last Point",
    "regions.resetPoints": "Reset Points",
    "regions.maxPointsReached": "Maximum of {max} points reached.",
    "regions.pointsValidation": "The region must have between 3 and {max} points.",
    "regions.nameValidation": "The name must be between 2 and 100 characters.",
    "regions.descriptionValidation": "The description must be at most 500 characters.",
    "regions.colorValidation": "The color must be in #RRGGBB format.",
    "regions.createSuccess": "Region registered successfully.",
    "regions.createError": "Unable to register the region.",
    "regions.type.city": "City",
    "regions.type.state": "State",
    "regions.type.stateRegion": "State Region",
    "regions.type.projectArea": "Project Area",
    "regions.type.other": "Other",
    "user.signIn": "Sign in",
    "user.profile": "Profile",
    "user.signOut": "Sign out",
    "auth.login.title": "Sign in",
    "auth.login.subtitle": "Enter your email and password to sign in.",
    "auth.login.passwordPlaceholder": "Enter your password",
    "auth.login.keepConnected": "Keep me signed in",
    "auth.login.forgotPassword": "Forgot password",
    "auth.login.loading": "Signing in...",
    "auth.login.noAccount": "Don't have an account?",
    "auth.login.register": "Sign up",
    "auth.login.error": "Unable to sign in. Check your connection and try again.",
    "auth.register.title": "Sign up",
    "auth.register.subtitle": "Enter your information to create an account.",
    "auth.register.backToLogin": "Back to login",
    "auth.register.namePlaceholder": "Enter your name",
    "auth.register.emailPlaceholder": "Enter your email",
    "auth.register.institutionPlaceholder": "Your institution or company",
    "auth.register.countryPlaceholder": "Your country",
    "auth.register.statePlaceholder": "Your state",
    "auth.register.cityPlaceholder": "Your city",
    "auth.register.passwordPlaceholder": "Enter your password",
    "auth.register.passwordHint": "Minimum 6 characters, with uppercase, lowercase and a number.",
    "auth.register.termsPrefix": "By creating an account, you agree to the",
    "auth.register.terms": "Terms and Conditions",
    "auth.register.termsMiddle": "and our",
    "auth.register.privacy": "Privacy Policy",
    "auth.register.acceptTermsError": "You must agree to the Terms and Conditions and Privacy Policy.",
    "auth.register.requiredError": "All fields marked with * are required.",
    "auth.register.validationError": "Validation error",
    "auth.register.genericError": "An unexpected error occurred during registration. Try again.",
    "auth.register.emailConfirmation": "Check your email inbox and open the link to confirm your registration.",
    "auth.register.loading": "Registering...",
    "auth.register.submit": "Register",
    "auth.register.hasAccount": "Already have an account?",
    "auth.forgot.title": "Recover password",
    "auth.forgot.subtitle": "Enter your registered email to receive the reset link.",
    "auth.forgot.success": "If the email is registered, you will receive instructions shortly.",
    "auth.forgot.error": "Unable to send the recovery email. Try again later.",
    "auth.forgot.loading": "Sending...",
    "auth.forgot.submit": "Send",
    "auth.forgot.backToLogin": "Back to login",
    "auth.reset.title": "Reset password",
    "auth.reset.subtitle": "Enter your new password below.",
    "auth.reset.newPassword": "New password",
    "auth.reset.confirmPassword": "Confirm new password",
    "auth.reset.newPasswordPlaceholder": "Enter the new password",
    "auth.reset.confirmPasswordPlaceholder": "Confirm the new password",
    "auth.reset.passwordMismatch": "Passwords do not match.",
    "auth.reset.success": "Password reset successfully. You can now sign in.",
    "auth.reset.successShort": "Password reset successfully!",
    "auth.reset.error": "Unable to reset the password. The link may be expired or invalid.",
    "auth.reset.validating": "Validating link...",
    "auth.reset.invalidLink": "Invalid or expired link.",
    "auth.reset.requestNewLink": "Request a new link",
    "auth.reset.loading": "Resetting...",
    "auth.reset.submit": "Reset password",
    "auth.confirm.title": "Confirm email",
    "auth.confirm.validating": "Validating your confirmation token...",
    "auth.confirm.success": "Your email was confirmed successfully.",
    "auth.confirm.error": "Unable to confirm your email.",
    "auth.confirm.initialMessage": "Validating email confirmation...",
    "auth.confirm.missingToken": "Confirmation token was not provided.",
    "auth.confirm.completed": "Confirmation completed.",
    "auth.confirm.genericError": "Unable to confirm the email. The token may be invalid or expired.",
    "auth.confirm.confirmedAccount": "Confirmed account:",
    "auth.confirm.goToLogin": "Go to login",
    "page.notFound": "Page not found (404)",
    "page.profile.title": "Your Profile",
    "page.profile.metaTitle": "User Profile | Your Application",
    "page.profile.metaDescription": "User profile page",
    "page.profile.loading": "Loading authenticated user data...",
    "page.profile.notFound": "Authenticated user not found.",
    "profile.infoTitle": "User Information",
    "profile.username": "Username",
    "profile.user": "User",
    "profile.editTitle": "Edit User",
    "profile.editSubtitle": "Update your data. Leave the password blank to keep it unchanged.",
    "profile.newPassword": "New Password (optional)",
    "profile.newPasswordPlaceholder": "Leave blank to keep the current password",
    "profile.reloginMessage": "Access data updated. Sign in again to continue.",
    "profile.saveError": "Unable to save changes. Try again.",
    "profile.endpointError": "Update endpoint not found on the server.",
    "profile.permissionError": "You do not have permission to perform this action.",
    "profile.loading": "Loading user information...",
    "profile.notFound": "User not found or not logged in.",
    "map.title": "Evaluation Map",
    "map.loading": "Loading map...",
    "map.unnamedEvaluation": "Unnamed evaluation",
    "map.viewDetails": "View Details",
    "map.regionFilter": "Filter by region",
    "map.allRegions": "All regions",
    "map.visibleEvaluations": "active evaluations on the map",
    "map.noEvaluations": "No active evaluations found for the selected filter.",
    "map.loadError": "Unable to load the map information.",
    "map.score": "VESS score",
    "map.sample": "Sample",
    "map.location": "Location",
    "map.region": "Region",
    "reports.evaluationsTitle": "Evaluation Report",
    "reports.evaluationName": "Evaluation Name",
    "reports.evaluator": "Evaluator",
    "reports.totalSamples": "Total Samples",
    "reports.averageScore": "Overall Average Score",
    "reports.loadingEvaluations": "Loading evaluations...",
    "reports.noEvaluations": "No evaluations found.",
    "reports.viewEvaluation": "View evaluation",
    "reports.usersTitle": "User Report",
    "reports.usersSubtitle": "View users registered in the system.",
    "reports.user": "User",
    "reports.location": "Location",
    "reports.admin": "Admin",
    "reports.loadingUsers": "Loading users...",
    "reports.noUsers": "No users found.",
    "reports.usersError": "Failed to fetch users from the server.",
    "reports.viewUserDetails": "View user details",
    "reports.userDetails": "User Details",
    "reports.userDetailsFor": "Details for: {name}",
    "reports.configTitle": "Configuration Report",
    "reports.configSubtitle": "View configurations registered in the system.",
    "reports.cityState": "City / State",
    "reports.loadingConfigs": "Loading configurations...",
    "reports.noConfigs": "No configurations found.",
    "reports.configError": "Failed to fetch configurations from the server.",
    "reports.viewDetails": "View details",
    "reports.details": "Details",
    "reports.detailsFor": "Details for: {name}",
    "adminUsers.title": "User Management",
    "adminUsers.subtitle": "View and manage users registered in the system.",
    "adminUsers.profile": "Profile",
    "adminUsers.status": "Status",
    "adminUsers.actions": "Actions",
    "adminUsers.currentProfile": "Current profile",
    "adminUsers.manage": "Manage",
    "adminUsers.inactivate": "Inactivate",
    "adminUsers.inactivateUser": "Inactivate user",
    "adminUsers.viewEditTitle": "View and edit user",
    "adminUsers.cannotInactivateSelf": "You cannot inactivate your own logged-in user.",
    "adminUsers.inactivateTitle": "You cannot inactivate your own user",
    "adminUsers.alreadyInactive": "This user is already inactive.",
    "adminUsers.confirmInactivate": "Inactivate user {name}? They will no longer be able to access the system.",
    "adminUsers.loadUserError": "Failed to load user data.",
    "adminUsers.updateSuccess": "User updated successfully.",
    "adminUsers.updateError": "Failed to update the user.",
    "adminUsers.inactivateSuccess": "User inactivated successfully.",
    "adminUsers.inactivateError": "Failed to inactivate the user.",
    "role.admin": "Administrator",
    "role.researcher": "Researcher",
    "role.visitor": "Visitor",
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.pendingEmail": "Email pending",
    "forbidden.title": "Access denied",
    "forbidden.message": "You do not have permission to access this page.",
    "forbidden.currentProfile": "Current profile:",
    "forbidden.back": "Back",
    "forbidden.home": "Go to home",
    "modal.evaluationDetails": "Evaluation Details",
    "modal.loadingInfo": "Loading information...",
    "modal.evaluator": "Evaluator",
    "modal.averageScore": "Overall Average Score",
    "modal.evaluationInfo": "Evaluation Information",
    "modal.summary": "Summary",
    "modal.localManagement": "Local Management",
    "modal.status": "Status",
    "modal.collectedSamples": "Collected Samples",
    "modal.sampleSingular": "sample",
    "modal.samplePlural": "samples",
    "modal.layerSingular": "layer",
    "modal.layerPlural": "layers",
    "modal.order": "Order: {order}",
    "modal.management": "Management",
    "modal.loadError": "Unable to load the data.",
  },
  es: {
    "common.language": "Idioma",
    "common.portuguese": "Portugués",
    "common.english": "Inglés",
    "common.spanish": "Español",
    "common.loading": "Cargando...",
    "common.email": "Correo electrónico",
    "common.password": "Contraseña",
    "common.name": "Nombre",
    "common.country": "País",
    "common.state": "Estado",
    "common.city": "Ciudad",
    "common.institution": "Institución/Empresa",
    "common.view": "Ver",
    "common.edit": "Editar",
    "common.cancel": "Cancelar",
    "common.saveChanges": "Guardar Cambios",
    "common.saving": "Guardando...",
    "common.refresh": "Actualizar",
    "common.closeModal": "Cerrar modal",
    "common.yes": "Sí",
    "common.no": "No",
    "common.notInformed": "No informado",
    "common.noName": "Sin nombre",
    "common.creationDate": "Fecha de Creación",
    "nav.menu": "Menú",
    "nav.map": "Mapa de Evaluaciones",
    "nav.locationReport": "Lista de evaluaciones",
    "nav.peopleReport": "Informe de Personas",
    "nav.userReport": "Informe de Usuarios",
    "nav.adminUsers": "Gestión de usuarios",
    "nav.regions": "Registro de Regiones",
    "regions.title": "Regiones Registradas",
    "regions.create": "Registrar Región",
    "regions.loading": "Cargando regiones...",
    "regions.loadError": "Error al cargar las regiones.",
    "regions.type": "Tipo",
    "regions.description": "Descripción",
    "regions.nameRequired": "Nombre *",
    "regions.namePlaceholder": "Ej.: Suroeste de Paraná",
    "regions.typeRequired": "Tipo *",
    "regions.descriptionPlaceholder": "Descripción opcional de la región",
    "regions.areaAndColor": "Área de la Región y Color (haz clic en el mapa para agregar puntos)",
    "regions.pointsCount": "{count}/{max} puntos",
    "regions.removeLastPoint": "Eliminar Último Punto",
    "regions.resetPoints": "Restablecer Puntos",
    "regions.maxPointsReached": "Máximo de {max} puntos alcanzado.",
    "regions.pointsValidation": "La región debe tener entre 3 y {max} puntos.",
    "regions.nameValidation": "El nombre debe tener entre 2 y 100 caracteres.",
    "regions.descriptionValidation": "La descripción debe tener como máximo 500 caracteres.",
    "regions.colorValidation": "El color debe estar en formato #RRGGBB.",
    "regions.createSuccess": "Región registrada con éxito.",
    "regions.createError": "No fue posible registrar la región.",
    "regions.type.city": "Ciudad",
    "regions.type.state": "Estado",
    "regions.type.stateRegion": "Región de Estado",
    "regions.type.projectArea": "Área de Proyecto",
    "regions.type.other": "Otro",
    "user.signIn": "Entrar",
    "user.profile": "Perfil",
    "user.signOut": "Salir",
    "auth.login.title": "Entrar",
    "auth.login.subtitle": "Ingresa tu correo y contraseña para entrar.",
    "auth.login.passwordPlaceholder": "Ingresa tu contraseña",
    "auth.login.keepConnected": "Mantenerme conectado",
    "auth.login.forgotPassword": "Olvidé mi contraseña",
    "auth.login.loading": "Entrando...",
    "auth.login.noAccount": "¿No tienes una cuenta?",
    "auth.login.register": "Regístrate",
    "auth.login.error": "No fue posible entrar. Verifica tu conexión e inténtalo de nuevo.",
    "auth.register.title": "Regístrate",
    "auth.register.subtitle": "Ingresa tu información para registrarte.",
    "auth.register.backToLogin": "Volver al login",
    "auth.register.namePlaceholder": "Ingresa tu nombre",
    "auth.register.emailPlaceholder": "Ingresa tu correo",
    "auth.register.institutionPlaceholder": "Tu institución o empresa",
    "auth.register.countryPlaceholder": "Tu país",
    "auth.register.statePlaceholder": "Tu estado",
    "auth.register.cityPlaceholder": "Tu ciudad",
    "auth.register.passwordPlaceholder": "Ingresa tu contraseña",
    "auth.register.passwordHint": "Mínimo 6 caracteres, con mayúscula, minúscula y un número.",
    "auth.register.termsPrefix": "Al crear una cuenta, aceptas los",
    "auth.register.terms": "Términos y Condiciones",
    "auth.register.termsMiddle": "y nuestra",
    "auth.register.privacy": "Política de Privacidad",
    "auth.register.acceptTermsError": "Debes aceptar los Términos y Condiciones y la Política de Privacidad.",
    "auth.register.requiredError": "Todos los campos marcados con * son obligatorios.",
    "auth.register.validationError": "Error de validación",
    "auth.register.genericError": "Ocurrió un error inesperado durante el registro. Inténtalo de nuevo.",
    "auth.register.emailConfirmation": "Revisa tu bandeja de entrada y abre el enlace para confirmar tu registro.",
    "auth.register.loading": "Registrando...",
    "auth.register.submit": "Registrar",
    "auth.register.hasAccount": "¿Ya tienes una cuenta?",
    "auth.forgot.title": "Recuperar contraseña",
    "auth.forgot.subtitle": "Ingresa tu correo registrado para recibir el enlace de restablecimiento.",
    "auth.forgot.success": "Si el correo está registrado, recibirás las instrucciones en breve.",
    "auth.forgot.error": "No fue posible enviar el correo de recuperación. Inténtalo más tarde.",
    "auth.forgot.loading": "Enviando...",
    "auth.forgot.submit": "Enviar",
    "auth.forgot.backToLogin": "Volver al login",
    "auth.reset.title": "Restablecer contraseña",
    "auth.reset.subtitle": "Ingresa tu nueva contraseña abajo.",
    "auth.reset.newPassword": "Nueva contraseña",
    "auth.reset.confirmPassword": "Confirmar nueva contraseña",
    "auth.reset.newPasswordPlaceholder": "Ingresa la nueva contraseña",
    "auth.reset.confirmPasswordPlaceholder": "Confirma la nueva contraseña",
    "auth.reset.passwordMismatch": "Las contraseñas no coinciden.",
    "auth.reset.success": "Contraseña restablecida con éxito. Ya puedes iniciar sesión.",
    "auth.reset.successShort": "¡Contraseña restablecida con éxito!",
    "auth.reset.error": "No fue posible restablecer la contraseña. El enlace puede estar vencido o ser inválido.",
    "auth.reset.validating": "Validando enlace...",
    "auth.reset.invalidLink": "Enlace inválido o vencido.",
    "auth.reset.requestNewLink": "Solicitar nuevo enlace",
    "auth.reset.loading": "Restableciendo...",
    "auth.reset.submit": "Restablecer contraseña",
    "auth.confirm.title": "Confirmar correo",
    "auth.confirm.validating": "Validando tu token de confirmación...",
    "auth.confirm.success": "Tu correo fue confirmado con éxito.",
    "auth.confirm.error": "No fue posible confirmar tu correo.",
    "auth.confirm.initialMessage": "Validando confirmación de correo...",
    "auth.confirm.missingToken": "Token de confirmación no informado.",
    "auth.confirm.completed": "Confirmación completada.",
    "auth.confirm.genericError": "No fue posible confirmar el correo. El token puede ser inválido o estar vencido.",
    "auth.confirm.confirmedAccount": "Cuenta confirmada:",
    "auth.confirm.goToLogin": "Ir al login",
    "page.notFound": "Página no encontrada (404)",
    "page.profile.title": "Tu Perfil",
    "page.profile.metaTitle": "Perfil de Usuario | Tu Aplicación",
    "page.profile.metaDescription": "Página de perfil de usuario",
    "page.profile.loading": "Cargando datos del usuario autenticado...",
    "page.profile.notFound": "Usuario autenticado no encontrado.",
    "profile.infoTitle": "Información del Usuario",
    "profile.username": "Nombre de Usuario",
    "profile.user": "Usuario",
    "profile.editTitle": "Editar Usuario",
    "profile.editSubtitle": "Actualiza tus datos. Deja la contraseña en blanco para no cambiarla.",
    "profile.newPassword": "Nueva Contraseña (opcional)",
    "profile.newPasswordPlaceholder": "Deja en blanco para mantener la actual",
    "profile.reloginMessage": "Datos de acceso actualizados. Inicia sesión nuevamente para continuar.",
    "profile.saveError": "No fue posible guardar los cambios. Inténtalo de nuevo.",
    "profile.endpointError": "Endpoint de actualización no encontrado en el servidor.",
    "profile.permissionError": "No tienes permiso para realizar esta acción.",
    "profile.loading": "Cargando información del usuario...",
    "profile.notFound": "Usuario no encontrado o no conectado.",
    "map.title": "Mapa de Evaluaciones",
    "map.loading": "Cargando mapa...",
    "map.unnamedEvaluation": "Evaluación sin nombre",
    "map.viewDetails": "Ver Detalles",
    "map.regionFilter": "Filtrar por región",
    "map.allRegions": "Todas las regiones",
    "map.visibleEvaluations": "evaluaciones activas en el mapa",
    "map.noEvaluations": "No se encontraron evaluaciones activas para el filtro seleccionado.",
    "map.loadError": "No fue posible cargar la información del mapa.",
    "map.score": "Puntaje VESS",
    "map.sample": "Muestra",
    "map.location": "Ubicación",
    "map.region": "Región",
    "reports.evaluationsTitle": "Informe de Evaluaciones",
    "reports.evaluationName": "Nombre de la Evaluación",
    "reports.evaluator": "Evaluador",
    "reports.totalSamples": "Total de Muestras",
    "reports.averageScore": "Puntaje Medio General",
    "reports.loadingEvaluations": "Cargando evaluaciones...",
    "reports.noEvaluations": "No se encontraron evaluaciones.",
    "reports.viewEvaluation": "Ver evaluación",
    "reports.usersTitle": "Informe de Usuarios",
    "reports.usersSubtitle": "Visualiza los usuarios registrados en el sistema.",
    "reports.user": "Usuario",
    "reports.location": "Ubicación",
    "reports.admin": "Admin",
    "reports.loadingUsers": "Cargando usuarios...",
    "reports.noUsers": "No se encontraron usuarios.",
    "reports.usersError": "Error al buscar los usuarios del servidor.",
    "reports.viewUserDetails": "Ver detalles del usuario",
    "reports.userDetails": "Detalles del Usuario",
    "reports.userDetailsFor": "Detalles de: {name}",
    "reports.configTitle": "Informe de Configuraciones",
    "reports.configSubtitle": "Visualiza las configuraciones registradas en el sistema.",
    "reports.cityState": "Ciudad / Estado",
    "reports.loadingConfigs": "Cargando configuraciones...",
    "reports.noConfigs": "No se encontraron configuraciones.",
    "reports.configError": "Error al buscar las configuraciones del servidor.",
    "reports.viewDetails": "Ver detalles",
    "reports.details": "Detalles",
    "reports.detailsFor": "Detalles de: {name}",
    "adminUsers.title": "Gestión de usuarios",
    "adminUsers.subtitle": "Visualiza y gestiona los usuarios registrados en el sistema.",
    "adminUsers.profile": "Perfil",
    "adminUsers.status": "Estado",
    "adminUsers.actions": "Acciones",
    "adminUsers.currentProfile": "Perfil actual",
    "adminUsers.manage": "Gestionar",
    "adminUsers.inactivate": "Inactivar",
    "adminUsers.inactivateUser": "Inactivar usuario",
    "adminUsers.viewEditTitle": "Ver y editar usuario",
    "adminUsers.cannotInactivateSelf": "No puedes inactivar tu propio usuario conectado.",
    "adminUsers.inactivateTitle": "No puedes inactivar tu propio usuario",
    "adminUsers.alreadyInactive": "Este usuario ya está inativo.",
    "adminUsers.confirmInactivate": "¿Inactivar al usuario {name}? Ya no podrá acceder al sistema.",
    "adminUsers.loadUserError": "Error al cargar los datos del usuario.",
    "adminUsers.updateSuccess": "Usuario actualizado con éxito.",
    "adminUsers.updateError": "Error al actualizar el usuario.",
    "adminUsers.inactivateSuccess": "Usuario inactivado con éxito.",
    "adminUsers.inactivateError": "Error al inativar el usuario.",
    "role.admin": "Administrador",
    "role.researcher": "Investigador",
    "role.visitor": "Visitante",
    "status.active": "Activo",
    "status.inactive": "Inativo",
    "status.pendingEmail": "Correo pendiente",
    "forbidden.title": "Acceso denegado",
    "forbidden.message": "No tienes permiso para acceder a esta página.",
    "forbidden.currentProfile": "Perfil actual:",
    "forbidden.back": "Volver",
    "forbidden.home": "Ir al inicio",
    "modal.evaluationDetails": "Detalles de la Evaluación",
    "modal.loadingInfo": "Cargando información...",
    "modal.evaluator": "Evaluador",
    "modal.averageScore": "Puntaje Medio General",
    "modal.evaluationInfo": "Información de la Evaluación",
    "modal.summary": "Resumen",
    "modal.localManagement": "Manejo Local",
    "modal.status": "Estado",
    "modal.collectedSamples": "Muestras Recolectadas",
    "modal.sampleSingular": "muestra",
    "modal.samplePlural": "muestras",
    "modal.layerSingular": "capa",
    "modal.layerPlural": "capas",
    "modal.order": "Orden: {order}",
    "modal.management": "Manejo",
    "modal.loadError": "No fue posible cargar los datos.",
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const isLanguage = (value: string | null): value is Language =>
    value === "pt-BR" || value === "en" || value === "es";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window === "undefined") return "pt-BR";
        const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
        return isLanguage(storedLanguage) ? storedLanguage : "pt-BR";
    });

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
    }, [language]);

    const value = useMemo<LanguageContextValue>(() => {
        const t = (key: TranslationKey, params?: Record<string, string | number>) => {
            const template = translations[language][key] ?? translations["pt-BR"][key] ?? key;
            if (!params) return template;

            return Object.entries(params).reduce(
                (text, [paramKey, paramValue]) =>
                    text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue)),
                template
            );
        };

        return {
            language,
            locale: language,
            setLanguage: setLanguageState,
            t,
        };
    }, [language]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }

    return context;
}