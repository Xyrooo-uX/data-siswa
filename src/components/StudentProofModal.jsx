import React from 'react';

export default function StudentProofModal({ student, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card print-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker">BUKTI TANDA TERIMA PENDATAAN</span>
            <h2>Tanda Bukti Input Data Siswa</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="modal-body printable-area">
          <div className="proof-header-banner">
            <div className="school-info">
              <h3>SISTEM PENDATAAN SOSIAL EKONOMI SISWA</h3>
              <p>Tahun Ajaran 2026/2027 | Bukti Verifikasi Data Tempat Tinggal</p>
            </div>
            <div className="proof-code">
              <span>NO. REGISTRASI:</span>
              <strong>REG-{student.nisn || student.id}</strong>
            </div>
          </div>

          <div className="proof-grid">
            <div className="proof-item">
              <span className="proof-label">Nama Siswa:</span>
              <strong className="proof-val">{student.nama_lengkap}</strong>
            </div>
            <div className="proof-item">
              <span className="proof-label">NISN:</span>
              <strong className="proof-val">{student.nisn}</strong>
            </div>
            <div className="proof-item">
              <span className="proof-label">Kelas / Jurusan:</span>
              <span className="proof-val">{student.kelas} - {student.jurusan}</span>
            </div>
            <div className="proof-item">
              <span className="proof-label">Status Keluarga:</span>
              <span className="proof-val font-bold">{student.status_keluarga}</span>
            </div>
            <div className="proof-item">
              <span className="proof-label">Kondisi Ekonomi:</span>
              <span className="proof-val font-bold">{student.kategori_ekonomi}</span>
            </div>
            <div className="proof-item">
              <span className="proof-label">Status Rumah:</span>
              <span className="proof-val font-bold">{student.status_rumah}</span>
            </div>
            <div className="proof-item full">
              <span className="proof-label">Alamat Saat Ini:</span>
              <span className="proof-val">{student.alamat_lengkap}, {student.kota_kabupaten}</span>
            </div>
            <div className="proof-item full">
              <span className="proof-label">Waktu Penginputan:</span>
              <span className="proof-val">{student.created_at ? new Date(student.created_at).toLocaleString('id-ID') : 'Baru Saja'}</span>
            </div>
          </div>

          {student.foto_rumah && (
            <div className="proof-photo-wrapper">
              <span className="proof-label">Foto Rumah yang Diunggah:</span>
              <img src={student.foto_rumah} alt="Foto Rumah Siswa" className="proof-thumb-img" />
            </div>
          )}

          <div className="proof-footer-notice">
            <p>
              * Simpan bukti tanda terima ini sebagai arsip pendaftaran verifikasi data ekonomi siswa dan bantuan sekolah.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={handlePrint}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Cetak / Simpan PDF</span>
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

