import { salons, type Salon } from "./data";
import { getDemoNetworkBranches } from "./publicDetails";

// The prototype lists networks separately from the salons where demo masters work.
const cherry = salons.find((item) => item.id === 1)!;
const tulga = salons.find((item) => item.id === 2)!;

export const networkSalons: Salon[] = [
  { ...cherry, id: 201, name: "Baku Beauty Studio", tag: "Gözəllik və baxım şəbəkəsi", location: "Nizami küç. 45", description: "Gözəllik və baxım xidmətləri üçün üç filiallı studiya.", branches: getDemoNetworkBranches(1) },
  { ...tulga, id: 202, name: "Grand Barber Lounge", tag: "Kişi bərbəri şəbəkəsi", location: "Neftçilər pr. 153", description: "Kişi baxımı və bərbər xidmətləri üçün iki filiallı məkan.", branches: getDemoNetworkBranches(2) },
];

export const publicSalons = [...salons, ...networkSalons];
export const catalogSalons = [...salons.filter((item) => item.id !== 1 && item.id !== 2), ...networkSalons];
