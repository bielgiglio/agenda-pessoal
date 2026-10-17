import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export default function Login({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseConfigured) {
      setErrorMessage(
        'Supabase ainda não configurado! Por favor, preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env'
      );
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Fluxo de Cadastro
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (data.session) {
          if (onAuthSuccess) onAuthSuccess(data.session);
        } else {
          setSuccessMessage(
            'Cadastro realizado com sucesso! Se necessário, confirme o link no seu e-mail ou faça login agora.'
          );
          setIsSignUp(false);
        }
      } else {
        // Fluxo de Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (data.session && onAuthSuccess) {
          onAuthSuccess(data.session);
        }
      }
    } catch (err) {
      console.error('Erro de autenticação:', err);
      let friendlyMessage = err.message || 'Ocorreu um erro ao processar sua solicitação.';
      
      if (friendlyMessage.includes('Invalid login credentials')) {
        friendlyMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
      } else if (friendlyMessage.includes('User already registered')) {
        friendlyMessage = 'Este e-mail já está cadastrado. Alterne para Entrar.';
      } else if (friendlyMessage.includes('Email not confirmed')) {
        friendlyMessage = 'Por favor, confirme seu e-mail antes de entrar.';
      } else if (friendlyMessage.includes('Password should be at least')) {
        friendlyMessage = 'A senha deve possuir no mínimo 6 caracteres.';
      }

      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        {/* Logotipo e Cabeçalho */}
        <div className="login-header">
          <div className="login-icon-badge">
            <Calendar size={32} className="login-brand-icon" />
          </div>
          <h1 className="login-title">Agenda Pessoal</h1>
          <p className="login-subtitle">
            {isSignUp
              ? 'Crie sua conta para sincronizar seus compromissos'
              : 'Entre com sua conta para acessar seus eventos'}
          </p>
        </div>

        {/* Alerta de configuração pendente */}
        {!isSupabaseConfigured && (
          <div className="login-alert warning">
            <AlertCircle size={20} className="alert-icon" />
            <div>
              <strong>Atenção:</strong> Configure suas chaves do Supabase no arquivo{' '}
              <code>.env</code> na raiz do projeto para conectar com o banco.
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="login-alert error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="login-alert success">
            <CheckCircle2 size={18} className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              E-mail
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Senha
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
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

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-wrap">
                <span className="spinner-mini"></span>
                <span>Processando...</span>
              </span>
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                <span>Criar Conta</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        {/* Alternância entre Login e Cadastro */}
        <div className="login-footer">
          <p className="login-switch-text">
            {isSignUp ? 'Já possui uma conta?' : 'Ainda não tem uma conta?'}
          </p>
          <button
            type="button"
            className="btn-switch-mode"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            {isSignUp ? 'Fazer login' : 'Cadastre-se gratuitamente'}
          </button>
        </div>
      </div>
    </div>
  );
}

