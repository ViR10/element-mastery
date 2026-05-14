export interface Element {
  id: number;
  name: string;
  symbol: string;
  valency: string;
  note: string;
  source: string;
  mnemonic: string;
  isRadical?: boolean;
}

export const METALS = [
  { name: "Hydrogen", symbol: "H", valency: "+1", note: "−1 in metal hydrides", source: "Both", mnemonic: "Hydrogen has 1 proton, eager to share or lose its single electron!" },
  { name: "Lithium", symbol: "Li", valency: "+1", note: "Loses 1 electron", source: "Table 2", mnemonic: "Lightest metal Li loses 1 to feel like Helium." },
  { name: "Sodium", symbol: "Na", valency: "+1", note: "Loses 1 electron", source: "Both", mnemonic: "Na+ is salty and highly reactive, always shedding 1 outer electron." },
  { name: "Potassium", symbol: "K", valency: "+1", note: "Loses 1 electron", source: "Both", mnemonic: "K+ keeps its single valence electron ready to jump." },
  { name: "Silver", symbol: "Ag", valency: "+1", note: "Loses 1 electron", source: "Table 1.2", mnemonic: "Ag shines bright with a reliable +1 charge." },
  { name: "Rubidium", symbol: "Rb", valency: "+1", note: "Loses 1 electron", source: "Table 2", mnemonic: "Rb reacts vigorously by giving up 1 electron." },
  { name: "Cesium", symbol: "Cs", valency: "+1", note: "Loses 1 electron", source: "Table 2", mnemonic: "Heavy Cs easily ejects its lone valence electron (+1)." },
  { name: "Beryllium", symbol: "Be", valency: "+2", note: "Loses 2 electrons", source: "Table 2", mnemonic: "Be has 2 valence electrons to give away for stability." },
  { name: "Magnesium", symbol: "Mg", valency: "+2", note: "Loses 2 electrons", source: "Both", mnemonic: "Mg burns bright white when shedding its 2 outer electrons." },
  { name: "Calcium", symbol: "Ca", valency: "+2", note: "Loses 2 electrons", source: "Both", mnemonic: "Ca2+ builds strong bones by donating 2 electrons." },
  { name: "Zinc", symbol: "Zn", valency: "+2", note: "Loses 2 electrons", source: "Table 1.2", mnemonic: "Zn caps its d-subshell nicely leaving exactly 2 electrons to lose." },
  { name: "Strontium", symbol: "Sr", valency: "+2", note: "Loses 2 electrons", source: "Table 2", mnemonic: "Sr glows deep red in fireworks, losing 2 electrons." },
  { name: "Barium", symbol: "Ba", valency: "+2", note: "Loses 2 electrons", source: "Both", mnemonic: "Ba is heavy but follows the group rule: lose 2 electrons." },
  { name: "Copper", symbol: "Cu", valency: "+2", note: "Most common; +1 (cuprous) also exists", source: "Table 1.2", mnemonic: "Cupric (+2) forms beautiful blue solutions like CuSO₄." },
  { name: "Mercury", symbol: "Hg", valency: "+2", note: "Most common (mercuric); +1 also exists", source: "Table 1.2", mnemonic: "Liquid Hg usually pairs up to form mercuric (+2) salts." },
  { name: "Iron", symbol: "Fe", valency: "+3", note: "Ferric (most stable); +2 (ferrous) also important", source: "Table 1.2", mnemonic: "Ferric (+3) rusts reddish-brown, highly stable half-filled d-orbitals." },
  { name: "Aluminium", symbol: "Al", valency: "+3", note: "Loses 3 electrons", source: "Table 1.2", mnemonic: "Al foil is light and sheds all 3 valence electrons." },
  { name: "Chromium", symbol: "Cr", valency: "+3", note: "Most common form; variable valency", source: "Table 1.2", mnemonic: "Cr forms colorful green/purple trivalent (+3) compounds." },
];

export const NONMETALS = [
  { name: "Fluorine", symbol: "F", valency: "−1", note: "Gains 1 electron", source: "Table 2", mnemonic: "Most electronegative element F aggressively snatches 1 electron." },
  { name: "Chlorine", symbol: "Cl", valency: "−1", note: "Gains 1 electron", source: "Both", mnemonic: "Cl needs just 1 more electron to achieve the perfect Argon octet." },
  { name: "Bromine", symbol: "Br", valency: "−1", note: "Gains 1 electron", source: "Both", mnemonic: "Liquid halogen Br pulls in 1 electron to fill its shell." },
  { name: "Iodine", symbol: "I", valency: "−1", note: "Gains 1 electron", source: "Both", mnemonic: "Purple subliming I completes its octet by gaining 1 electron." },
  { name: "Oxygen", symbol: "O", valency: "−2", note: "Gains 2 electrons", source: "Both", mnemonic: "O loves electrons so much it demands 2 to fill its outer shell." },
  { name: "Sulphur", symbol: "S", valency: "−2", note: "Gains 2 electrons (sulphide)", source: "Table 1.2", mnemonic: "Sulphur smells like matches and gains 2 electrons as sulphide." },
  { name: "Nitrogen", symbol: "N", valency: "−3", note: "Gains 3 electrons (nitride); shares 3 in covalent", source: "Table 1.2", mnemonic: "N has 5 valence electrons, needs 3 more to complete its octet." },
  { name: "Phosphorus", symbol: "P", valency: "−3", note: "Gains 3 electrons (phosphide); also shows +3/+5 in covalent", source: "Table 1.2", mnemonic: "P forms phosphide (-3) but can expand its bonding capabilities." },
  { name: "Arsenic", symbol: "As", valency: "−3", note: "Gains 3 electrons (arsenide)", source: "Table 1.2", mnemonic: "As behaves like phosphorus, picking up 3 electrons." },
  { name: "Boron", symbol: "B", valency: "+3", note: "Shares 3 electrons (covalent)", source: "Table 1.2", mnemonic: "Metalloid B shares its 3 outer electrons to form covalent bonds." },
  { name: "Carbon", symbol: "C", valency: "4", note: "Shares 4 electrons (covalent only)", source: "Both", mnemonic: "Carbon sits perfectly in the middle, sharing exactly 4 electrons." },
];

export const NOBLE = [
  { name: "Helium", symbol: "He", valency: "0", note: "Stable duplet — no bonding", source: "Table 2", mnemonic: "He has a perfect duplet shell, completely unreactive." },
  { name: "Neon", symbol: "Ne", valency: "0", note: "Stable octet — no bonding", source: "Table 2", mnemonic: "Ne glows bright red in signs, full octet means zero valency." },
  { name: "Argon", symbol: "Ar", valency: "0", note: "Stable octet — no bonding", source: "Table 2", mnemonic: "Ar fills lightbulbs inertly because its octet is perfectly sealed." },
  { name: "Krypton", symbol: "Kr", valency: "0", note: "Stable octet — no bonding", source: "Table 2", mnemonic: "Kr is super stable, zero bonding needed." },
  { name: "Xenon", symbol: "Xe", valency: "0", note: "Stable octet — no bonding", source: "Table 2", mnemonic: "Heavy noble gas Xe has a complete valence octet." },
];

export const RADICALS = [
  { name: "Ammonium", symbol: "NH₄⁺", valency: "+1", note: "Positively charged radical", mnemonic: "One Nitrogen and four Hydrogens bundle up with a +1 net charge." },
  { name: "Hydronium", symbol: "H₃O⁺", valency: "+1", note: "Positively charged radical", mnemonic: "Water carrying an extra proton gives H₃O⁺ a +1 charge." },
  { name: "Hydroxide", symbol: "OH⁻", valency: "−1", note: "Negatively charged radical", mnemonic: "Basic OH⁻ carries a crisp −1 negative charge." },
  { name: "Cyanide", symbol: "CN⁻", valency: "−1", note: "Negatively charged radical", mnemonic: "Carbon and Nitrogen triple bonded with an extra electron (−1)." },
  { name: "Bisulphate", symbol: "HSO₄⁻", valency: "−1", note: "Negatively charged radical", mnemonic: "Sulphate holding onto one Hydrogen leaves a single −1 charge." },
  { name: "Bicarbonate", symbol: "HCO₃⁻", valency: "−1", note: "Negatively charged radical", mnemonic: "Carbonate neutralized by one proton leaves HCO₃⁻ with a −1 charge." },
  { name: "Carbonate", symbol: "CO₃²⁻", valency: "−2", note: "Negatively charged radical", mnemonic: "CO₃²⁻ forms marble and chalk, carrying a strong −2 charge." },
  { name: "Sulphate", symbol: "SO₄²⁻", valency: "−2", note: "Negatively charged radical", mnemonic: "Sulphur surrounded by 4 Oxygens holds a steady −2 charge." },
  { name: "Sulphite", symbol: "SO₃²⁻", valency: "−2", note: "Negatively charged radical", mnemonic: "One less oxygen than sulphate, but keeps the same −2 valency." },
  { name: "Thiosulphate", symbol: "S₂O₃²⁻", valency: "−2", note: "Negatively charged radical", mnemonic: "Sulphate with one oxygen replaced by sulphur, retains −2 charge." },
  { name: "Nitride", symbol: "N³⁻", valency: "−3", note: "Negatively charged radical", mnemonic: "Bare nitrogen ion carrying a heavy −3 charge." },
  { name: "Phosphate", symbol: "PO₄³⁻", valency: "−3", note: "Negatively charged radical", mnemonic: "Phosphorus bounded to 4 Oxygens anchors DNA with a −3 charge." },
];

// Combine all into a flat list with generated unique integer IDs
let currentId = 1;
export const elements: Element[] = [
  ...METALS.map(item => ({ ...item, id: currentId++, isRadical: false })),
  ...NONMETALS.map(item => ({ ...item, id: currentId++, isRadical: false })),
  ...NOBLE.map(item => ({ ...item, id: currentId++, source: item.source || "Table 2", isRadical: false })),
  ...RADICALS.map(item => ({ ...item, id: currentId++, source: "Radicals Table", isRadical: true })),
];
