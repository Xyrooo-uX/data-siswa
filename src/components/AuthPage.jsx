import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthPage({ onLoginSuccess, onOpenGuide, backendOnline }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' atau 'register'

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regNisn, setRegNisn] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handler Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Harap isi Email/NISN dan Kata Sandi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(loginIdentifier, loginPassword);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Login gagal, periksa kredensial Anda.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat melakukan login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Submit Register Siswa
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regNisn.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        name: regName,
        nisn: regNisn,
        email: regEmail,
        password: regPassword,
      });

      if (res.success) {
        setSuccessMessage('Registrasi siswa berhasil! Otomatis masuk ke akun Anda...');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Registrasi gagal.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* Header Branding */}
        <div className="auth-header">
          <div className="auth-brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1>SIP DATA SISWA</h1>
          <p className="auth-subtitle">
            Sistem Informasi Pendataan Kondisi Ekonomi Orang Tua & Foto Rumah Siswa
          </p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Tabs: Login vs Register */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              <span>Daftar Siswa (Register)</span>
            </button>
          </div>

          {/* Alert Error / Success */}
          {errorMessage && (
            <div className="auth-alert error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: FORM LOGIN */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-field">
                <label>Email atau NISN</label>
                <div className="input-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input
                    type="text"
                    placeholder="Masukkan Email atau NISN"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Kata Sandi (Password)</label>
                <div className="input-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input
                    type="password"
                    placeholder="Masukkan kata sandi"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
              </button>
            </form>
          ) : (
            /* TAB 2: FORM REGISTER SISWA */
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="role-notice-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <p>
                  Pendaftaran akun ini khusus untuk <strong>User 1: Siswa</strong>. Setelah mendaftar, Anda langsung dapat menginput kondisi orang tua, ekonomi, alamat saat ini, serta mengunggah foto terbaru rumah.
                </p>
              </div>

              <div className="auth-field">
                <label>Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap siswa"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label>NISN (10 Digit)</label>
                <input
                  type="text"
                  placeholder="Masukkan 10 digit NISN siswa"
                  maxLength={15}
                  value={regNisn}
                  onChange={(e) => setRegNisn(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Email Siswa</label>
                <input
                  type="email"
                  placeholder="Masukkan email siswa"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field-grid">
                <div className="auth-field">
                  <label>Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Ulangi Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="Ketik ulang kata sandi"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                {isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun Siswa & Mulai'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <div className="auth-bottom-info">
          <p>
            KIK Kelas 12 |Foto Rumah, Filter Kondisi Ekonomi & Keluarga
          </p>
        </div>
      </div>
    </div>
  );
}
