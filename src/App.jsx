import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import StudentForm from './components/StudentForm';
import StudentProfileView from './components/StudentProfileView';
import AdminDashboard from './components/AdminDashboard';
import StudentDetailModal from './components/StudentDetailModal';
import StudentProofModal from './components/StudentProofModal';
import CollaborationGuideModal from './components/CollaborationGuideModal';
import { fetchStudents, checkBackendConnection, getCurrentUser, logoutUser } from './services/api';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [proofStudent, setProofStudent] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Tab aktif khusus untuk siswa: 'form' (isi formulir) atau 'profile' (lihat data & status verifikasi)
  const [siswaTab, setSiswaTab] = useState('form');

  // Muat data siswa dari API/LocalStorage
  const loadStudents = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetchStudents();
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat siswa:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Cek backend status saat aplikasi pertama kali dimuat
  useEffect(() => {
    async function init() {
      const isOnline = await checkBackendConnection();
      setBackendOnline(isOnline);
      await loadStudents();
    }
    init();
  }, [loadStudents]);

  // Polling sinkronisasi realtime antara Laptop & HP setiap 3,5 detik
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const isOnline = await checkBackendConnection();
        setBackendOnline(isOnline);
        if (currentUser) {
          await loadStudents(true);
        }
      } catch {
        // abaikan error koneksi saat background polling
      }
    }, 3500);

    return () => clearInterval(syncInterval);
  }, [currentUser, loadStudents]);

  // Handler Login Berhasil
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'siswa') {
      setSiswaTab('form');
    }
  };

  // Handler Logout
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      logoutUser();
      setCurrentUser(null);
      setSelectedStudent(null);
      setProofStudent(null);
    }
  };

  // Handler ketika siswa baru berhasil input data
  const handleStudentSubmitted = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
    setProofStudent(newStudent);
  };

  // -------------------------------------------------------------------------
  // JIKA BELUM LOGIN: TAMPILKAN HALAMAN LOGIN & REGISTER
  // -------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="app-layout">
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onOpenGuide={() => setShowGuide(true)}
          backendOnline={backendOnline}
        />

        {showGuide && (
          <CollaborationGuideModal
            onClose={() => setShowGuide(false)}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // JIKA SUDAH LOGIN: TAMPILKAN SESUAI ROLE (SISWA / ADMIN)
  // -------------------------------------------------------------------------
  return (
    <div className="app-layout">
      {/* Navbar Atas dengan Profile User & Logout */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenGuide={() => setShowGuide(true)}
        backendOnline={backendOnline}
        siswaTab={siswaTab}
        setSiswaTab={setSiswaTab}
      />

      {/* Main Content Area Sesuai Role */}
      <main className="main-content">
        {currentUser.role === 'siswa' ? (
          /* =================================================================
             ROLE 1: SISWA
             ================================================================= */
          <section className="view-section">
            {siswaTab === 'form' ? (
              <StudentForm
                currentUser={currentUser}
                onStudentSubmitted={handleStudentSubmitted}
                onOpenProof={(data) => setProofStudent(data)}
              />
            ) : (
              <StudentProfileView
                currentUser={currentUser}
                students={students}
                onOpenForm={() => setSiswaTab('form')}
                onOpenProof={(data) => setProofStudent(data)}
              />
            )}
          </section>
        ) : (
          /* =================================================================
             ROLE 2: ADMIN
             ================================================================= */
          <section className="view-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Memuat data kondisi siswa...</p>
              </div>
            ) : (
              <AdminDashboard
                students={students}
                onSelectStudent={(student) => setSelectedStudent(student)}
                onRefreshData={loadStudents}
              />
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p>
            Tugas KIK Kelas 12 | Dikerjakan oleh 2 Orang (Frontend React & Backend Laravel)
          </p>
          <div className="footer-links">
            <span className="user-logged-hint">
              Masuk sebagai: <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
            </span>
            <span className="separator">|</span>
            <button type="button" onClick={() => setShowGuide(true)} className="footer-btn">
              Panduan Kolaborasi & Hosting Gratis
            </button>
            <span className="separator">|</span>
            <button type="button" onClick={handleLogout} className="footer-btn logout-text">
              Keluar (Logout)
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL: DETAIL SISWA (ADMIN) */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdated={loadStudents}
        />
      )}

      {/* MODAL: BUKTI INPUT SISWA */}
      {proofStudent && (
        <StudentProofModal
          student={proofStudent}
          onClose={() => setProofStudent(null)}
        />
      )}

      {/* MODAL: PANDUAN TUGAS 2 ORANG & HOSTING GRATIS */}
      {showGuide && (
        <CollaborationGuideModal
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  );
}
