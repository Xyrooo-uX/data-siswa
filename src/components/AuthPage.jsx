import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage({ onLoginSuccess, sessionExpired }) {
  const [activeTab, setActiveTab] = useState('login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isRegister = activeTab === 'register';

  useEffect(() => {
    if (sessionExpired) {
      toast.error('Sesi berakhir karena tidak ada aktivitas. Silakan login kembali.', {
        id: 'session-expired'
      });
    }
  }, [sessionExpired]);

  const changeTab = (tab) => {
    if ((tab === 'register') === isRegister) return;
    setActiveTab(tab);
    setIsTransitioning(true);
  };

  const handleRegisterSuccess = () => {
    changeTab('login');
    toast.success('Registrasi berhasil. Silakan masuk menggunakan akun yang baru dibuat.');
  };

  const handlePromoAnimationEnd = (event) => {
    if (event.target === event.currentTarget && event.animationName.includes('auth-promo-shape-morph')) {
      setIsTransitioning(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-shell">
          <div className={`auth-form-panel auth-register-panel ${isRegister ? 'is-active' : ''}`} aria-hidden={!isRegister}>
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          </div>

          <div className={`auth-form-panel auth-login-panel ${!isRegister ? 'is-active' : ''}`} aria-hidden={isRegister}>
            <LoginForm onLoginSuccess={onLoginSuccess} />
          </div>

          <section
            className={`auth-promo-panel ${isRegister ? 'is-register' : ''} ${isTransitioning ? 'is-transitioning' : ''}`}
            onAnimationEnd={handlePromoAnimationEnd}
          >
            <div className="auth-promo-content" key={activeTab}>
              <img src="/smk.png" alt="Logo SMK Negeri 12 Malang" className="auth-promo-logo" />
              <p className="auth-promo-eyebrow">SIP DATA SISWA</p>
              <h1>{isRegister ? 'Selamat Datang!' : 'Selamat Datang Kembali!'}</h1>
              <p className="auth-promo-description">
                {isRegister
                  ? 'Sudah memiliki akun? Masuk untuk melanjutkan pendataan siswa.'
                  : 'Masuk untuk mengelola data dan informasi siswa SMKN 12 Malang.'}
              </p>
              <button
                type="button"
                className="auth-promo-button"
                onClick={() => changeTab(isRegister ? 'login' : 'register')}
              >
                {isRegister ? 'Masuk' : 'Daftar Sekarang'}
              </button>
            </div>
          </section>
        </div>

        <p className="auth-bottom-info">© 2026 RPL SMKN 12 Malang</p>
      </div>
    </div>
  );
}
