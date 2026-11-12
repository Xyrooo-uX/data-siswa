import React, { useState } from 'react';
import { updateStudent } from '../services/api';

export default function StudentDetailModal({ student, onClose, onUpdated }) {
  if (!student) return null;

  const [verifikasi, setVerifikasi] = useState(student.status_verifikasi || 'Menunggu');
  const [catatan, setCatatan] = useState(student.catatan_admin || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      await updateStudent(student.id, {
        status_verifikasi: verifikasi,
        catatan_admin: catatan
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdated) onUpdated();
    } catch {
      alert('Gagal memperbarui status');
    } finally {
      setIsSaving(false);
    }
  };

  // Link Google Maps
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${student.alamat_lengkap}, ${student.kota_kabupaten || ''}`)}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker">DETAIL DATA KONDISI SISWA</span>
            <h2>{student.nama_lengkap}</h2>
            <div className="modal-subtitle">
              <span>NISN: {student.nisn}</span> | <span>Kelas: {student.kelas}</span> | <span>Jurusan: {student.jurusan}</span>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} title="Tutup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* FOTO RUMAH TERBARU (Sesuai Kriteria Soal) */}
          <div className="detail-photo-section">
            <div className="photo-header-row">
              <div className="photo-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <strong>Foto Terbaru Rumah Siswa (Status: {student.status_rumah})</strong>
              </div>
              <button
                type="button"
                className="btn-zoom-photo"
                onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
              >
                {isPhotoZoomed ? 'Kecilkan Foto' : 'Perbesar Foto Penuh'}
              </button>
            </div>

            <div className={`modal-house-photo-wrapper ${isPhotoZoomed ? 'zoomed' : ''}`}>
              {student.foto_rumah ? (
                <img
                  src={student.foto_rumah}
                  alt={`Kondisi rumah ${student.nama_lengkap}`}
                  className="modal-house-img"
                  onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                />
              ) : (
                <div className="empty-photo-box">
                  <p>Siswa belum mengunggah foto rumah terbaru.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3 KRITERIA UTAMA */}
          <div className="three-criteria-grid">
            {/* KRITERIA 1: KONDISI EKONOMI */}
            <div className="criteria-card">
              <div className="criteria-header bg-amber-soft">
                <span className="criteria-tag">Kriteria 1</span>
                <h4>Kondisi Ekonomi</h4>
              </div>
              <div className="criteria-content">
                <div className="info-row">
                  <span className="info-label">Kategori Ekonomi:</span>
                  <span className="badge badge-warning font-bold">{student.kategori_ekonomi}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Penghasilan Total:</span>
                  <strong>Rp {Number(student.penghasilan_total || 0).toLocaleString('id-ID')} / bln</strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Jumlah Tanggungan:</span>
                  <span>{student.jumlah_tanggungan || 1} orang</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Bantuan Sosial:</span>
                  <span className="badge badge-help">{student.penerima_bantuan || 'Tidak Ada'}</span>
                </div>
              </div>
            </div>

            {/* KRITERIA 2: STATUS KELUARGA & ORANG TUA */}
            <div className="criteria-card">
              <div className="criteria-header bg-purple-soft">
                <span className="criteria-tag">Kriteria 2</span>
                <h4>Status Keluarga & Ortu</h4>
              </div>
              <div className="criteria-content">
                <div className="info-row">
                  <span className="info-label">Status Keluarga:</span>
                  <span className="badge badge-purple font-bold">{student.status_keluarga}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nama Ayah:</span>
                  <span>{student.nama_ayah || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Pekerjaan Ayah:</span>
                  <span>{student.pekerjaan_ayah || '-'} (Rp {Number(student.penghasilan_ayah || 0).toLocaleString('id-ID')})</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nama Ibu:</span>
                  <span>{student.nama_ibu || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Pekerjaan Ibu:</span>
                  <span>{student.pekerjaan_ibu || '-'} (Rp {Number(student.penghasilan_ibu || 0).toLocaleString('id-ID')})</span>
                </div>
              </div>
            </div>

            {/* KRITERIA 3: STATUS RUMAH & ALAMAT */}
            <div className="criteria-card">
              <div className="criteria-header bg-orange-soft">
                <span className="criteria-tag">Kriteria 3</span>
                <h4>Status Rumah & Alamat</h4>
              </div>
              <div className="criteria-content">
                <div className="info-row">
                  <span className="info-label">Status Tempat Tinggal:</span>
                  <span className="badge badge-orange font-bold">{student.status_rumah}</span>
                </div>
                <div className="info-row vertical">
                  <span className="info-label">Alamat Saat Ini:</span>
                  <span className="address-text">{student.alamat_lengkap}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Kelurahan / Desa:</span>
                  <span>{student.kelurahan_desa || '-'}, Kec. {student.kecamatan || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Kota / Kab:</span>
                  <span>{student.kota_kabupaten || '-'}, {student.provinsi || '-'}</span>
                </div>
                <div className="maps-button-row">
                  <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="btn-maps">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Buka Alamat di Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* VERIFIKASI ADMIN */}
          <div className="admin-verification-box">
            <h4>Verifikasi & Catatan Admin</h4>
            <div className="verification-form-row">
              <div className="verif-col">
                <label>Status Verifikasi:</label>
                <select
                  value={verifikasi}
                  onChange={(e) => setVerifikasi(e.target.value)}
                  className="select-verif"
                >
                  <option value="Menunggu">Menunggu Verifikasi</option>
                  <option value="Terverifikasi">Terverifikasi (Valid & Memenuhi Syarat)</option>
                  <option value="Perlu Revisi">Perlu Revisi (Data / Foto Kurang Jelas)</option>
                </select>
              </div>

              <div className="verif-col full">
                <label>Catatan Admin / Rekomendasi Bantuan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Direkomendasikan beasiswa KIP & subsidi SPP bulanan..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                />
              </div>

              <div className="verif-btn-col">
                <button
                  type="button"
                  className="btn-save-verif"
                  onClick={handleSaveStatus}
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Status'}
                </button>
              </div>
            </div>

            {saveSuccess && (
              <p className="save-success-msg">Status verifikasi berhasil diperbarui.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

