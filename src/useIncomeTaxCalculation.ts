import { useMemo } from "react";

type TaxBracketsTable = Array<{
  amountInUIT: number;
  rate: number;
}>;

function useIncomeTaxCalculation({
  uit,
  grossYearlyIncome,
  taxBracketsTable,
}: {
  uit: number;
  grossYearlyIncome: number;
  taxBracketsTable: TaxBracketsTable;
}) {
  return useMemo(() => {
    return getCalculation(uit, grossYearlyIncome, taxBracketsTable);
  }, [uit, grossYearlyIncome, taxBracketsTable]);
}

export type CalculationData = {
  uit: number;
  deductions: {
    first: {
      percentage: number;
      limitInUIT: number;
      limit: number;
      deductedAmount: number;
    };
    second: {
      amountInUIT: number;
      expectedAmount: number;
      deductedAmount: number;
    };
  };
  taxableAmounts: {
    initialAmount: number;
    afterFirstDeduction: number;
    afterSecondDeduction: number;
    finalAmount: number;
  };
  taxBracketResults: Array<{
    rangeInUIT: { min: number; max: number };
    rate: number;
    taxableAmount: number;
    taxes: number;
  }>;
  totalTaxes: number;
};

function getCalculation(
  uit: number,
  grossYearlyIncome: number,
  taxBracketsTable: TaxBracketsTable,
) {
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
      initialAmount: grossYearlyIncome,
      afterFirstDeduction: 0,
      afterSecondDeduction: 0,
      finalAmount: 0,
    },
    taxBracketResults: [],
    totalTaxes: 0,
  };

  applyDeductions(calculationData);
  applyTaxes(calculationData, taxBracketsTable);

  return calculationData;
}

function applyDeductions({ taxableAmounts, deductions }: CalculationData) {
  const firstDeduction = deductions.first;
  const secondDeduction = deductions.second;

  firstDeduction.deductedAmount = Math.round(
    Math.min(
      taxableAmounts.initialAmount * firstDeduction.percentage,
      firstDeduction.limit,
    ),
  );
  taxableAmounts.afterFirstDeduction =
    taxableAmounts.initialAmount - firstDeduction.deductedAmount;

  secondDeduction.deductedAmount = Math.min(
    secondDeduction.expectedAmount,
    taxableAmounts.afterFirstDeduction,
  );
  taxableAmounts.afterSecondDeduction =
    taxableAmounts.afterFirstDeduction - secondDeduction.deductedAmount;

  taxableAmounts.finalAmount = taxableAmounts.afterSecondDeduction;
}

function applyTaxes(
  calculationData: CalculationData,
  taxBracketsTable: TaxBracketsTable,
) {
  const uitRanges = taxBracketsToUITRanges(taxBracketsTable);

  let totalTaxes = 0;
  let untaxedIncome = calculationData.taxableAmounts.finalAmount;

  calculationData.taxBracketResults = taxBracketsTable.map(
    (taxBracket, index) => {
      const taxBracketAmount = taxBracket.amountInUIT * calculationData.uit;
      let taxableAmount = 0;

      if (untaxedIncome > 0) {
        if (taxBracketAmount === Infinity) {
          taxableAmount = untaxedIncome;
        } else {
          taxableAmount = Math.min(taxBracketAmount, untaxedIncome);
          untaxedIncome -= taxBracketAmount;
        }
      }

      const taxes = Math.round(taxBracket.rate * taxableAmount);
      totalTaxes += taxes;

      return {
        rangeInUIT: uitRanges[index],
        rate: taxBracket.rate,
        taxableAmount,
        taxes,
      };
    },
  );

  calculationData.totalTaxes = totalTaxes;
}

function taxBracketsToUITRanges(taxBrackets: TaxBracketsTable) {
  const ranges: Array<{ min: number; max: number }> = [];
  let usedAmountInUIT = 0;

  taxBrackets.forEach((taxBracket, index) => {
    if (index === 0) {
      ranges.push({ min: 0, max: taxBracket.amountInUIT });
      usedAmountInUIT += taxBracket.amountInUIT;
    } else if (index === taxBrackets.length - 1) {
      ranges.push({
        min: usedAmountInUIT,
        max: Infinity,
      });
    } else {
      const max = usedAmountInUIT + taxBracket.amountInUIT;
      ranges.push({ min: usedAmountInUIT, max });
      usedAmountInUIT = max;
    }
  });
  return ranges;
}

export default useIncomeTaxCalculation;
export { applyTaxes };
