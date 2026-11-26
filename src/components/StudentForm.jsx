import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { createStudent } from '../services/api';
import { fetchDistricts, fetchProvinces, fetchRegencies, fetchVillages } from '../services/indonesiaRegions';
import LocationMapPicker from './LocationMapPicker';

const DEFAULT_MAP_CENTER = [-2.5, 118];

function SearchableRegionSelect({ id, label, required = false, options, value, placeholder, disabled, loading, onSelect }) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions = options.filter((option) => option.label.toLocaleLowerCase('id-ID').includes(query.toLocaleLowerCase('id-ID')));

  const selectOption = (option) => {
    onSelect(option.id);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      event.preventDefault();
      selectOption(filteredOptions[0]);
    }
  };

  return (
    <div className="searchable-region-select">
      <label htmlFor={id}>
        {label} {required && <span className="req">*</span>}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-required={required}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        autoComplete="off"
        placeholder={loading ? 'Memuat daftar wilayah...' : placeholder}
        value={isOpen ? query : value}
        disabled={disabled}
        onFocus={() => {
          setQuery('');
          setIsOpen(true);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          onSelect('');
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setIsOpen(false);
        }}
      />
      {isOpen && !disabled && (
        <div className="searchable-region-options" id={`${id}-options`} role="listbox" aria-label={label}>
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={option.label === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
            >
              {option.label}
            </button>
          )) : (
            <span className="searchable-region-empty">{loading ? 'Memuat daftar wilayah...' : 'Wilayah tidak ditemukan'}</span>
          )}
        </div>
      )}
    </div>
  );
}

function formatRegionName(name) {
  const formatted = name
    .toLocaleLowerCase('id-ID')
    .replace(/(^|[\s/-])(\p{L})/gu, (_, separator, letter) => `${separator}${letter.toLocaleUpperCase('id-ID')}`);

  return formatted.replace(/^Dki /, 'DKI ').replace(/^Di /, 'DI ');
}

export default function StudentForm({ currentUser, onStudentSubmitted, onOpenProof }) {
  const [formData, setFormData] = useState({
    nama_lengkap: currentUser?.name || '',
    nisn: currentUser?.nisn || '',
    nik: '',
    kelas: '',
    jurusan: '',
    jenis_kelamin: '',
    no_hp: '',
    nama_ayah: '',
    pekerjaan_ayah: '',
    penghasilan_ayah: '',
    nama_ibu: '',
    pekerjaan_ibu: '',
    penghasilan_ibu: '',
    status_keluarga: '',
    kategori_ekonomi: '',
    penghasilan_total: '',
    jumlah_tanggungan: '',
    penerima_bantuan: 'Belum di isi',
    status_rumah: '',
    alamat_lengkap: '',
    kelurahan_desa: '',
    kecamatan: '',
    kota_kabupaten: '',
    provinsi: '',
    rt: '',
    rw: '',
    blok: '',
    nomor_rumah: '',
    latitude: null,
    longitude: null,
    foto_rumah: '',
  });

  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [provinceId, setProvinceId] = useState('');
  const [regencyId, setRegencyId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [regionError, setRegionError] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(5);
  const [locationStatus, setLocationStatus] = useState('');
  const [addressSource, setAddressSource] = useState('manual');
  const reverseGeocodeController = useRef(null);
  const addressGeocodeController = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchProvinces(controller.signal)
      .then(setProvinces)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          toast.error(error.message || 'Gagal memuat data wilayah.', { id: 'region-load-error' });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingProvinces(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!provinceId) {
      return undefined;
    }

    const controller = new AbortController();
    fetchRegencies(provinceId, controller.signal)
      .then(setRegencies)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setRegencies([]);
          setRegionError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingRegencies(false);
      });

    return () => controller.abort();
  }, [provinceId]);

  useEffect(() => {
    if (!regencyId) return undefined;

    const controller = new AbortController();
    fetchDistricts(regencyId, controller.signal)
      .then(setDistricts)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setDistricts([]);
          setRegionError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingDistricts(false);
      });

    return () => controller.abort();
  }, [regencyId]);

  useEffect(() => {
    if (!districtId) return undefined;

    const controller = new AbortController();
    fetchVillages(districtId, controller.signal)
      .then(setVillages)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setVillages([]);
          setRegionError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingVillages(false);
      });

    return () => controller.abort();
  }, [districtId]);

  useEffect(() => {
    if (addressSource !== 'manual') return undefined;
    if (!formData.alamat_lengkap.trim() && (!formData.provinsi || !formData.kota_kabupaten)) {
      return undefined;
    }

    const controller = new AbortController();
    addressGeocodeController.current = controller;
    const addressQuery = [
      formData.alamat_lengkap.trim(),
      formData.kota_kabupaten,
      formData.provinsi,
      'Indonesia'
    ].filter(Boolean).join(', ');
    const timeoutId = setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          format: 'jsonv2',
          limit: '1',
          q: addressQuery
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Alamat tidak dapat dicari pada peta. Periksa koneksi internet atau lengkapi alamat secara manual.');

        const results = await response.json();
        if (!results.length) {
          if (formData.alamat_lengkap.trim()) {
            setLocationStatus('Alamat tidak ditemukan pada peta. Periksa kembali alamat atau pilih titik secara manual.');
          }
          return;
        }

        const result = results[0];
        const latitude = Number(result.lat);
        const longitude = Number(result.lon);
        setMapCenter([latitude, longitude]);
        setMapZoom(formData.alamat_lengkap.trim() ? 17 : 12);
        if (formData.alamat_lengkap.trim()) {
          setFormData((previous) => ({ ...previous, latitude, longitude }));
          setLocationStatus('Pin peta diarahkan ke alamat yang diketik.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') setLocationStatus(error.message);
      }
    }, 1200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [addressSource, formData.alamat_lengkap, formData.kota_kabupaten, formData.provinsi]);

  useEffect(() => () => {
    reverseGeocodeController.current?.abort();
    addressGeocodeController.current?.abort();
  }, []);

  // Hitung total penghasilan otomatis jika ayah/ibu berubah
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'alamat_lengkap') {
      setAddressSource('manual');
      setLocationStatus(value.trim() ? 'Mencari alamat yang diketik pada peta...' : '');
      addressGeocodeController.current?.abort();
      reverseGeocodeController.current?.abort();
      setFormData((previous) => ({
        ...previous,
        alamat_lengkap: value
      }));
      return;
    }

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

  const handleProvinceChange = (id) => {
    const selectedProvince = provinces.find((province) => province.id === id);
    setProvinceId(id);
    setRegencyId('');
    setDistrictId('');
    setIsLoadingRegencies(Boolean(id));
    setIsLoadingDistricts(false);
    setIsLoadingVillages(false);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    setRegionError('');
    setLocationStatus('');
    setFormData((previous) => ({
      ...previous,
      provinsi: selectedProvince ? formatRegionName(selectedProvince.name) : '',
      kota_kabupaten: '',
      kecamatan: '',
      kelurahan_desa: ''
    }));
  };

  const handleRegencyChange = (id) => {
    const selectedRegency = regencies.find((regency) => regency.id === id);
    setRegencyId(id);
    setDistrictId('');
    setIsLoadingDistricts(Boolean(id));
    setIsLoadingVillages(false);
    setDistricts([]);
    setVillages([]);
    setRegionError('');
    setLocationStatus('');
    setFormData((previous) => ({
      ...previous,
      kota_kabupaten: selectedRegency ? formatRegionName(selectedRegency.name) : '',
      kecamatan: '',
      kelurahan_desa: ''
    }));
  };

  const handleDistrictChange = (id) => {
    const selectedDistrict = districts.find((district) => district.id === id);
    setDistrictId(id);
    setIsLoadingVillages(Boolean(id));
    setVillages([]);
    setRegionError('');
    setFormData((previous) => ({
      ...previous,
      kecamatan: selectedDistrict ? formatRegionName(selectedDistrict.name) : '',
      kelurahan_desa: ''
    }));
  };

  const handleVillageChange = (id) => {
    const selectedVillage = villages.find((village) => village.id === id);
    setFormData((previous) => ({
      ...previous,
      kelurahan_desa: selectedVillage ? formatRegionName(selectedVillage.name) : ''
    }));
  };

  const handleLocationSelect = async ([latitude, longitude]) => {
    setAddressSource('map');
    addressGeocodeController.current?.abort();
    setFormData((previous) => ({
      ...previous,
      alamat_lengkap: '',
      latitude,
      longitude
    }));
    setMapCenter([latitude, longitude]);
    setMapZoom(17);
    setLocationStatus('Mencari alamat dari titik yang dipilih...');
    reverseGeocodeController.current?.abort();

    const controller = new AbortController();
    reverseGeocodeController.current = controller;

    try {
      const query = new URLSearchParams({
        format: 'jsonv2',
        lat: String(latitude),
        lon: String(longitude),
        zoom: '18',
        addressdetails: '1'
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Alamat dari peta tidak dapat dimuat. Anda tetap bisa mengisi alamat secara manual.');

      const result = await response.json();
      if (result.display_name) {
        setFormData((previous) => ({
          ...previous,
          alamat_lengkap: result.display_name,
          latitude,
          longitude
        }));
        setLocationStatus('Pin tersimpan dan alamat peta berhasil diisi. Silakan lengkapi detail RT/RW jika diperlukan.');
      } else {
        setLocationStatus('Pin tersimpan. Alamat tidak ditemukan, silakan lengkapi alamat secara manual.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') setLocationStatus(error.message);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Browser ini tidak mendukung akses lokasi. Silakan pilih titik pada peta.');
      return;
    }

    setLocationStatus('Meminta izin akses lokasi perangkat...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => handleLocationSelect([coords.latitude, coords.longitude]),
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Izin lokasi ditolak. Anda tetap bisa memilih titik langsung pada peta.'
          : 'Lokasi perangkat tidak tersedia. Anda tetap bisa memilih titik langsung pada peta.';
        setLocationStatus(message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Upload foto rumah dengan base64 preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Mohon pilih file foto (JPG, PNG, atau WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5 MB.');
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

    if (!formData.nama_lengkap.trim()) {
      toast.error('Nama lengkap siswa wajib diisi.');
      return;
    }
    if (!formData.nisn.trim()) {
      toast.error('NISN siswa wajib diisi.');
      return;
    }
    if (!formData.alamat_lengkap.trim()) {
      toast.error('Alamat lengkap saat ini wajib diisi.');
      return;
    }
    if (!formData.provinsi || !formData.kota_kabupaten) {
      toast.error('Provinsi dan kabupaten/kota wajib dipilih.');
      return;
    }
    if (!formData.foto_rumah) {
      toast.error('Foto terbaru rumah wajib diunggah untuk verifikasi kondisi tempat tinggal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStudent(formData);
      if (res.success) {
        toast.success('Data siswa berhasil disimpan.');
        setSubmitSuccess(true);
        setSubmittedData(res.data);
        if (onStudentSubmitted) onStudentSubmitted(res.data);
      } else {
        toast.error(res.message || 'Gagal menyimpan data.');
      }
    } catch {
      toast.error('Terjadi kendala saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      nama_lengkap: currentUser?.name || '',
      nisn: currentUser?.nisn || '',
      nik: '',
      kelas: '',
      jurusan: '',
      jenis_kelamin: '',
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
      kota_kabupaten: '',
      provinsi: '',
      rt: '',
      rw: '',
      blok: '',
      nomor_rumah: '',
      latitude: null,
      longitude: null,
      foto_rumah: '',
    });
    setProvinceId('');
    setRegencyId('');
    setDistrictId('');
    setIsLoadingRegencies(false);
    setIsLoadingDistricts(false);
    setIsLoadingVillages(false);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    setMapCenter(DEFAULT_MAP_CENTER);
    setMapZoom(5);
    setLocationStatus('');
    setAddressSource('manual');
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
        <form onSubmit={handleSubmit} className="student-form" noValidate>

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
                <select name="jurusan" value={formData.jurusan} onChange={handleChange}>
                  <option value="">Pilih jurusan</option>
                  <option value="Rekayasa Perangkat Lunak(RPL)">Rekayasa Perangkat Lunak(RPL)</option>
                  <option value="Teknik Jaringan Komputer(TKJ)">Teknik Jaringan Komputer(TKJ)</option>
                  <option value="Teknik Sepeda Motor(TSM)">Teknik Sepeda Motor(TSM)</option>
                  <option value="Teknik Kendaraan Ringan(TKR)">Teknik Kendaraan Ringan(TKR)</option>
                  <option value="Akuntansi(AKL)">Akuntansi(AKL)</option>
                  <option value="Kuliner">Kuliner</option>
                  <option value="Desain Komunikasi Visual(DKV)">Desain Komunikasi Visual(DKV)</option>
                  <option value="Broadcasting dan Perfilman(PF)">Broadcasting dan Perfilman(PF)</option>
                </select>
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
            </div>

            <div className="parent-data-grid">
              <div className="parent-data-column">
                <h4>Data Ayah</h4>
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
              </div>

              <div className="parent-data-column">
                <h4>Data Ibu</h4>
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
                <small className="hint-text">
                  Alamat bisa diketik atau diperbaiki kapan saja. Memilih/menyeret pin akan mengisi alamat; mengubah alamat akan mencari ulang posisi pin.
                </small>
              </div>

              <div className="form-group">
                <SearchableRegionSelect
                  id="student-province"
                  label="Provinsi"
                  required
                  options={provinces.map((province) => ({ id: province.id, label: formatRegionName(province.name) }))}
                  value={formData.provinsi}
                  placeholder="Cari atau pilih provinsi"
                  disabled={isLoadingProvinces || provinces.length === 0}
                  loading={isLoadingProvinces}
                  onSelect={handleProvinceChange}
                />
              </div>

              <div className="form-group">
                <SearchableRegionSelect
                  id="student-regency"
                  label="Kabupaten / Kota"
                  required
                  options={regencies.map((regency) => ({ id: regency.id, label: formatRegionName(regency.name) }))}
                  value={formData.kota_kabupaten}
                  placeholder={!provinceId ? 'Pilih provinsi terlebih dahulu' : 'Cari atau pilih kabupaten/kota'}
                  disabled={!provinceId || isLoadingRegencies || regencies.length === 0}
                  loading={isLoadingRegencies}
                  onSelect={handleRegencyChange}
                />
              </div>

              <div className="form-group">
                <SearchableRegionSelect
                  id="student-district"
                  label="Kecamatan"
                  options={districts.map((district) => ({ id: district.id, label: formatRegionName(district.name) }))}
                  value={formData.kecamatan}
                  placeholder={!regencyId ? 'Pilih kabupaten/kota terlebih dahulu' : 'Cari atau pilih kecamatan'}
                  disabled={!regencyId || isLoadingDistricts || districts.length === 0}
                  loading={isLoadingDistricts}
                  onSelect={handleDistrictChange}
                />
              </div>

              <div className="form-group">
                <SearchableRegionSelect
                  id="student-village"
                  label="Kelurahan / Desa"
                  options={villages.map((village) => ({ id: village.id, label: formatRegionName(village.name) }))}
                  value={formData.kelurahan_desa}
                  placeholder={!districtId ? 'Pilih kecamatan terlebih dahulu' : 'Cari atau pilih kelurahan/desa'}
                  disabled={!districtId || isLoadingVillages || villages.length === 0}
                  loading={isLoadingVillages}
                  onSelect={handleVillageChange}
                />
              </div>
              {regionError && <p className="region-error" role="alert">{regionError}</p>}

              <div className="form-group">
                <label>RT</label>
                <input
                  type="text"
                  name="rt"
                  placeholder="Contoh: 01"
                  value={formData.rt}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>RW</label>
                <input
                  type="text"
                  name="rw"
                  placeholder="Contoh: 08"
                  value={formData.rw}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Blok</label>
                <input
                  type="text"
                  name="blok"
                  placeholder="Contoh: A"
                  value={formData.blok}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Nomor Rumah</label>
                <input
                  type="text"
                  name="nomor_rumah"
                  placeholder="Contoh: 12"
                  value={formData.nomor_rumah}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width location-picker-group">
                <div className="location-picker-heading">
                  <div>
                    <label>Pilih atau Koreksi Titik Lokasi Rumah</label>
                    <p className="hint-text">
                      Klik peta untuk memasang pin atau geser pin. Alamat dan pin akan tetap bisa dikoreksi satu sama lain.
                    </p>
                  </div>
                  <button type="button" className="btn-current-location" onClick={handleUseCurrentLocation}>
                    Gunakan Lokasi Saya
                  </button>
                </div>
                <LocationMapPicker
                  center={mapCenter}
                  zoom={mapZoom}
                  location={
                    formData.latitude != null && formData.longitude != null
                      ? [Number(formData.latitude), Number(formData.longitude)]
                      : null
                  }
                  onSelectLocation={handleLocationSelect}
                />
                {locationStatus && (
                  <p className="location-status" role="status">{locationStatus}</p>
                )}
                {formData.latitude != null && formData.longitude != null && (
                  <p className="location-coordinates">
                    Koordinat tersimpan: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                  </p>
                )}
                <small className="hint-text">
                  Peta menggunakan OpenStreetMap. Untuk memakai lokasi perangkat, izinkan akses lokasi di browser.
                </small>
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