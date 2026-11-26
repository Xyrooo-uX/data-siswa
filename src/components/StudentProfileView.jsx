import React from 'react';

export default function StudentProfileView({
  currentUser,
  students = [],
  onOpenForm,
  onOpenProof
}) {
  // Cari data pengajuan yang sesuai dengan siswa yang sedang login (berdasarkan NISN atau Nama)
  const myRecord = students.find(s => 
    (currentUser.nisn && s.nisn === currentUser.nisn) ||
    s.nama_lengkap.toLowerCase() === currentUser.name.toLowerCase()
  );

  if (!myRecord) {
    return (
      <div className="student-profile-container">
        <div className="empty-profile-card">
          <div className="empty-icon-circle">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.75">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <h2>Anda Belum Mengisi Formulir Pendataan</h2>
          <p>
            Halo, <strong>{currentUser.name}</strong> (NISN: {currentUser.nisn || '-'}). Anda belum mengirimkan data kondisi keluarga, kondisi ekonomi, dan foto tempat tinggal saat ini.
          </p>
          <button type="button" className="btn-primary" onClick={onOpenForm}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Isi Formulir Pendataan Sekarang</span>
          </button>
        </div>
      </div>
    );
  }

  // Helper kelas status verifikasi
  const isVerified = myRecord.status_verifikasi === 'Terverifikasi';
  const isRevision = myRecord.status_verifikasi === 'Perlu Revisi';

  return (
    <div className="student-profile-container">
      {/* Status Verifikasi Banner */}
      <div className={`status-banner-card ${isVerified ? 'verified' : isRevision ? 'revision' : 'pending'}`}>
        <div className="banner-left">
          <div className="banner-status-badge">
            {isVerified ? 'DATA TERVERIFIKASI' : isRevision ? 'PERLU REVISI' : 'MENUNGGU VERIFIKASI'}
          </div>
          <h3>Status Pendataan Siswa: {myRecord.status_verifikasi || 'Menunggu Verifikasi'}</h3>
          <p>
            {isVerified 
              ? 'Selamat, data kondisi orang tua, ekonomi, dan foto rumah Anda telah diverifikasi valid oleh pihak sekolah.'
              : isRevision
              ? 'Pihak sekolah meminta Anda memeriksa kembali data atau mengunggah ulang foto rumah yang lebih jelas.'
              : 'Data Anda telah diterima di sistem admin dan sedang dalam antrean verifikasi oleh petugas sekolah.'}
          </p>
          {myRecord.catatan_admin && (
            <div className="admin-notes-box">
              <strong>Catatan dari Administrator:</strong>
              <p>"{myRecord.catatan_admin}"</p>
            </div>
          )}
        </div>

        <div className="banner-right-actions">
          <button
            type="button"
            className="btn-print-proof"
            onClick={() => onOpenProof && onOpenProof(myRecord)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Cetak Tanda Terima</span>
          </button>
        </div>
      </div>

      {/* Rincian Data Siswa yang Sudah Masuk */}
      <div className="profile-detail-grid">
        {/* Foto Rumah yang Diupload */}
        <div className="profile-photo-card">
          <h4>Foto Terbaru Rumah yang Diunggah</h4>
          <div className="uploaded-house-box">
            {myRecord.foto_rumah ? (
              <img src={myRecord.foto_rumah} alt="Foto Rumah Siswa" className="profile-house-img" />
            ) : (
              <div className="no-house-img">Tidak ada foto</div>
            )}
            <span className="house-status-tag">Status Rumah: {myRecord.status_rumah}</span>
          </div>
          <div className="address-box">
            <strong>Alamat Tempat Tinggal Saat Ini:</strong>
            <p>{myRecord.alamat_lengkap}</p>
            {(myRecord.rt || myRecord.rw || myRecord.blok || myRecord.nomor_rumah) && (
              <span className="location-sub">
                RT {myRecord.rt || '-'} / RW {myRecord.rw || '-'}
                {myRecord.blok ? `, Blok ${myRecord.blok}` : ''}
                {myRecord.nomor_rumah ? ` No. ${myRecord.nomor_rumah}` : ''}
              </span>
            )}
            <span className="location-sub">
              {myRecord.kelurahan_desa ? `Desa ${myRecord.kelurahan_desa}, ` : ''}
              {myRecord.kecamatan ? `Kec. ${myRecord.kecamatan}, ` : ''}
              {myRecord.kota_kabupaten}, {myRecord.provinsi}
            </span>
          </div>
        </div>

        {/* Rincian Kondisi Keluarga & Ekonomi */}
        <div className="profile-info-card">
          <h4>Ringkasan Data Kondisi Sosial Ekonomi</h4>

          <div className="profile-data-list">
            <div className="profile-data-row">
              <span className="label">Nama Siswa:</span>
              <strong>{myRecord.nama_lengkap}</strong>
            </div>
            <div className="profile-data-row">
              <span className="label">NISN:</span>
              <span>{myRecord.nisn}</span>
            </div>
            <div className="profile-data-row">
              <span className="label">Kelas & Jurusan:</span>
              <span>{myRecord.kelas} - {myRecord.jurusan}</span>
            </div>
            <div className="profile-data-row">
              <span className="label">Status Keluarga:</span>
              <span className="badge badge-purple font-bold">{myRecord.status_keluarga}</span>
            </div>
            <div className="profile-data-row">
              <span className="label">Kategori Ekonomi:</span>
              <span className="badge badge-warning font-bold">{myRecord.kategori_ekonomi}</span>
            </div>
            <div className="profile-data-row">
              <span className="label">Penghasilan Total Keluarga:</span>
              <strong>Rp {Number(myRecord.penghasilan_total || 0).toLocaleString('id-ID')} / bulan</strong>
            </div>
            <div className="profile-data-row">
              <span className="label">Jumlah Tanggungan:</span>
              <span>{myRecord.jumlah_tanggungan || 1} orang anak</span>
            </div>
            <div className="profile-data-row">
              <span className="label">Program Bantuan Pemerintah:</span>
              <span className="badge badge-help">{myRecord.penerima_bantuan || 'Tidak Ada'}</span>
            </div>
            <div className="profile-data-row">
              <span className="label">Status Kepemilikan Rumah:</span>
              <span className="badge badge-orange">{myRecord.status_rumah}</span>
            </div>
          </div>

          <div className="profile-card-footer">
            <button type="button" className="btn-secondary" onClick={onOpenForm}>
              <span>Kirim Pembaruan Data Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

