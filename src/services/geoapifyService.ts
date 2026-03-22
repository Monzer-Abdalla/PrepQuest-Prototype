const API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_KEY as string;

const CATEGORIES = [
  'healthcare.hospital',
  'healthcare.pharmacy',
  'healthcare.clinic_or_praxis',
].join(',');

export interface MedicalPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  category: string;
  phone: string;
}

export function fetchMedicalPlaces(lat: number, lon: number): Promise<MedicalPlace[]> {
  const url =
    'https://api.geoapify.com/v2/places' +
    '?categories=' + CATEGORIES +
    '&filter=circle:' + lon + ',' + lat + ',5000' +
    '&limit=20' +
    '&apiKey=' + API_KEY;

  return fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(json) {
      if (!json.features) { return []; }
      const results: MedicalPlace[] = [];
      for (let i = 0; i < json.features.length; i++) {
        const f = json.features[i];
        const p = f.properties;
        const name: string = p.name !== undefined && p.name !== null && p.name !== ''
          ? p.name
          : 'Medical Facility';
        const cats: string[] = p.categories !== undefined ? p.categories : [];
        let category = 'Medical';
        if (cats.length > 0) {
          const raw = cats[0];
          if (raw.indexOf('hospital') !== -1) { category = 'Hospital'; }
          else if (raw.indexOf('pharmacy') !== -1) { category = 'Pharmacy'; }
          else if (raw.indexOf('clinic') !== -1) { category = 'Clinic'; }
          else if (raw.indexOf('emergency') !== -1) { category = 'Emergency'; }
        }
        const address: string = p.formatted !== undefined && p.formatted !== null
          ? p.formatted
          : '';
        const raw = p.datasource !== undefined && p.datasource.raw !== undefined
          ? p.datasource.raw
          : {};
        const phone: string = raw.phone !== undefined ? raw.phone : '';
        const placeLat: number = typeof p.lat === 'number' ? p.lat : 0;
        const placeLon: number = typeof p.lon === 'number' ? p.lon : 0;
        if (placeLat === 0 && placeLon === 0) { continue; }
        results.push({
          id: 'geo_' + (p.place_id !== undefined ? p.place_id : String(i)),
          name: name,
          latitude: placeLat,
          longitude: placeLon,
          address: address,
          category: category,
          phone: phone,
        });
      }
      return results;
    })
    .catch(function() { return []; });
}
