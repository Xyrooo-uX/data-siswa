import React from 'react';

export default function Navbar({
  currentUser,
  onLogout,
  onOpenGuide,
  backendOnline,
  siswaTab,
  setSiswaTab
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">SIP DATA SISWA</span>
            <span className="brand-subtitle">Pendataan Sosial Ekonomi & Status Tempat Tinggal</span>
          </div>
        </div>

        {/* Tab Navigasi Khusus Siswa */}
        {currentUser && currentUser.role === 'siswa' && (
          <div className="siswa-nav-tabs">
            <button
              type="button"
              className={`siswa-tab-btn ${siswaTab === 'form' ? 'active' : ''}`}
              onClick={() => setSiswaTab('form')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Formulir Input Data</span>
            </button>
            <button
              type="button"
              className={`siswa-tab-btn ${siswaTab === 'profile' ? 'active' : ''}`}
              onClick={() => setSiswaTab('profile')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Data Saya & Status</span>
            </button>
          </div>
        )}

        {/* Right Action & User Profile */}
        <div className="navbar-actions">
          {/* Status Koneksi Backend / Local Fallback */}
          <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`} title={backendOnline ? 'Terhubung ke Backend Laravel API' : 'Mode Offline / LocalStorage Aktif (Siap Demo)'}>
            <span className="status-dot"></span>
            <span>{backendOnline ? 'Laravel Online' : 'Local Storage Mode'}</span>
          </div>

          {/* Tombol Panduan Tugas 2 Orang */}
          <button 
            type="button" 
            onClick={onOpenGuide}
            className="btn-guide"
            title="Lihat pembagian tugas 2 orang & panduan hosting"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Panduan Tugas</span>
          </button>

          {/* User Profile & Logout */}
          {currentUser && (
            <div className="user-profile-menu">
              <div className="user-info-badge">
                <span className={`role-tag-pill ${currentUser.role === 'admin' ? 'admin' : 'siswa'}`}>
                  {currentUser.role === 'admin' ? 'Admin' : 'Siswa'}
                </span>
                <span className="user-display-name">{currentUser.name}</span>
              </div>

              <button
                type="button"
                className="btn-logout"
                onClick={onLogout}
                title="Keluar dari akun ini"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
