import { applyTaxes, CalculationData } from "./useIncomeTaxCalculation";

const TAX_BRACKETS_TABLE = [
  { amountInUIT: 5, rate: 0.08 },
  { amountInUIT: 15, rate: 0.14 },
  { amountInUIT: 15, rate: 0.17 },
  { amountInUIT: 10, rate: 0.2 },
  { amountInUIT: Infinity, rate: 0.3 },
];

describe("applyTaxes", () => {
  test("Properly calculate taxes in a tax range", () => {
    testSpecificAmount(18800, [0.08 * 18800, 0, 0, 0, 0]);
  });

  function testSpecificAmount(
    taxableAmount: number,
    expectedTaxes: [number, number, number, number, number],
  ) {
    const uit = 4400;
    const calculationData: CalculationData = {
      uit,
      deductions: {
        first: {
          percentage: 0.2,
          limitInUIT: 24,
          limit: 24 * uit,
          deductedAmount: 0,
        },
        second: {
          amountInUIT: 7,
          expectedAmount: 7 * uit,
          deductedAmount: 0,
        },
      },
      taxableAmounts: {
        initialAmount: taxableAmount,
        afterFirstDeduction: 0,
        afterSecondDeduction: 0,
        finalAmount: taxableAmount,
      },
      taxBracketResults: [],
      totalTaxes: 0,
    };

    applyTaxes(calculationData, TAX_BRACKETS_TABLE);

    expectedTaxes.forEach((expectedTax, index) => {
      expect(calculationData.taxBracketResults[index].taxes).toEqual(
        expectedTax,
      );
    });
  }
});
