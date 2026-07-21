// Motor de estimación de impuestos por cantón. Estimación orientativa
// (no oficial): usa un índice de carga fiscal efectiva por cantón a
// 100'000 CHF/año (soltero, sin hijos, capital cantonal) calibrado con
// datos públicos (ranking Zug↔Ginebra, BAK Economics / NZZ / comparaciones
// intercantonales), y una curva de progresividad aproximada para
// extrapolar a otros niveles de renta. Para el cálculo exacto: estv.admin.ch.

export const PILLAR_3A_MAX_2026 = 7258;
export const BVG_COORDINATION_DEDUCTION_2026 = 26460;

// tasa efectiva combinada (federal + cantonal + comunal capital) aproximada
// a 100'000 CHF de renta imponible, soltero sin hijos, sin iglesia.
export const CANTONS = [
  { code: 'ZG', rate100k: 0.12, names: { es: 'Zug', de: 'Zug', en: 'Zug', fr: 'Zoug', it: 'Zugo', pt: 'Zug' }, capital: { es: 'Zug', de: 'Zug', en: 'Zug', fr: 'Zoug', it: 'Zugo', pt: 'Zug' } },
  { code: 'SZ', rate100k: 0.135, names: { es: 'Schwyz', de: 'Schwyz', en: 'Schwyz', fr: 'Schwytz', it: 'Svitto', pt: 'Schwyz' }, capital: { es: 'Schwyz', de: 'Schwyz', en: 'Schwyz', fr: 'Schwytz', it: 'Svitto', pt: 'Schwyz' } },
  { code: 'NW', rate100k: 0.14, names: { es: 'Nidwalden', de: 'Nidwalden', en: 'Nidwalden', fr: 'Nidwald', it: 'Nidvaldo', pt: 'Nidwalden' }, capital: { es: 'Stans', de: 'Stans', en: 'Stans', fr: 'Stans', it: 'Stans', pt: 'Stans' } },
  { code: 'OW', rate100k: 0.145, names: { es: 'Obwalden', de: 'Obwalden', en: 'Obwalden', fr: 'Obwald', it: 'Obvaldo', pt: 'Obwalden' }, capital: { es: 'Sarnen', de: 'Sarnen', en: 'Sarnen', fr: 'Sarnen', it: 'Sarnen', pt: 'Sarnen' } },
  { code: 'UR', rate100k: 0.15, names: { es: 'Uri', de: 'Uri', en: 'Uri', fr: 'Uri', it: 'Uri', pt: 'Uri' }, capital: { es: 'Altdorf', de: 'Altdorf', en: 'Altdorf', fr: 'Altdorf', it: 'Altdorf', pt: 'Altdorf' } },
  { code: 'AI', rate100k: 0.155, names: { es: 'Appenzell Rh. Int.', de: 'Appenzell Innerrhoden', en: 'Appenzell Innerrhoden', fr: 'Appenzell Rh.-Int.', it: 'Appenzello Interno', pt: 'Appenzell Rh. Int.' }, capital: { es: 'Appenzell', de: 'Appenzell', en: 'Appenzell', fr: 'Appenzell', it: 'Appenzello', pt: 'Appenzell' } },
  { code: 'AR', rate100k: 0.17, names: { es: 'Appenzell Rh. Ext.', de: 'Appenzell Ausserrhoden', en: 'Appenzell Ausserrhoden', fr: 'Appenzell Rh.-Ext.', it: 'Appenzello Esterno', pt: 'Appenzell Rh. Ext.' }, capital: { es: 'Herisau', de: 'Herisau', en: 'Herisau', fr: 'Herisau', it: 'Herisau', pt: 'Herisau' } },
  { code: 'TG', rate100k: 0.175, names: { es: 'Turgovia', de: 'Thurgau', en: 'Thurgau', fr: 'Thurgovie', it: 'Turgovia', pt: 'Turgóvia' }, capital: { es: 'Frauenfeld', de: 'Frauenfeld', en: 'Frauenfeld', fr: 'Frauenfeld', it: 'Frauenfeld', pt: 'Frauenfeld' } },
  { code: 'SH', rate100k: 0.18, names: { es: 'Schaffhausen', de: 'Schaffhausen', en: 'Schaffhausen', fr: 'Schaffhouse', it: 'Sciaffusa', pt: 'Schaffhausen' }, capital: { es: 'Schaffhausen', de: 'Schaffhausen', en: 'Schaffhausen', fr: 'Schaffhouse', it: 'Sciaffusa', pt: 'Schaffhausen' } },
  { code: 'GR', rate100k: 0.185, names: { es: 'Grisones', de: 'Graubünden', en: 'Grisons', fr: 'Grisons', it: 'Grigioni', pt: 'Grisões' }, capital: { es: 'Coira', de: 'Chur', en: 'Chur', fr: 'Coire', it: 'Coira', pt: 'Coira' } },
  { code: 'LU', rate100k: 0.19, names: { es: 'Lucerna', de: 'Luzern', en: 'Lucerne', fr: 'Lucerne', it: 'Lucerna', pt: 'Lucerna' }, capital: { es: 'Lucerna', de: 'Luzern', en: 'Lucerne', fr: 'Lucerne', it: 'Lucerna', pt: 'Lucerna' } },
  { code: 'AG', rate100k: 0.19, names: { es: 'Argovia', de: 'Aargau', en: 'Aargau', fr: 'Argovie', it: 'Argovia', pt: 'Argóvia' }, capital: { es: 'Aarau', de: 'Aarau', en: 'Aarau', fr: 'Aarau', it: 'Aarau', pt: 'Aarau' } },
  { code: 'SG', rate100k: 0.195, names: { es: 'San Galo', de: 'St. Gallen', en: 'St. Gallen', fr: 'Saint-Gall', it: 'San Gallo', pt: 'São Galo' }, capital: { es: 'San Galo', de: 'St. Gallen', en: 'St. Gallen', fr: 'Saint-Gall', it: 'San Gallo', pt: 'São Galo' } },
  { code: 'GL', rate100k: 0.195, names: { es: 'Glaris', de: 'Glarus', en: 'Glarus', fr: 'Glaris', it: 'Glarona', pt: 'Glarus' }, capital: { es: 'Glaris', de: 'Glarus', en: 'Glarus', fr: 'Glaris', it: 'Glarona', pt: 'Glarus' } },
  { code: 'ZH', rate100k: 0.20, names: { es: 'Zúrich', de: 'Zürich', en: 'Zurich', fr: 'Zurich', it: 'Zurigo', pt: 'Zurique' }, capital: { es: 'Zúrich', de: 'Zürich', en: 'Zurich', fr: 'Zurich', it: 'Zurigo', pt: 'Zurique' } },
  { code: 'SO', rate100k: 0.21, names: { es: 'Soleura', de: 'Solothurn', en: 'Solothurn', fr: 'Soleure', it: 'Soletta', pt: 'Soleura' }, capital: { es: 'Soleura', de: 'Solothurn', en: 'Solothurn', fr: 'Soleure', it: 'Soletta', pt: 'Soleura' } },
  { code: 'VS', rate100k: 0.215, names: { es: 'Valais', de: 'Wallis', en: 'Valais', fr: 'Valais', it: 'Vallese', pt: 'Valais' }, capital: { es: 'Sion', de: 'Sitten', en: 'Sion', fr: 'Sion', it: 'Sion', pt: 'Sion' } },
  { code: 'BL', rate100k: 0.22, names: { es: 'Basilea-Campo', de: 'Basel-Landschaft', en: 'Basel-Landschaft', fr: 'Bâle-Campagne', it: 'Basilea Campagna', pt: 'Basileia-Campo' }, capital: { es: 'Liestal', de: 'Liestal', en: 'Liestal', fr: 'Liestal', it: 'Liestal', pt: 'Liestal' } },
  { code: 'TI', rate100k: 0.225, names: { es: 'Tesino', de: 'Tessin', en: 'Ticino', fr: 'Tessin', it: 'Ticino', pt: 'Tessino' }, capital: { es: 'Bellinzona', de: 'Bellinzona', en: 'Bellinzona', fr: 'Bellinzone', it: 'Bellinzona', pt: 'Bellinzona' } },
  { code: 'FR', rate100k: 0.225, names: { es: 'Friburgo', de: 'Freiburg', en: 'Fribourg', fr: 'Fribourg', it: 'Friburgo', pt: 'Friburgo' }, capital: { es: 'Friburgo', de: 'Freiburg', en: 'Fribourg', fr: 'Fribourg', it: 'Friburgo', pt: 'Friburgo' } },
  { code: 'BE', rate100k: 0.24, names: { es: 'Berna', de: 'Bern', en: 'Bern', fr: 'Berne', it: 'Berna', pt: 'Berna' }, capital: { es: 'Berna', de: 'Bern', en: 'Bern', fr: 'Berne', it: 'Berna', pt: 'Berna' } },
  { code: 'BS', rate100k: 0.245, names: { es: 'Basilea-Ciudad', de: 'Basel-Stadt', en: 'Basel-Stadt', fr: 'Bâle-Ville', it: 'Basilea Città', pt: 'Basileia-Cidade' }, capital: { es: 'Basilea', de: 'Basel', en: 'Basel', fr: 'Bâle', it: 'Basilea', pt: 'Basileia' } },
  { code: 'JU', rate100k: 0.245, names: { es: 'Jura', de: 'Jura', en: 'Jura', fr: 'Jura', it: 'Giura', pt: 'Jura' }, capital: { es: 'Delémont', de: 'Delsberg', en: 'Delémont', fr: 'Delémont', it: 'Delémont', pt: 'Delémont' } },
  { code: 'NE', rate100k: 0.255, names: { es: 'Neuchâtel', de: 'Neuenburg', en: 'Neuchâtel', fr: 'Neuchâtel', it: 'Neuchâtel', pt: 'Neuchâtel' }, capital: { es: 'Neuchâtel', de: 'Neuenburg', en: 'Neuchâtel', fr: 'Neuchâtel', it: 'Neuchâtel', pt: 'Neuchâtel' } },
  { code: 'VD', rate100k: 0.265, names: { es: 'Vaud', de: 'Waadt', en: 'Vaud', fr: 'Vaud', it: 'Vaud', pt: 'Vaud' }, capital: { es: 'Lausana', de: 'Lausanne', en: 'Lausanne', fr: 'Lausanne', it: 'Losanna', pt: 'Lausanne' } },
  { code: 'GE', rate100k: 0.28, names: { es: 'Ginebra', de: 'Genf', en: 'Geneva', fr: 'Genève', it: 'Ginevra', pt: 'Genebra' }, capital: { es: 'Ginebra', de: 'Genf', en: 'Geneva', fr: 'Genève', it: 'Ginevra', pt: 'Genebra' } },
];

// Multiplicador de progresividad respecto a la tasa efectiva a 100'000 CHF.
// Aproximación genérica del sistema suizo (federal+cantonal+comunal).
const CURVE = [
  [20000, 0.02], [30000, 0.15], [40000, 0.35], [50000, 0.5], [65000, 0.7],
  [80000, 0.85], [100000, 1.0], [120000, 1.12], [150000, 1.28], [200000, 1.48],
  [300000, 1.68], [500000, 1.88], [800000, 2.0],
];

function curveMultiplier(taxableAnnual) {
  if (taxableAnnual <= 0) return 0;
  for (let i = 0; i < CURVE.length - 1; i++) {
    const [x0, y0] = CURVE[i];
    const [x1, y1] = CURVE[i + 1];
    if (taxableAnnual <= x1) {
      const ratio = (taxableAnnual - x0) / (x1 - x0);
      return y0 + ratio * (y1 - y0);
    }
  }
  return CURVE[CURVE.length - 1][1];
}

// Reducción aproximada de tarifa por estado civil / hijos (estilo Quellensteuer A/B/C/H).
function maritalFactor(marital, kids) {
  let factor = 1;
  if (marital === 'casado-1') factor = 0.78; // tarifa B, un solo sueldo
  else if (marital === 'casado-2') factor = 0.9; // tarifa C, dos sueldos
  else if (marital === 'monoparental') factor = 0.85; // tarifa H
  if (kids > 0) factor -= Math.min(kids, 4) * 0.035;
  return Math.max(factor, 0.55);
}

function bvgEmployeeRate(age) {
  if (age < 25) return 0;
  if (age <= 34) return 0.035;
  if (age <= 44) return 0.05;
  if (age <= 54) return 0.075;
  return 0.09;
}

export function effectiveRate(taxableAnnual, canton, marital, kids, church) {
  const base = canton.rate100k * curveMultiplier(taxableAnnual) * maritalFactor(marital, kids);
  const churchSurcharge = church ? base * 0.09 : 0;
  return base + churchSurcharge;
}

export function computeBreakdown({ grossMonthly, month13, age, marital, kids, church, cantonCode }) {
  const canton = CANTONS.find((c) => c.code === cantonCode) || CANTONS.find((c) => c.code === 'ZH');
  const grossAnnual = grossMonthly * (month13 ? 13 : 12);

  const ahv = grossAnnual * 0.053;
  const alv = grossAnnual * 0.011;
  const nbu = grossAnnual * 0.012;

  const coordinatedAnnual = Math.max(0, Math.min(grossAnnual, 90720) - BVG_COORDINATION_DEDUCTION_2026);
  const bvg = coordinatedAnnual * bvgEmployeeRate(age);

  const taxableAnnual = Math.max(0, grossAnnual - ahv - alv - nbu - bvg);
  const rate = effectiveRate(taxableAnnual, canton, marital, kids, church);
  const tax = taxableAnnual * rate;

  const netAnnual = grossAnnual - ahv - alv - nbu - bvg - tax;
  const netMonthly = netAnnual / (month13 ? 13 : 12);

  return {
    canton,
    grossAnnual,
    ahv, alv, nbu, bvg, tax,
    netAnnual, netMonthly,
    effectiveRatePct: rate * 100,
  };
}

export function pillar3aSavings(breakdown, contribution) {
  const marginalProxy = Math.min(breakdown.effectiveRatePct / 100 * 1.25, 0.42);
  return Math.round(contribution * marginalProxy);
}

export function rankedCantons(taxableAnnual, marital, kids, church) {
  return CANTONS.map((c) => ({
    ...c,
    ratePct: effectiveRate(taxableAnnual, c, marital, kids, church) * 100,
  })).sort((a, b) => a.ratePct - b.ratePct);
}
