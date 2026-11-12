import React, { useState } from 'react';
import { createStudent } from '../services/api';

export default function StudentForm({ currentUser, onStudentSubmitted, onOpenProof }) {
  const [formData, setFormData] = useState({
    nama_lengkap: currentUser?.name || '',
    nisn: currentUser?.nisn || '',
    nik: '',
    kelas: 'X',
    jurusan: 'Rekayasa Perangkat Lunak',
    jenis_kelamin: 'Laki-laki',
    no_hp: '',
    nama_ayah: '',
    pekerjaan_ayah: '',
    penghasilan_ayah: '',
    nama_ibu: '',
    pekerjaan_ibu: '',
    penghasilan_ibu: '',
    status_keluarga: 'Lengkap',
    kategori_ekonomi: 'Kurang Mampu',
    penghasilan_total: '',
    jumlah_tanggungan: '2',
    penerima_bantuan: 'Tidak Ada',
    status_rumah: 'Milik Sendiri',
    alamat_lengkap: '',
    kelurahan_desa: '',
    kecamatan: '',
    kota_kabupaten: 'Bandung',
    provinsi: 'Jawa Barat',
    foto_rumah: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Hitung total penghasilan otomatis jika ayah/ibu berubah
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (name === 'penghasilan_ayah' || name === 'penghasilan_ibu') {
      const ayah = parseFloat(name === 'penghasilan_ayah' ? value : formData.penghasilan_ayah) || 0;
      const ibu = parseFloat(name === 'penghasilan_ibu' ? value : formData.penghasilan_ibu) || 0;
      const total = ayah + ibu;
      updated.penghasilan_total = total > 0 ? total.toString() : '';

      // Rekomendasikan kategori ekonomi otomatis
      if (total > 0 && total <= 1000000) {
        updated.kategori_ekonomi = 'Sangat Kurang';
      } else if (total > 1000000 && total <= 3000000) {
        updated.kategori_ekonomi = 'Kurang Mampu';
      } else if (total > 3000000 && total <= 5000000) {
        updated.kategori_ekonomi = 'Menengah';
      } else if (total > 5000000) {
        updated.kategori_ekonomi = 'Mampu';
      }
    }

    // Jika status keluarga yatim/piatu, beri helper teks
    if (name === 'status_keluarga') {
      if (value === 'Yatim') {
        updated.pekerjaan_ayah = 'Meninggal Dunia';
        updated.penghasilan_ayah = '0';
      } else if (value === 'Piatu') {
        updated.pekerjaan_ibu = 'Meninggal Dunia';
        updated.penghasilan_ibu = '0';
      } else if (value === 'Yatim Piatu') {
        updated.pekerjaan_ayah = 'Meninggal Dunia';
        updated.pekerjaan_ibu = 'Meninggal Dunia';
        updated.penghasilan_ayah = '0';
        updated.penghasilan_ibu = '0';
      }
    }

    setFormData(updated);
  };

  // Upload foto rumah dengan base64 preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file foto (JPG, PNG, atau WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, foto_rumah: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.nama_lengkap.trim()) {
      setErrorMessage('Nama lengkap siswa wajib diisi.');
      return;
    }
    if (!formData.nisn.trim()) {
      setErrorMessage('NISN siswa wajib diisi.');
      return;
    }
    if (!formData.alamat_lengkap.trim()) {
      setErrorMessage('Alamat lengkap saat ini wajib diisi.');
      return;
    }
    if (!formData.foto_rumah) {
      setErrorMessage('Foto terbaru rumah wajib diunggah untuk verifikasi kondisi tempat tinggal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStudent(formData);
      if (res.success) {
        setSubmitSuccess(true);
        setSubmittedData(res.data);
        if (onStudentSubmitted) onStudentSubmitted(res.data);
      } else {
        setErrorMessage(res.message || 'Gagal menyimpan data.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      nama_lengkap: currentUser?.name || '',
      nisn: currentUser?.nisn || '',
      nik: '',
      kelas: 'X',
      jurusan: 'Rekayasa Perangkat Lunak',
      jenis_kelamin: 'Laki-laki',
      no_hp: '',
      nama_ayah: '',
      pekerjaan_ayah: '',
      penghasilan_ayah: '',
      nama_ibu: '',
      pekerjaan_ibu: '',
      penghasilan_ibu: '',
      status_keluarga: 'Lengkap',
      kategori_ekonomi: 'Kurang Mampu',
      penghasilan_total: '',
      jumlah_tanggungan: '2',
      penerima_bantuan: 'Tidak Ada',
      status_rumah: 'Milik Sendiri',
      alamat_lengkap: '',
      kelurahan_desa: '',
      kecamatan: '',
      kota_kabupaten: 'Bandung',
      provinsi: 'Jawa Barat',
      foto_rumah: '',
    });
    setImagePreview(null);
    setSubmitSuccess(false);
    setSubmittedData(null);
  };

  return (
    <div className="form-page-container">
      {/* Banner / Header Info */}
      <div className="page-header-card">
        <div className="header-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>PORTAL PENDATAAN SISWA</span>
        </div>
        <h1>Formulir Pendataan Kondisi Orang Tua, Ekonomi & Rumah</h1>
        <p>
          Silakan isi data diri, kondisi ekonomi orang tua, alamat saat ini, serta unggah <strong>foto terbaru rumah</strong> Anda. 
          Data ini digunakan oleh pihak sekolah untuk verifikasi kondisi sosial ekonomi dan penyaluran bantuan/beasiswa.
        </p>
      </div>

      {submitSuccess && submittedData ? (
        <div className="success-card">
          <div className="success-icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Data Siswa Berhasil Disimpan!</h2>
          <p>
            Terima kasih <strong>{submittedData.nama_lengkap}</strong> (NISN: {submittedData.nisn}). 
            Data kondisi orang tua, ekonomi ({submittedData.kategori_ekonomi}), dan status rumah ({submittedData.status_rumah}) telah tercatat di sistem admin.
          </p>

          <div className="success-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => onOpenProof && onOpenProof(submittedData)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>Cetak / Lihat Bukti Tanda Terima</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetForm}
            >
              Input Data Siswa Lain
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="student-form">
          {errorMessage && (
            <div className="alert-box error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* BAGIAN 1: BIODATA SISWA */}
          <div className="form-section">
            <div className="section-title">
              <span className="step-num">1</span>
              <div>
                <h3>Data Diri Siswa</h3>
                <p>Identitas pokok siswa terdaftar di sekolah</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Nama Lengkap Siswa <span className="req">*</span></label>
                <input
                  type="text"
                  name="nama_lengkap"
                  placeholder="Masukkan nama lengkap siswa"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>NISN Siswa <span className="req">*</span></label>
                <input
                  type="text"
                  name="nisn"
                  placeholder="Masukkan 10 digit NISN siswa"
                  value={formData.nisn}
                  onChange={handleChange}
                  maxLength={15}
                  required
                />
              </div>

              <div className="form-group">
                <label>No. HP / WhatsApp Siswa</label>
                <input
                  type="tel"
                  name="no_hp"
                  placeholder="Masukkan nomor HP/WhatsApp"
                  value={formData.no_hp}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Kelas</label>
                <select name="kelas" value={formData.kelas} onChange={handleChange}>
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>

              <div className="form-group">
                <label>Jurusan</label>
                <input
                  type="text"
                  name="jurusan"
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  value={formData.jurusan}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Jenis Kelamin</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value="Laki-laki"
                      checked={formData.jenis_kelamin === 'Laki-laki'}
                      onChange={handleChange}
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value="Perempuan"
                      checked={formData.jenis_kelamin === 'Perempuan'}
                      onChange={handleChange}
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 2: KONDISI ORANG TUA & STATUS KELUARGA */}
          <div className="form-section">
            <div className="section-title">
              <span className="step-num">2</span>
              <div>
                <h3>Kondisi Orang Tua & Status Keluarga</h3>
                <p>Kriteria kondisi keluarga untuk penetapan prioritas sosial</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width highlight-group">
                <label>Status Keberadaan Keluarga / Orang Tua <span className="req">*</span></label>
                <select 
                  name="status_keluarga" 
                  value={formData.status_keluarga} 
                  onChange={handleChange}
                  className="select-emphasis"
                >
                  <option value="Lengkap">Orang Tua Lengkap (Ayah & Ibu masih ada)</option>
                  <option value="Yatim">Yatim (Ayah telah meninggal dunia)</option>
                  <option value="Piatu">Piatu (Ibu telah meninggal dunia)</option>
                  <option value="Yatim Piatu">Yatim Piatu (Ayah & Ibu telah meninggal dunia)</option>
                  <option value="Bersama Wali">Tinggal Bersama Wali / Keluarga Lain</option>
                </select>
                <small className="hint-text">
                  Kriteria status keluarga akan menjadi filter prioritas utama di dashboard admin.
                </small>
              </div>

              {/* Data Ayah */}
              <div className="form-group">
                <label>Nama Ayah</label>
                <input
                  type="text"
                  name="nama_ayah"
                  placeholder={formData.status_keluarga === 'Yatim' || formData.status_keluarga === 'Yatim Piatu' ? 'Almarhum Ayah' : 'Nama Ayah Kandung'}
                  value={formData.nama_ayah}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Pekerjaan Ayah</label>
                <input
                  type="text"
                  name="pekerjaan_ayah"
                  placeholder="Contoh: Buruh Tani, Driver Ojol, Wiraswasta"
                  value={formData.pekerjaan_ayah}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Penghasilan Ayah per Bulan (Rp)</label>
                <input
                  type="number"
                  name="penghasilan_ayah"
                  placeholder="0 jika sudah tiada atau tidak bekerja"
                  value={formData.penghasilan_ayah}
                  onChange={handleChange}
                />
              </div>

              {/* Data Ibu */}
              <div className="form-group">
                <label>Nama Ibu</label>
                <input
                  type="text"
                  name="nama_ibu"
                  placeholder={formData.status_keluarga === 'Piatu' || formData.status_keluarga === 'Yatim Piatu' ? 'Almarhumah Ibu' : 'Nama Ibu Kandung'}
                  value={formData.nama_ibu}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Pekerjaan Ibu</label>
                <input
                  type="text"
                  name="pekerjaan_ibu"
                  placeholder="Contoh: Ibu Rumah Tangga, Buruh Cuci, Pedagang"
                  value={formData.pekerjaan_ibu}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Penghasilan Ibu per Bulan (Rp)</label>
                <input
                  type="number"
                  name="penghasilan_ibu"
                  placeholder="0 jika tidak berpenghasilan"
                  value={formData.penghasilan_ibu}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 3: KONDISI EKONOMI */}
          <div className="form-section">
            <div className="section-title">
              <span className="step-num">3</span>
              <div>
                <h3>Kondisi Ekonomi Keluarga</h3>
                <p>Data penghasilan, tanggungan, dan kepemilikan bansos</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Total Penghasilan Gabungan Keluarga (Rp/bln)</label>
                <input
                  type="number"
                  name="penghasilan_total"
                  placeholder="Total penghasilan dalam sebulan"
                  value={formData.penghasilan_total}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Kategori Kondisi Ekonomi <span className="req">*</span></label>
                <select name="kategori_ekonomi" value={formData.kategori_ekonomi} onChange={handleChange} className="select-emphasis">
                  <option value="Sangat Kurang">Sangat Kurang (&lt; Rp 1.000.000)</option>
                  <option value="Kurang Mampu">Kurang Mampu (Rp 1.000.000 - Rp 3.000.000)</option>
                  <option value="Menengah">Menengah (Rp 3.000.000 - Rp 5.000.000)</option>
                  <option value="Mampu">Mampu (&gt; Rp 5.000.000)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Jumlah Tanggungan Anak dalam Keluarga</label>
                <input
                  type="number"
                  name="jumlah_tanggungan"
                  placeholder="Contoh: 3 anak"
                  value={formData.jumlah_tanggungan}
                  onChange={handleChange}
                  min={1}
                />
              </div>

              <div className="form-group">
                <label>Penerima Bantuan Pemerintah Saat Ini</label>
                <select name="penerima_bantuan" value={formData.penerima_bantuan} onChange={handleChange}>
                  <option value="Tidak Ada">Tidak Ada / Belum Menerima</option>
                  <option value="KIP">KIP (Kartu Indonesia Pintar)</option>
                  <option value="PKH">PKH (Program Keluarga Harapan)</option>
                  <option value="KKS">KKS (Kartu Keluarga Sejahtera)</option>
                </select>
              </div>
            </div>
          </div>

          {/* BAGIAN 4: ALAMAT SAAT INI & FOTO TERBARU RUMAH */}
          <div className="form-section">
            <div className="section-title">
              <span className="step-num">4</span>
              <div>
                <h3>Alamat Saat Ini & Foto Terbaru Rumah</h3>
                <p>Sesuai kriteria: siswa memasukkan alamat saat ini dan foto terbaru rumah</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width highlight-group">
                <label>Status Kepemilikan Rumah Tinggal <span className="req">*</span></label>
                <select name="status_rumah" value={formData.status_rumah} onChange={handleChange} className="select-emphasis">
                  <option value="Milik Sendiri">Milik Sendiri</option>
                  <option value="Sewa/Kontrak">Sewa / Kontrak</option>
                  <option value="Menumpang">Menumpang (Keluarga / Saudara)</option>
                  <option value="Rumah Dinas">Rumah Dinas / Mess</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Alamat Lengkap Tempat Tinggal Saat Ini <span className="req">*</span></label>
                <textarea
                  name="alamat_lengkap"
                  rows={3}
                  placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, dan patokan lokasi saat ini..."
                  value={formData.alamat_lengkap}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Kelurahan / Desa</label>
                <input
                  type="text"
                  name="kelurahan_desa"
                  placeholder="Contoh: Sukajadi"
                  value={formData.kelurahan_desa}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Kecamatan</label>
                <input
                  type="text"
                  name="kecamatan"
                  placeholder="Contoh: Sukajadi"
                  value={formData.kecamatan}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Kota / Kabupaten</label>
                <input
                  type="text"
                  name="kota_kabupaten"
                  placeholder="Contoh: Bandung"
                  value={formData.kota_kabupaten}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Provinsi</label>
                <input
                  type="text"
                  name="provinsi"
                  placeholder="Contoh: Jawa Barat"
                  value={formData.provinsi}
                  onChange={handleChange}
                />
              </div>

              {/* UPLOAD FOTO TERBARU RUMAH */}
              <div className="form-group full-width photo-upload-box">
                <label className="photo-label">
                  Foto Terbaru Rumah (Tampak Depan / Kondisi Rumah) <span className="req">*</span>
                </label>
                <p className="photo-subtext">
                  Foto ini akan dilihat oleh admin untuk memvalidasi kondisi tempat tinggal siswa sesuai kriteria.
                </p>

                <div className="upload-container">
                  {imagePreview ? (
                    <div className="image-preview-wrapper">
                      <img src={imagePreview} alt="Pratinjau Rumah Siswa" className="house-preview-img" />
                      <div className="preview-overlay">
                        <label className="btn-change-photo">
                          Ganti Foto
                          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, foto_rumah: '' })); }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <p className="drop-title">Pilih atau Seret Foto Rumah Anda ke Sini</p>
                      <p className="drop-desc">Mendukung format JPG, PNG, WEBP (Maksimal 5MB)</p>
                      <div className="dropzone-buttons">
                        <label className="btn-upload">
                          Pilih File Foto
                          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="form-footer">
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Menyimpan Data Siswa...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Kirim Data Siswa & Foto Rumah</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

