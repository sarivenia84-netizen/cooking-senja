// Indonesian recipes for Dapur Senja
export const RECIPES = {
  nasi_goreng: {
    id: 'nasi_goreng',
    name: 'Nasi Goreng',
    ingredients: ['nasi', 'telur', 'bawang', 'cabai', 'kecap'],
    cookTime: 5,
    reward: 120,
    description: 'Nasi goreng khas dengan kecap manis',
  },
  mie_goreng: {
    id: 'mie_goreng',
    name: 'Mie Goreng',
    ingredients: ['mie', 'telur', 'bawang', 'cabai', 'kecap'],
    cookTime: 4,
    reward: 110,
    description: 'Mie goreng pedas manis',
  },
  sate: {
    id: 'sate',
    name: 'Sate Ayam',
    ingredients: ['daging', 'bawang', 'cabai', 'kecap', 'kacang'],
    cookTime: 6,
    reward: 150,
    description: 'Sate ayam bumbu kacang',
  },
  es_teh: {
    id: 'es_teh',
    name: 'Es Teh Manis',
    ingredients: ['teh', 'gula', 'es'],
    cookTime: 3,
    reward: 60,
    description: 'Teh manis segar dengan es',
  },
  gado_gado: {
    id: 'gado_gado',
    name: 'Gado-Gado',
    ingredients: ['sayur', 'telur', 'kacang', 'kecap', 'bawang'],
    cookTime: 5,
    reward: 130,
    description: 'Sayur rebus dengan bumbu kacang',
  },
  bakwan: {
    id: 'bakwan',
    name: 'Bakwan Sayur',
    ingredients: ['sayur', 'tepung', 'bawang', 'cabai'],
    cookTime: 4,
    reward: 90,
    description: 'Gorengan sayur renyah',
  },
  soto: {
    id: 'soto',
    name: 'Soto Ayam',
    ingredients: ['daging', 'bawang', 'sayur', 'telur', 'nasi'],
    cookTime: 7,
    reward: 160,
    description: 'Soto ayam kuah kuning hangat',
  },
  klepon: {
    id: 'klepon',
    name: 'Klepon',
    ingredients: ['tepung', 'gula', 'kelapa'],
    cookTime: 5,
    reward: 100,
    description: 'Kue tradisional isi gula merah',
  },
};

export const RECIPE_LIST = Object.values(RECIPES);

// Ingredient display names
export const INGREDIENT_NAMES = {
  nasi: 'Nasi Putih',
  mie: 'Mie Kuning',
  telur: 'Telur Ayam',
  bawang: 'Bawang Merah',
  cabai: 'Cabai Rawit',
  daging: 'Daging Ayam',
  sayur: 'Sayur Campur',
  kecap: 'Kecap Manis',
  saus: 'Saus Sambal',
  tepung: 'Tepung Beras',
  gula: 'Gula Merah',
  kelapa: 'Kelapa Parut',
  teh: 'Teh Celup',
  es: 'Es Batu',
  kacang: 'Kacang Tanah',
};

// Ingredient categories for spawning
export const INGREDIENT_CATEGORIES = {
  base: ['nasi', 'mie', 'tepung'],
  protein: ['telur', 'daging'],
  aromatic: ['bawang', 'cabai'],
  vegetable: ['sayur'],
  sauce: ['kecap', 'saus'],
  sweet: ['gula', 'kelapa'],
  drink: ['teh', 'es'],
  special: ['kacang'],
};

// All available ingredients for counter spawning
export const AVAILABLE_INGREDIENTS = [
  'nasi', 'mie', 'telur', 'bawang', 'cabai',
  'daging', 'sayur', 'kecap', 'saus', 'tepung',
  'gula', 'kelapa', 'teh', 'es', 'kacang',
];