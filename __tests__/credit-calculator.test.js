/**
 * Tests unitarios para la lógica de cálculo de créditos
 */

const { 
  calculateBaseCredits, 
  calculateAdditionalCredits, 
  calculateTotalCost,
  validateCompetitionLevel 
} = require('../src/lib/credit-calculator');

describe('Credit Calculator', () => {
  describe('calculateBaseCredits', () => {
    test('should return 1 credit for projects under 20k', () => {
      expect(calculateBaseCredits(15000)).toBe(1);
      expect(calculateBaseCredits(19999)).toBe(1);
    });

    test('should return 2 credits for projects between 20k-30k', () => {
      expect(calculateBaseCredits(20000)).toBe(2);
      expect(calculateBaseCredits(25000)).toBe(2);
      expect(calculateBaseCredits(30000)).toBe(2);
    });

    test('should return 3 credits for projects between 30k-50k', () => {
      expect(calculateBaseCredits(35000)).toBe(3);
      expect(calculateBaseCredits(45000)).toBe(3);
      expect(calculateBaseCredits(50000)).toBe(3);
    });

    test('should return 4 credits for projects between 50k-100k', () => {
      expect(calculateBaseCredits(75000)).toBe(4);
      expect(calculateBaseCredits(99000)).toBe(4);
      expect(calculateBaseCredits(100000)).toBe(4);
    });

    test('should return 5 credits for projects over 100k', () => {
      expect(calculateBaseCredits(120000)).toBe(5);
      expect(calculateBaseCredits(500000)).toBe(5);
    });
  });

  describe('calculateAdditionalCredits', () => {
    test('should return 10 credits for exclusive access', () => {
      expect(calculateAdditionalCredits(0, true)).toBe(10);
      expect(calculateAdditionalCredits(1, true)).toBe(10);
      expect(calculateAdditionalCredits(4, true)).toBe(10);
    });

    test('should return correct credits for shared access levels', () => {
      expect(calculateAdditionalCredits(4, false)).toBe(1); // hasta 4 empresas más
      expect(calculateAdditionalCredits(3, false)).toBe(2); // hasta 3 empresas más
      expect(calculateAdditionalCredits(2, false)).toBe(3); // hasta 2 empresas más
      expect(calculateAdditionalCredits(1, false)).toBe(4); // con 1 empresa más
    });

    test('should throw error for invalid competition levels', () => {
      expect(() => calculateAdditionalCredits(0, false)).toThrow();
      expect(() => calculateAdditionalCredits(5, false)).toThrow();
    });
  });

  describe('calculateTotalCost', () => {
    test('should calculate total cost correctly - Example 1 from specs', () => {
      // Lead 39.000 € + compartir con 2 empresas más → 3 (base) + 3 (adicional) = 6 créditos
      const result = calculateTotalCost(39000, 2, false);
      expect(result).toBe(6);
    });

    test('should calculate total cost correctly - Example 2 from specs', () => {
      // Lead 120.000 € + exclusividad total → 5 (base) + 10 (adicional) = 15 créditos
      const result = calculateTotalCost(120000, 0, true);
      expect(result).toBe(15);
    });

    test('should handle various scenarios correctly', () => {
      // Proyecto pequeño, exclusivo
      expect(calculateTotalCost(15000, 0, true)).toBe(11); // 1 + 10

      // Proyecto medio, compartido con 4 empresas
      expect(calculateTotalCost(75000, 4, false)).toBe(5); // 4 + 1

      // Proyecto grande, compartido con 1 empresa
      expect(calculateTotalCost(150000, 1, false)).toBe(9); // 5 + 4
    });
  });

  describe('validateCompetitionLevel', () => {
    test('should validate exclusive access (level 0)', () => {
      expect(validateCompetitionLevel(0, 0, 4)).toBe(true);
      expect(validateCompetitionLevel(0, 1, 4)).toBe(false);
      expect(validateCompetitionLevel(0, 2, 4)).toBe(false);
    });

    test('should validate shared access levels', () => {
      // Con 0 shares actuales, cualquier nivel debería ser válido
      expect(validateCompetitionLevel(1, 0, 4)).toBe(true);
      expect(validateCompetitionLevel(2, 0, 4)).toBe(true);
      expect(validateCompetitionLevel(3, 0, 4)).toBe(true);
      expect(validateCompetitionLevel(4, 0, 4)).toBe(true);

      // Con 2 shares actuales
      expect(validateCompetitionLevel(4, 2, 4)).toBe(true); // 2 + 1 = 3 <= min(5, 5)
      expect(validateCompetitionLevel(3, 2, 4)).toBe(true); // 2 + 1 = 3 <= min(4, 5)
      expect(validateCompetitionLevel(2, 2, 4)).toBe(true); // 2 + 1 = 3 <= min(3, 5)
      expect(validateCompetitionLevel(1, 2, 4)).toBe(false); // 2 + 1 = 3 > min(2, 5)
    });

    test('should respect max shares limit', () => {
      // Máximo 2 empresas compartidas
      expect(validateCompetitionLevel(4, 1, 1)).toBe(true); // 1 + 1 = 2 <= min(5, 2)
      expect(validateCompetitionLevel(4, 2, 1)).toBe(false); // 2 + 1 = 3 > min(5, 2)
    });

    test('should reject invalid competition levels', () => {
      expect(validateCompetitionLevel(-1, 0, 4)).toBe(false);
      expect(validateCompetitionLevel(5, 0, 4)).toBe(false);
    });
  });
});