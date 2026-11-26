import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import StudentForm from './components/StudentForm';
import StudentProfileView from './components/StudentProfileView';
import AdminDashboard from './components/AdminDashboard';
import StudentDetailModal from './components/StudentDetailModal';
import StudentProofModal from './components/StudentProofModal';
import { fetchStudents, logoutUser } from './services/api';
import toast from 'react-hot-toast';
import confirmToast from './utils/confirmToast';
import './App.css';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [proofStudent, setProofStudent] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
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

  // Polling sinkronisasi realtime antara Laptop & HP setiap 3,5 detik
  useEffect(() => {
    if (!currentUser) return undefined;

    const syncInterval = setInterval(() => loadStudents(true), 3500);

    return () => clearInterval(syncInterval);
  }, [currentUser, loadStudents]);

  const expireSession = useCallback(() => {
    logoutUser();
    setCurrentUser(null);
    setSelectedStudent(null);
    setProofStudent(null);
    setSessionExpired(true);
  }, []);

  // Akhiri sesi setelah 15 menit tanpa aktivitas pengguna.
  useEffect(() => {
    if (!currentUser) return undefined;

    let lastActivityAt = Date.now();
    let timeoutId;

    const expireIfIdle = () => {
      expireSession();
    };

    const scheduleLogout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(expireIfIdle, IDLE_TIMEOUT_MS);
    };

    const recordActivity = () => {
      if (Date.now() - lastActivityAt >= IDLE_TIMEOUT_MS) {
        expireIfIdle();
        return;
      }
      lastActivityAt = Date.now();
      scheduleLogout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordActivity();
      }
    };

    const activityEvents = ['pointerdown', 'keydown', 'mousemove', 'touchstart', 'scroll'];
    activityEvents.forEach(eventName => window.addEventListener(eventName, recordActivity));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    scheduleLogout();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(eventName => window.removeEventListener(eventName, recordActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser, expireSession]);

  // Handler Login Berhasil
  const handleLoginSuccess = (user) => {
    setSessionExpired(false);
    setCurrentUser(user);
    loadStudents();
    if (user.role === 'siswa') {
      setSiswaTab('form');
    }
  };

  // Handler Logout
  const handleLogout = async () => {
    const confirmed = await confirmToast({
      message: 'Apakah Anda yakin ingin keluar dari sistem?',
      confirmText: 'Keluar'
    });

    if (!confirmed) return;

    logoutUser();
    setCurrentUser(null);
    setSelectedStudent(null);
    setProofStudent(null);
    setSessionExpired(false);
    toast.success('Anda berhasil keluar.');
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
          sessionExpired={sessionExpired}
        />
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
            © 2026 RPL SMKN 12 Malang
          </p>
          <div className="footer-links">
            <span className="user-logged-hint">
              Masuk sebagai: <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
            </span>
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

    </div>
  );
}
