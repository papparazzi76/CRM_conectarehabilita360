/**
 * Cálculo de créditos basado en las reglas de negocio
 */

// Créditos base según valor del proyecto
export function calculateBaseCredits(projectValue: number): number {
  if (projectValue < 20000) return 1;
  if (projectValue <= 30000) return 2;
  if (projectValue <= 50000) return 3;
  if (projectValue <= 100000) return 4;
  return 5;
}

// Créditos adicionales según nivel de competencia
export function calculateAdditionalCredits(competitionLevel: number, isExclusive: boolean): number {
  if (isExclusive) return 10;
  
  switch (competitionLevel) {
    case 4: return 1; // hasta 4 empresas más
    case 3: return 2; // hasta 3 empresas más
    case 2: return 3; // hasta 2 empresas más
    case 1: return 4; // con 1 empresa más
    default:
      throw new Error('Invalid competition level');
  }
}

// Coste total de créditos
export function calculateTotalCost(projectValue: number, competitionLevel: number, isExclusive: boolean): number {
  const baseCredits = calculateBaseCredits(projectValue);
  const additionalCredits = calculateAdditionalCredits(competitionLevel, isExclusive);
  return baseCredits + additionalCredits;
}

// Validar si un nivel de competencia es válido para un lead
export function validateCompetitionLevel(competitionLevel: number, currentShares: number, maxShares: number): boolean {
  if (competitionLevel < 0 || competitionLevel > 4) return false;
  
  // Para exclusividad (competitionLevel = 0), debe haber 0 shares actuales
  if (competitionLevel === 0) return currentShares === 0;
  
  // Para otros niveles, verificar que no se supere el máximo
  const totalAfterPurchase = currentShares + 1;
  const maxAllowed = competitionLevel + 1; // competitionLevel 4 = hasta 5 empresas total
  
  return totalAfterPurchase <= Math.min(maxAllowed, maxShares + 1);
}

// Obtener descripción del nivel de competencia
export function getCompetitionDescription(competitionLevel: number, isExclusive: boolean): string {
  if (isExclusive) return 'Exclusividad total (solo tu empresa)';
  
  switch (competitionLevel) {
    case 4: return 'Compartido con hasta 4 empresas más';
    case 3: return 'Compartido con hasta 3 empresas más';
    case 2: return 'Compartido con hasta 2 empresas más';
    case 1: return 'Compartido con 1 empresa más';
    default: return 'Nivel no válido';
  }
}