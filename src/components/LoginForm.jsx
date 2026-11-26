import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import PasswordField from './PasswordField';

export default function LoginForm({ onLoginSuccess }) {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      toast.error('Harap isi Email/NISN dan Kata Sandi.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser(loginIdentifier, loginPassword);
      if (response.success) {
        toast.success('Berhasil masuk.');
        onLoginSuccess(response.user);
      } else {
        toast.error(response.message || 'Login gagal, periksa kredensial Anda.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat melakukan login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="auth-form-heading">
        <p className="auth-form-eyebrow">SIP DATA SISWA</p>
        <h2>Masuk ke Akun</h2>
        <p>Gunakan email atau NISN yang terdaftar.</p>
      </div>

      <div className="auth-field">
        <label htmlFor="login-identifier">Email atau NISN</label>
        <input
          id="login-identifier"
          type="text"
          placeholder="Masukkan Email atau NISN"
          autoComplete="username"
          value={loginIdentifier}
          onChange={(event) => setLoginIdentifier(event.target.value)}
          required
        />
      </div>

      <PasswordField
        id="login-password"
        label="Kata Sandi"
        placeholder="Masukkan kata sandi"
        autoComplete="current-password"
        value={loginPassword}
        onChange={(event) => setLoginPassword(event.target.value)}
        required
      />

      <button type="submit" className="btn-auth-submit" disabled={isLoading}>
        {isLoading ? 'Memverifikasi...' : 'Login  '}
      </button>
    </form>
  );
}
