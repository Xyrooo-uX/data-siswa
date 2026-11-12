import React, { useState } from 'react';

export default function CollaborationGuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('team'); // 'team' atau 'hosting'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker">PANDUAN TUGAS 2 ORANG & HOSTING GRATIS</span>
            <h2>Struktur Kolaborasi Tim & Langkah Deployment</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="guide-tab-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            1. Pembagian Tugas 2 Orang
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'hosting' ? 'active' : ''}`}
            onClick={() => setActiveTab('hosting')}
          >
            2. Panduan Domain & Hosting Gratis
          </button>
        </div>

        <div className="modal-body guide-content">
          {activeTab === 'team' ? (
            <div className="guide-section">
              <div className="team-split-grid">
                {/* ANGGOTA 1 */}
                <div className="team-card">
                  <div className="member-badge bg-blue-soft">Anggota 1</div>
                  <h3>Frontend Developer & UI/UX Specialist</h3>
                  <p className="role-sub">Fokus: Tampilan React, Interaksi Form, & Dashboard Admin</p>

                  <ul className="task-list">
                    <li>
                      <strong>Pembuatan Komponen React:</strong>
                      <span>Membangun Formulir Siswa multi-langkah (input orang tua, ekonomi, alamat, live preview foto rumah).</span>
                    </li>
                    <li>
                      <strong>Dashboard Admin & Filter:</strong>
                      <span>Mengembangkan filter interaktif berdasarkan kondisi ekonomi, status keluarga, dan status rumah.</span>
                    </li>
                    <li>
                      <strong>UX & Bukti Cetak:</strong>
                      <span>Membuat modal detail siswa, zoom foto rumah, ekspor CSV, dan cetak bukti tanda terima.</span>
                    </li>
                    <li>
                      <strong>Integrasi API & Fallback:</strong>
                      <span>Menghubungkan frontend ke Laravel API dan menyiapkan fallback lokal.</span>
                    </li>
                    <li>
                      <strong>Deploy Frontend:</strong>
                      <span>Mengupload aplikasi React ke <strong>Vercel / Netlify</strong> (Domain gratis).</span>
                    </li>
                  </ul>
                </div>

                {/* ANGGOTA 2 */}
                <div className="team-card">
                  <div className="member-badge bg-emerald-soft">Anggota 2</div>
                  <h3>Backend Developer & Database Engineer</h3>
                  <p className="role-sub">Fokus: Laravel REST API, Database Migration, & Storage Foto</p>

                  <ul className="task-list">
                    <li>
                      <strong>Perancangan Database:</strong>
                      <span>Membuat migration tabel <code>users</code> dan tabel <code>students</code> dengan kolom lengkap.</span>
                    </li>
                    <li>
                      <strong>Laravel Models & Seeder:</strong>
                      <span>Membuat Model <code>Student</code> dan <code>DatabaseSeeder</code> dengan data realistis.</span>
                    </li>
                    <li>
                      <strong>RESTful API Controller:</strong>
                      <span>Membuat <code>StudentController</code> (CRUD, filter query parameter, agregasi statistik).</span>
                    </li>
                    <li>
                      <strong>Upload Foto Storage:</strong>
                      <span>Menangani upload foto rumah via multipart/form-data dan base64 storage.</span>
                    </li>
                    <li>
                      <strong>Deploy Backend:</strong>
                      <span>Mengupload backend Laravel ke <strong>Render / TiDB Cloud</strong> atau <strong>InfinityFree</strong>.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tips Kolaborasi Git */}
              <div className="git-guide-box">
                <h4>Alur Kolaborasi Git & GitHub (2 Orang):</h4>
                <ol className="git-steps">
                  <li>Buat repository di GitHub, misalnya <code>pendataan-siswa-kik</code>.</li>
                  <li>Undang rekan tim Anda sebagai <strong>Collaborator</strong> di GitHub.</li>
                  <li>Anggota 1 bekerja pada branch <code>frontend-feature</code>, Anggota 2 pada branch <code>backend-feature</code>.</li>
                  <li>Lakukan merge ke branch <code>main</code> setelah fitur selesai diuji.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="guide-section">
              <div className="hosting-steps-grid">
                {/* Opsi 1: Frontend ke Vercel */}
                <div className="hosting-step-card">
                  <div className="step-badge">Langkah 1 (Frontend)</div>
                  <h4>Upload React ke Vercel (100% Gratis & Otomatis)</h4>
                  <ol className="step-list">
                    <li>Push kode project ini ke akun GitHub Anda.</li>
                    <li>Buka <a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a> lalu login dengan GitHub.</li>
                    <li>Klik <strong>"Add New"</strong> &rarr; <strong>"Project"</strong>, pilih repository Anda.</li>
                    <li>Klik <strong>"Deploy"</strong>. Dalam 1 menit, website Anda sudah aktif dengan domain gratis seperti: <code>https://data-siswa-kik.vercel.app</code></li>
                  </ol>
                </div>

                {/* Opsi 2: Backend ke Render / TiDB */}
                <div className="hosting-step-card">
                  <div className="step-badge">Langkah 2 (Backend)</div>
                  <h4>Upload Laravel Backend ke Render / TiDB (Gratis)</h4>
                  <ol className="step-list">
                    <li>Daftar di <a href="https://render.com" target="_blank" rel="noreferrer">render.com</a> (Free Web Service).</li>
                    <li>Pilih folder <code>backend</code> dan atur build command: <code>composer install --no-dev --optimize-autoloader</code>.</li>
                    <li>Start command: <code>php artisan serve --host 0.0.0.0 --port 10000</code>.</li>
                    <li>Database gratis: Gunakan <strong>TiDB Cloud Free</strong> atau <strong>Aiven Free MySQL</strong> (salin kredensial DB ke environment Render).</li>
                  </ol>
                </div>

                {/* Opsi 3: Alternatif cPanel / InfinityFree */}
                <div className="hosting-step-card full-width">
                  <div className="step-badge">Alternatif Shared Hosting Gratis</div>
                  <h4>InfinityFree (Domain Gratis .rf.gd + PHP + MySQL Gratis)</h4>
                  <p>
                    Jika sekolah/guru menghendaki hosting cPanel tradisional:
                    Daftar di <a href="https://www.infinityfree.com" target="_blank" rel="noreferrer">infinityfree.com</a>, 
                    dapatkan subdomain gratis seperti <code>datasiswa.kesug.com</code> atau <code>datasiswa.rf.gd</code>, lalu upload file build React dan backend PHP ke folder <code>htdocs</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}

