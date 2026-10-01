import { slugify } from "./format";

/** [nombre, peso relativo de desapariciones, €/m² base, barrios] */
type DistrictSeed = readonly [string, number, number, readonly string[]];

export const DISTRICT_SEEDS: readonly DistrictSeed[] = [
  ["Centro", 1, 5600, ["Palacio", "Embajadores", "Las Letras", "Justicia", "Universidad", "Sol"]],
  ["Salamanca", 1, 7400, ["Recoletos", "Goya", "Fuente del Berro", "Guindalera", "Lista", "Castellana"]],
  ["Chamberí", 0.8, 6500, ["Gaztambide", "Arapiles", "Trafalgar", "Almagro", "Ríos Rosas", "Vallehermoso"]],
  ["Retiro", 0.7, 5600, ["Pacífico", "Adelfas", "Estrella", "Ibiza", "Jerónimos", "Niño Jesús"]],
  ["Tetuán", 0.8, 4300, ["Bellas Vistas", "Cuatro Caminos", "Castillejos", "Almenara", "Valdeacederas", "Berruguete"]],
  ["Arganzuela", 0.75, 4500, ["Imperial", "Acacias", "Chopera", "Legazpi", "Delicias", "Palos de Moguer", "Atocha"]],
  ["Carabanchel", 0.95, 2700, ["Comillas", "Opañel", "San Isidro", "Vista Alegre", "Puerta Bonita", "Buenavista", "Abrantes"]],
  ["Puente de Vallecas", 0.9, 2500, ["Entrevías", "San Diego", "Palomeras Bajas", "Palomeras Sureste", "Portazgo", "Numancia"]],
  ["Latina", 0.85, 2800, ["Los Cármenes", "Puerta del Ángel", "Lucero", "Aluche", "Campamento", "Las Águilas"]],
  ["Ciudad Lineal", 0.85, 3600, ["Ventas", "Pueblo Nuevo", "Quintana", "Concepción", "San Pascual", "La Elipa", "Colina", "Costillares"]],
  ["Chamartín", 0.75, 6000, ["El Viso", "Prosperidad", "Ciudad Jardín", "Hispanoamérica", "Nueva España", "Castilla"]],
  ["Moncloa-Aravaca", 0.6, 4900, ["Argüelles", "Ciudad Universitaria", "Valdezarza", "Valdemarín", "El Plantío", "Aravaca"]],
  ["Fuencarral-El Pardo", 0.75, 4000, ["Peñagrande", "Pilar", "La Paz", "Valverde", "Mirasierra", "Tres Olivos"]],
  ["Hortaleza", 0.6, 4200, ["Palomas", "Piovera", "Canillas", "Pinar del Rey", "Apóstol Santiago", "Valdefuentes"]],
  ["Usera", 0.55, 2600, ["Orcasitas", "Orcasur", "San Fermín", "Almendrales", "Moscardó", "Zofío", "Pradolongo"]],
  ["Villaverde", 0.45, 2200, ["San Andrés", "San Cristóbal", "Butarque", "Los Rosales", "Los Ángeles"]],
  ["San Blas-Canillejas", 0.55, 3200, ["Simancas", "Hellín", "Amposta", "Arcos", "Rosas", "Rejas", "Canillejas"]],
  ["Moratalaz", 0.35, 3000, ["Pavones", "Horcajo", "Marroquina", "Media Legua", "Fontarrón", "Vinateros"]],
  ["Vicálvaro", 0.3, 2900, ["Casco de Vicálvaro", "Valdebernardo", "Valderrivas", "El Cañaveral"]],
  ["Villa de Vallecas", 0.4, 3100, ["Casco de Vallecas", "Santa Eugenia", "Ensanche de Vallecas"]],
];

/** Distritos periféricos: mezcla de tipologías con más casas y chalets. */
export const OUTER_DISTRICTS = new Set([
  "Fuencarral-El Pardo",
  "Moncloa-Aravaca",
  "Hortaleza",
  "Chamartín",
  "San Blas-Canillejas",
  "Vicálvaro",
  "Villa de Vallecas",
  "Ciudad Lineal",
  "Latina",
]);

export type District = {
  name: string;
  slug: string;
  barrios: readonly string[];
};

export const DISTRICTS: readonly District[] = DISTRICT_SEEDS.map(([name, , , barrios]) => ({
  name,
  slug: slugify(name),
  barrios,
}));

export function findDistrict(slug: string): District | undefined {
  return DISTRICTS.find((d) => d.slug === slug);
}
