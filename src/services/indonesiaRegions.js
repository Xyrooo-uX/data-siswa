const API_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

async function fetchRegions(path, signal) {
  const response = await fetch(`${API_BASE_URL}/${path}`, { signal });
  if (!response.ok) {
    throw new Error('Daftar wilayah tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.');
  }

  const regions = await response.json();
  if (!Array.isArray(regions)) {
    throw new Error('Data wilayah yang diterima tidak valid.');
  }

  return regions;
}

export function fetchProvinces(signal) {
  return fetchRegions('provinces.json', signal);
}

export function fetchRegencies(provinceId, signal) {
  return fetchRegions(`regencies/${encodeURIComponent(provinceId)}.json`, signal);
}

export function fetchDistricts(regencyId, signal) {
  return fetchRegions(`districts/${encodeURIComponent(regencyId)}.json`, signal);
}

export function fetchVillages(districtId, signal) {
  return fetchRegions(`villages/${encodeURIComponent(districtId)}.json`, signal);
}
