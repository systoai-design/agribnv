import {
  getAllRegions,
  getAllProvinces,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getAllMunicipalities,
} from '@aivangogh/ph-address';

export interface LocationOption {
  label: string;
  value: string;
  code?: string;
  regionCode?: string;
}

export function getPhRegions(): LocationOption[] {
  try {
    const regions = getAllRegions();
    return regions.map((r) => ({
      label: r.designation ? `${r.name} (${r.designation})` : r.name,
      value: r.name,
      code: r.psgcCode,
    }));
  } catch {
    return [
      { label: 'Cordillera Administrative Region (CAR)', value: 'CAR', code: '1400000000' },
      { label: 'Region I (Ilocos Region)', value: 'Region I', code: '0100000000' },
      { label: 'Region II (Cagayan Valley)', value: 'Region II', code: '0200000000' },
      { label: 'Region III (Central Luzon)', value: 'Region III', code: '0300000000' },
      { label: 'Region IV-A (CALABARZON)', value: 'Region IV-A', code: '0400000000' },
      { label: 'Region VI (Western Visayas)', value: 'Region VI', code: '0600000000' },
      { label: 'Region VII (Central Visayas)', value: 'Region VII', code: '0700000000' },
      { label: 'Region XI (Davao Region)', value: 'Region XI', code: '1100000000' },
      { label: 'Region X (Northern Mindanao)', value: 'Region X', code: '1000000000' },
    ];
  }
}

export function getPhProvinces(regionCodeOrName?: string): LocationOption[] {
  try {
    let regionCode = regionCodeOrName;
    if (regionCodeOrName && !/^\d+$/.test(regionCodeOrName)) {
      const regions = getAllRegions();
      const match = regions.find(
        (r) => r.name.toLowerCase() === regionCodeOrName.toLowerCase() ||
               (r.designation && r.designation.toLowerCase() === regionCodeOrName.toLowerCase())
      );
      if (match) regionCode = match.psgcCode;
    }

    if (regionCode && regionCode === '1300000000') {
      // NCR special case
      return [{ label: 'Metro Manila (NCR)', value: 'Metro Manila', code: '1300000000', regionCode: '1300000000' }];
    }

    const provinces = regionCode ? getProvincesByRegion(regionCode) : getAllProvinces();
    return provinces.map((p) => ({
      label: p.name,
      value: p.name,
      code: p.psgcCode,
      regionCode: p.regionCode,
    }));
  } catch {
    return [
      { label: 'Benguet', value: 'Benguet', code: '1401100000' },
      { label: 'Mountain Province', value: 'Mountain Province', code: '1404400000' },
      { label: 'Guimaras', value: 'Guimaras', code: '0607900000' },
      { label: 'Bukidnon', value: 'Bukidnon', code: '1001300000' },
      { label: 'Davao del Sur', value: 'Davao del Sur', code: '1102400000' },
      { label: 'Batangas', value: 'Batangas', code: '0401000000' },
      { label: 'Laguna', value: 'Laguna', code: '0403400000' },
      { label: 'Pangasinan', value: 'Pangasinan', code: '0105500000' },
      { label: 'Cebu', value: 'Cebu', code: '0702200000' },
    ];
  }
}

export function getPhMunicipalities(provinceNameOrCode?: string, regionNameOrCode?: string): LocationOption[] {
  try {
    let provCode = provinceNameOrCode;
    if (provinceNameOrCode && !/^\d+$/.test(provinceNameOrCode)) {
      if (provinceNameOrCode.toLowerCase().includes('manila') || provinceNameOrCode.toLowerCase().includes('ncr')) {
        provCode = '1300000000';
      } else {
        const allProvs = getAllProvinces();
        const match = allProvs.find((p) => p.name.toLowerCase() === provinceNameOrCode.toLowerCase());
        if (match) provCode = match.psgcCode;
      }
    }

    if (provCode === '1300000000') {
      const ncrMunis = getAllMunicipalities().filter((m) => m.psgcCode.startsWith('13'));
      return ncrMunis.map((m) => ({ label: m.name, value: m.name, code: m.psgcCode }));
    }

    if (provCode) {
      const munis = getMunicipalitiesByProvince(provCode);
      return munis.map((m) => ({ label: m.name, value: m.name, code: m.psgcCode }));
    }

    return [];
  } catch {
    return [
      { label: 'La Trinidad', value: 'La Trinidad' },
      { label: 'Tuba', value: 'Tuba' },
      { label: 'Sagada', value: 'Sagada' },
      { label: 'Baguio City', value: 'Baguio City' },
    ];
  }
}
