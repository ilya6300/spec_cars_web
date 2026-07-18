import { describe, it, expect } from "vitest";

describe("SpeedDisplay logic — max speed selection", () => {
  describe("findMaxSpeed", () => {
    const findMaxSpeed = (questCars) => {
      if (questCars.length === 0) return null;
      return Math.max(...questCars.map((car) => car.currentSpeed));
    };

    it("возвращает null при 0 машинах", () => {
      expect(findMaxSpeed([])).toBeNull();
    });

    it("возвращает скорость при 1 машине", () => {
      const result = findMaxSpeed([{ currentSpeed: 45 }]);
      expect(result).toBe(45);
    });

    it("возвращает максимальную скорость при 2 машинах", () => {
      const result = findMaxSpeed([
        { currentSpeed: 40 },
        { currentSpeed: 65 },
      ]);
      expect(result).toBe(65);
    });

    it("возвращает максимальную скорость при 3+ машинах", () => {
      const result = findMaxSpeed([
        { currentSpeed: 30 },
        { currentSpeed: 55 },
        { currentSpeed: 80 },
        { currentSpeed: 45 },
      ]);
      expect(result).toBe(80);
    });

    it("возвращает максимальную, если первая машина самая быстрая", () => {
      const result = findMaxSpeed([
        { currentSpeed: 90 },
        { currentSpeed: 50 },
        { currentSpeed: 30 },
      ]);
      expect(result).toBe(90);
    });

    it("возвращает максимальную, если последняя машина самая быстрая", () => {
      const result = findMaxSpeed([
        { currentSpeed: 20 },
        { currentSpeed: 40 },
        { currentSpeed: 75 },
      ]);
      expect(result).toBe(75);
    });

    it("корректно обрабатывает одинаковые скорости", () => {
      const result = findMaxSpeed([
        { currentSpeed: 50 },
        { currentSpeed: 50 },
        { currentSpeed: 50 },
      ]);
      expect(result).toBe(50);
    });

    it("корректно обрабатывает скорости 0", () => {
      const result = findMaxSpeed([
        { currentSpeed: 0 },
        { currentSpeed: 0 },
      ]);
      expect(result).toBe(0);
    });
  });
});
