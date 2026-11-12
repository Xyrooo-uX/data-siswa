import React, { useState, useMemo } from 'react';
import { calculateStats, updateStudent, deleteStudent } from '../services/api';

export default function AdminDashboard({
  students = [],
  onSelectStudent,
  onRefreshData
}) {
  // Filter States sesuai kriteria:
  // 1. Ekonomi
  // 2. Status Keluarga
  // 3. Status Rumah
  const [filterEkonomi, setFilterEkonomi] = useState('Semua');
  const [filterKeluarga, setFilterKeluarga] = useState('Semua');
  const [filterRumah, setFilterRumah] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (kartu foto) atau 'table'

  // Hitung ringkasan statistik
  const stats = useMemo(() => calculateStats(students), [students]);

  // Filter siswa sesuai kriteria
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. Filter Ekonomi
      if (filterEkonomi !== 'Semua' && student.kategori_ekonomi !== filterEkonomi) {
        return false;
      }

      // 2. Filter Status Keluarga
      if (filterKeluarga !== 'Semua') {
        if (filterKeluarga === 'Bersama Wali') {
          if (student.status_keluarga !== 'Bersama Wali' && student.status_keluarga !== 'Menumpang') return false;
        } else if (student.status_keluarga !== filterKeluarga) {
          return false;
        }
      }

      // 3. Filter Status Rumah
      if (filterRumah !== 'Semua' && student.status_rumah !== filterRumah) {
        return false;
      }

      // 4. Pencarian Teks
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = student.nama_lengkap?.toLowerCase().includes(q);
        const matchNisn = student.nisn?.includes(q);
        const matchClass = student.kelas?.toLowerCase().includes(q);
        const matchCity = student.kota_kabupaten?.toLowerCase().includes(q);
        const matchAddress = student.alamat_lengkap?.toLowerCase().includes(q);
        return matchName || matchNisn || matchClass || matchCity || matchAddress;
      }

      return true;
    });
  }, [students, filterEkonomi, filterKeluarga, filterRumah, searchQuery]);

  // Reset semua filter
  const handleResetFilters = () => {
    setFilterEkonomi('Semua');
    setFilterKeluarga('Semua');
    setFilterRumah('Semua');
    setSearchQuery('');
  };

  // Tindakan cepat verifikasi
  const handleQuickStatusChange = async (e, id, newStatus) => {
    e.stopPropagation();
    await updateStudent(id, { status_verifikasi: newStatus });
    if (onRefreshData) onRefreshData();
  };

  // Hapus data
  const handleDelete = async (e, id, nama) => {
    e.stopPropagation();
    if (window.confirm(`Yakin ingin menghapus data siswa ${nama}?`)) {
      await deleteStudent(id);
      if (onRefreshData) onRefreshData();
    }
  };

  // Ekspor CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      alert('Tidak ada data siswa untuk diekspor.');
      return;
    }

    const headers = [
      'No', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Status Keluarga',
      'Kategori Ekonomi', 'Penghasilan Total', 'Bantuan', 'Status Rumah',
      'Alamat Saat Ini', 'Kota/Kabupaten', 'Status Verifikasi'
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `'${s.nisn}`,
      `"${s.nama_lengkap}"`,
      `"${s.kelas}"`,
      `"${s.jurusan}"`,
      `"${s.status_keluarga}"`,
      `"${s.kategori_ekonomi}"`,
      s.penghasilan_total || 0,
      `"${s.penerima_bantuan}"`,
      `"${s.status_rumah}"`,
      `"${s.alamat_lengkap.replace(/"/g, '""')}"`,
      `"${s.kota_kabupaten}"`,
      `"${s.status_verifikasi}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_kondisi_siswa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cetak Rekapitulasi Laporan
  const handlePrint = () => {
    window.print();
  };

  // Helper badge warna
  const getEkonomiBadgeClass = (val) => {
    switch (val) {
      case 'Sangat Kurang': return 'badge-danger';
      case 'Kurang Mampu': return 'badge-warning';
      case 'Menengah': return 'badge-info';
      case 'Mampu': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getKeluargaBadgeClass = (val) => {
    switch (val) {
      case 'Yatim Piatu': return 'badge-purple';
      case 'Yatim': return 'badge-amber';
      case 'Piatu': return 'badge-blue';
      case 'Bersama Wali': return 'badge-teal';
      default: return 'badge-neutral';
    }
  };

  const getRumahBadgeClass = (val) => {
    switch (val) {
      case 'Sewa/Kontrak': return 'badge-orange';
      case 'Menumpang': return 'badge-red';
      case 'Rumah Dinas': return 'badge-indigo';
      default: return 'badge-emerald';
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header Dashboard */}
      <div className="dashboard-header">
        <div>
          <div className="header-badge admin-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>HALAMAN ADMINISTRATOR</span>
          </div>
          <h2>Monitoring & Verifikasi Kondisi Siswa</h2>
          <p>
            Filter dan analisis kondisi siswa berdasarkan <strong>Kondisi Ekonomi</strong>, <strong>Status Keluarga</strong>, dan <strong>Status Rumah</strong> beserta verifikasi foto tempat tinggal terkini.
          </p>
        </div>

        <div className="dashboard-top-actions">
          <button type="button" onClick={handleExportCSV} className="btn-action-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Ekspor CSV</span>
          </button>
          <button type="button" onClick={handlePrint} className="btn-action-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* STATISTIK CARDS */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Siswa Terdaftar</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-note">Data masuk</span>
          </div>
        </div>

        <div className="stat-card highlight-card">
          <div className="stat-icon bg-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="20"></line><line x1="12" y1="4" x2="12" y2="6"></line></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Ekonomi Kurang Mampu</span>
            <span className="stat-value">{stats.ekonomi.sangatKurang + stats.ekonomi.kurangMampu}</span>
            <span className="stat-note">{stats.ekonomi.sangatKurang} Sangat Kurang | {stats.ekonomi.kurangMampu} Kurang</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Yatim / Piatu / Wali</span>
            <span className="stat-value">{stats.statusKeluarga.yatim + stats.statusKeluarga.piatu + stats.statusKeluarga.yatimPiatu + stats.statusKeluarga.wali}</span>
            <span className="stat-note">{stats.statusKeluarga.yatimPiatu} Yatim Piatu | {stats.statusKeluarga.yatim} Yatim</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Rumah Sewa / Menumpang</span>
            <span className="stat-value">{stats.statusRumah.sewa + stats.statusRumah.menumpang}</span>
            <span className="stat-note">{stats.statusRumah.sewa} Sewa | {stats.statusRumah.menumpang} Menumpang</span>
          </div>
        </div>
      </div>

      {/* FILTER SECTION SESUAI KRITERIA */}
      <div className="filter-panel-card">
        <div className="filter-panel-title">
          <div className="filter-title-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <strong>Filter Kondisi Siswa (Kriteria Sistem):</strong>
          </div>
          <div className="filter-title-right">
            <span>Ditemukan <strong>{filteredStudents.length}</strong> dari {students.length} siswa</span>
            {(filterEkonomi !== 'Semua' || filterKeluarga !== 'Semua' || filterRumah !== 'Semua' || searchQuery) && (
              <button type="button" onClick={handleResetFilters} className="btn-text-reset">
                Reset Filter
              </button>
            )}
          </div>
        </div>

        <div className="filters-grid">
          {/* 1. FILTER EKONOMI */}
          <div className="filter-item">
            <label>1. Kondisi Ekonomi</label>
            <select
              value={filterEkonomi}
              onChange={(e) => setFilterEkonomi(e.target.value)}
              className="filter-select"
            >
              <option value="Semua">Semua Kategori Ekonomi</option>
              <option value="Sangat Kurang">Sangat Kurang (&lt; 1 Jt)</option>
              <option value="Kurang Mampu">Kurang Mampu (1 - 3 Jt)</option>
              <option value="Menengah">Menengah (3 - 5 Jt)</option>
              <option value="Mampu">Mampu (&gt; 5 Jt)</option>
            </select>
          </div>

          {/* 2. FILTER STATUS KELUARGA */}
          <div className="filter-item">
            <label>2. Status Keluarga</label>
            <select
              value={filterKeluarga}
              onChange={(e) => setFilterKeluarga(e.target.value)}
              className="filter-select"
            >
              <option value="Semua">Semua Status Keluarga</option>
              <option value="Lengkap">Orang Tua Lengkap</option>
              <option value="Yatim">Yatim (Ayah Tiada)</option>
              <option value="Piatu">Piatu (Ibu Tiada)</option>
              <option value="Yatim Piatu">Yatim Piatu</option>
              <option value="Bersama Wali">Bersama Wali / Kerabat</option>
            </select>
          </div>

          {/* 3. FILTER STATUS RUMAH */}
          <div className="filter-item">
            <label>3. Status Rumah</label>
            <select
              value={filterRumah}
              onChange={(e) => setFilterRumah(e.target.value)}
              className="filter-select"
            >
              <option value="Semua">Semua Status Rumah</option>
              <option value="Milik Sendiri">Milik Sendiri</option>
              <option value="Sewa/Kontrak">Sewa / Kontrak</option>
              <option value="Menumpang">Menumpang</option>
              <option value="Rumah Dinas">Rumah Dinas / Mess</option>
            </select>
          </div>

          {/* PENCARIAN TEKS */}
          <div className="filter-item search-item">
            <label>Cari Siswa</label>
            <div className="search-input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                placeholder="Cari nama, NISN, kelas, alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="view-mode-bar">
          <div className="active-filter-tags">
            {filterEkonomi !== 'Semua' && (
              <span className="tag-pill">Ekonomi: {filterEkonomi}</span>
            )}
            {filterKeluarga !== 'Semua' && (
              <span className="tag-pill">Keluarga: {filterKeluarga}</span>
            )}
            {filterRumah !== 'Semua' && (
              <span className="tag-pill">Rumah: {filterRumah}</span>
            )}
          </div>

          <div className="view-switcher-buttons">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Tampilan Kartu Foto Rumah"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Kartu Foto</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel Data"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              <span>Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* HASIL DATA SISWA */}
      {students.length === 0 ? (
        <div className="empty-state-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <h3>Belum Ada Data Siswa yang Masuk</h3>
          <p>Belum ada data siswa yang diinputkan. Silakan tambahkan data siswa melalui formulir pendaftaran siswa.</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <h3>Tidak Ada Data Siswa yang Cocok</h3>
          <p>Coba sesuaikan filter ekonomi, status keluarga, status rumah, atau kata kunci pencarian Anda.</p>
          <button type="button" onClick={handleResetFilters} className="btn-secondary">
            Kembalikan Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* MODE KARTU DENGAN FOTO TERBARU RUMAH */
        <div className="students-grid">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="student-card"
              onClick={() => onSelectStudent && onSelectStudent(student)}
            >
              {/* Gambar Foto Rumah Siswa */}
              <div className="card-image-box">
                {student.foto_rumah ? (
                  <img src={student.foto_rumah} alt={`Foto rumah ${student.nama_lengkap}`} className="card-house-img" />
                ) : (
                  <div className="no-photo-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <span>Tidak ada foto</span>
                  </div>
                )}
                {/* Status Rumah Badge di atas foto */}
                <span className={`badge-overlay ${getRumahBadgeClass(student.status_rumah)}`}>
                  {student.status_rumah}
                </span>

                {/* Status Verifikasi Badge */}
                <span className={`badge-verification ${student.status_verifikasi === 'Terverifikasi' ? 'verified' : student.status_verifikasi === 'Perlu Revisi' ? 'revision' : 'pending'}`}>
                  {student.status_verifikasi || 'Menunggu'}
                </span>
              </div>

              {/* Konten Kartu Siswa */}
              <div className="card-body">
                <div className="card-header-info">
                  <h4 className="student-name">{student.nama_lengkap}</h4>
                  <span className="student-sub">
                    {student.kelas} | NISN: {student.nisn}
                  </span>
                </div>

                {/* Badges 3 Kriteria Utama */}
                <div className="card-badges-row">
                  <span className={`badge ${getEkonomiBadgeClass(student.kategori_ekonomi)}`} title="Kondisi Ekonomi">
                    {student.kategori_ekonomi}
                  </span>
                  <span className={`badge ${getKeluargaBadgeClass(student.status_keluarga)}`} title="Status Keluarga">
                    {student.status_keluarga}
                  </span>
                  {student.penerima_bantuan && student.penerima_bantuan !== 'Tidak Ada' && (
                    <span className="badge badge-help" title="Bantuan Sosial">
                      Bantuan: {student.penerima_bantuan}
                    </span>
                  )}
                </div>

                {/* Info Alamat & Orang Tua */}
                <div className="card-details-box">
                  <div className="detail-line">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span className="truncate">{student.alamat_lengkap}, {student.kota_kabupaten}</span>
                  </div>
                  <div className="detail-line">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    <span>Penghasilan: Rp {Number(student.penghasilan_total || 0).toLocaleString('id-ID')} / bln ({student.jumlah_tanggungan || 1} tanggungan)</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="card-footer-actions">
                  <button
                    type="button"
                    className="btn-card-detail"
                    onClick={(e) => { e.stopPropagation(); onSelectStudent(student); }}
                  >
                    <span>Lihat Detail & Foto</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>

                  <div className="card-quick-btn-group">
                    {student.status_verifikasi !== 'Terverifikasi' && (
                      <button
                        type="button"
                        className="btn-icon-approve"
                        title="Verifikasi data ini"
                        onClick={(e) => handleQuickStatusChange(e, student.id, 'Terverifikasi')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-icon-delete"
                      title="Hapus data"
                      onClick={(e) => handleDelete(e, student.id, student.nama_lengkap)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MODE TABEL DATA */
        <div className="table-responsive-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foto Rumah</th>
                <th>Siswa & NISN</th>
                <th>Kelas</th>
                <th>1. Kondisi Ekonomi</th>
                <th>2. Status Keluarga</th>
                <th>3. Status Rumah</th>
                <th>Alamat Saat Ini</th>
                <th>Status Verifikasi</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} onClick={() => onSelectStudent && onSelectStudent(student)} className="clickable-row">
                  <td className="table-img-cell">
                    {student.foto_rumah ? (
                      <img src={student.foto_rumah} alt="Foto Rumah" className="table-thumb-img" />
                    ) : (
                      <span className="no-photo-badge">Tanpa foto</span>
                    )}
                  </td>
                  <td>
                    <strong>{student.nama_lengkap}</strong>
                    <div className="table-subtext">NISN: {student.nisn}</div>
                  </td>
                  <td>{student.kelas}</td>
                  <td>
                    <span className={`badge ${getEkonomiBadgeClass(student.kategori_ekonomi)}`}>
                      {student.kategori_ekonomi}
                    </span>
                    <div className="table-subtext">
                      Rp {Number(student.penghasilan_total || 0).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getKeluargaBadgeClass(student.status_keluarga)}`}>
                      {student.status_keluarga}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getRumahBadgeClass(student.status_rumah)}`}>
                      {student.status_rumah}
                    </span>
                  </td>
                  <td className="max-w-address">
                    <span className="truncate">{student.alamat_lengkap}, {student.kota_kabupaten}</span>
                  </td>
                  <td>
                    <span className={`badge-verification ${student.status_verifikasi === 'Terverifikasi' ? 'verified' : student.status_verifikasi === 'Perlu Revisi' ? 'revision' : 'pending'}`}>
                      {student.status_verifikasi || 'Menunggu'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="table-actions-inline" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onSelectStudent(student)}
                        title="Lihat Detail"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      </button>
                      <button
                        type="button"
                        className="btn-table-action delete"
                        onClick={(e) => handleDelete(e, student.id, student.nama_lengkap)}
                        title="Hapus"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

