import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUserUpdated
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' ou 'security'

  // Campos de Dados Pessoais
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Campos de Segurança / Senha
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Sincroniza campos quando o modal abre
  useEffect(() => {
    if (isOpen && user) {
      setNome(user.user_metadata?.nome || user.user_metadata?.name || '');
      setEmail(user.email || '');
      setProfileSuccess('');
      setProfileError('');
      setPassword('');
      setConfirmPassword('');
      setPasswordSuccess('');
      setPasswordError('');
      setActiveTab('profile');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Atualizar Nome e E-mail
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    const nomeTrimmed = nome.trim();
    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      setProfileError('O e-mail não pode ficar em branco.');
      return;
    }

    const emailMudou = emailTrimmed.toLowerCase() !== (user?.email || '').toLowerCase();
    const nomeMudou = nomeTrimmed !== (user?.user_metadata?.nome || '');

    if (!emailMudou && !nomeMudou) {
      setProfileSuccess('Nenhuma alteração detectada.');
      return;
    }

    try {
      setLoadingProfile(true);

      const updatePayload = {};
      if (nomeMudou) {
        updatePayload.data = {
          ...(user?.user_metadata || {}),
          nome: nomeTrimmed
        };
      }
      if (emailMudou) {
        updatePayload.email = emailTrimmed;
      }

      const { data, error } = await supabase.auth.updateUser(updatePayload);

      if (error) throw error;

      if (data?.user && onUserUpdated) {
        onUserUpdated(data.user);
      }

      if (emailMudou) {
        setProfileSuccess(
          'Perfil atualizado! Enviamos um link de confirmação para o novo endereço de e-mail.'
        );
      } else {
        setProfileSuccess('Seu nome foi atualizado com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      let msg = err.message || 'Erro ao atualizar dados.';
      if (msg.includes('email address is invalid')) {
        msg = 'O formato de e-mail informado é inválido.';
      } else if (msg.includes('already registered')) {
        msg = 'Este e-mail já está sendo utilizado por outra conta.';
      }
      setProfileError(msg);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Alterar Senha
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!password) {
      setPasswordError('Informe a nova senha.');
      return;
    }

    if (password.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      setLoadingPassword(true);

      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      if (data?.user && onUserUpdated) {
        onUserUpdated(data.user);
      }

      setPasswordSuccess('Sua senha foi alterada com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      let msg = err.message || 'Não foi possível alterar sua senha.';
      if (msg.includes('Password should be at least')) {
        msg = 'A nova senha precisa ter pelo menos 6 caracteres.';
      }
      setPasswordError(msg);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container profile-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabeçalho do Modal */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">Minha Conta</h2>
            <p className="modal-subtitle">Gerencie suas informações pessoais e credenciais</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="profile-tabs-bar">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            <span>Dados Pessoais</span>
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <KeyRound size={16} />
            <span>Alterar Senha</span>
          </button>
        </div>

        {/* Conteúdo da Aba: Dados Pessoais */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            {profileError && (
              <div className="modal-error-banner">
                <AlertCircle size={18} />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="modal-success-banner">
                <CheckCircle2 size={18} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {/* Campo Nome */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-nome">
                <User size={16} />
                <span>Nome de Exibição</span>
              </label>
              <input
                id="profile-nome"
                type="text"
                className="form-input"
                placeholder="Como deseja ser chamado(a)?"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (profileError) setProfileError('');
                }}
                autoFocus
              />
            </div>

            {/* Campo E-mail */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                <Mail size={16} />
                <span>E-mail</span>
              </label>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (profileError) setProfileError('');
                }}
                required
              />
              <span className="form-help-text">
                Caso altere o e-mail, uma mensagem de validação será enviada ao novo endereço.
              </span>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Fechar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingProfile}
              >
                {loadingProfile ? (
                  <span className="spinner-wrap">
                    <span className="spinner-mini"></span>
                    <span>Salvando...</span>
                  </span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Salvar Dados</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Conteúdo da Aba: Segurança / Senha */}
        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="profile-form">
            {passwordError && (
              <div className="modal-error-banner">
                <AlertCircle size={18} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="modal-success-banner">
                <ShieldCheck size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {/* Nova Senha */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-password">
                <Lock size={16} />
                <span>Nova Senha</span>
              </label>
              <div className="input-with-icon">
                <input
                  id="profile-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmação de Nova Senha */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-confirm-password">
                <Lock size={16} />
                <span>Confirmar Nova Senha</span>
              </label>
              <input
                id="profile-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                required
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Fechar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingPassword}
              >
                {loadingPassword ? (
                  <span className="spinner-wrap">
                    <span className="spinner-mini"></span>
                    <span>Atualizando...</span>
                  </span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Atualizar Senha</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

