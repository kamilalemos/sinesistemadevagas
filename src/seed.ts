import { generateFictitiousVagas } from "./lib/mockGenerator";
import { saveVagasToLocalStorage } from "./lib/vagasPersistence";

const seedVagas = () => {
  const count = 150;
  const periodo = "25 a 30 de maio";
  const vagas = generateFictitiousVagas(count, periodo);
  
  // We use week 4 for the end of May (as per getWeekInfo logic)
  saveVagasToLocalStorage('semana', vagas, periodo);
  console.log(`Successfully seeded ${count} vagas for period: ${periodo}`);
  return vagas.length;
};

// Check if we should seed (e.g. via URL param or just run once)
if (typeof window !== 'undefined' && window.location.search.includes('seed=true')) {
  const result = seedVagas();
  alert(`${result} vagas geradas com sucesso! A página irá recarregar.`);
  window.location.href = window.location.pathname;
}
