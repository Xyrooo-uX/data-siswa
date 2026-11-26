import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { registerUser } from '../services/api';
import { isStrongPassword } from '../utils/password';
import PasswordField from './PasswordField';

export default function RegisterForm({ onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !nisn.trim() || !email.trim() || !password.trim()) {
      toast.error('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Masukkan alamat email yang valid.');
      return;
    }

    if (!isStrongPassword(password)) {
      toast.error('Kata sandi minimal 8 karakter dan harus memuat huruf, angka, serta simbol.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({ name, nisn, email, password });
      if (response.success) {
        onRegisterSuccess();
      } else {
        toast.error(response.message || 'Registrasi gagal.');
      }
    } catch {
      toast.error('Terjadi kendala saat registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="auth-form-heading">
        <p className="auth-form-eyebrow">AKUN SISWA</p>
        <h2>Buat Akun</h2>
        <p>Lengkapi data berikut untuk mendaftar.</p>
      </div>

      <div className="auth-register-fields">
        <div className="auth-field">
          <label htmlFor="register-name">Nama Lengkap Siswa</label>
          <input
            id="register-name"
            type="text"
            placeholder="Masukkan nama lengkap siswa"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-nisn">NISN (10 Digit)</label>
          <input
            id="register-nisn"
            type="text"
            placeholder="Masukkan 10 digit NISN siswa"
            maxLength={15}
            autoComplete="off"
            value={nisn}
            onChange={(event) => setNisn(event.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email Siswa</label>
          <input
            id="register-email"
            type="email"
            placeholder="Masukkan email siswa"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="auth-field-grid">
          <PasswordField
            id="register-password"
            label="Kata Sandi"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            hint="Minimal 8 karakter, terdiri dari huruf, angka, dan simbol."
          />
          <PasswordField
            id="register-confirm-password"
            label="Ulangi Kata Sandi"
            placeholder="Ketik ulang kata sandi"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="role-notice-box">
        Pendaftaran ini khusus untuk siswa. Setelah mendaftar, silakan masuk untuk melengkapi data siswa.
      </div>

      <button type="submit" className="btn-auth-submit" disabled={isLoading}>
        {isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun Siswa'}
      </button>
    </form>
  );
}
