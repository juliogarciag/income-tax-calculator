import useIncomeTaxCalculation, {
  CalculationData,
} from "./useIncomeTaxCalculation";
import useInputState from "./useInputState";

const TAX_BRACKETS_TABLE = [
  { amountInUIT: 5, rate: 0.08 },
  { amountInUIT: 15, rate: 0.14 },
  { amountInUIT: 15, rate: 0.17 },
  { amountInUIT: 10, rate: 0.2 },
  { amountInUIT: Infinity, rate: 0.3 },
];

function App() {
  const UIT = 4400;
  const yearlyIncomeAmount = useInputState(
    Number(process.env.REACT_APP_TEST_YEARLY_INCOME_VALUE ?? 0),
  );
  const yearlyIncomeCurrency = useInputState<"USD" | "PEN">("PEN");

  const calculation = useIncomeTaxCalculation({
    uit: UIT,
    grossYearlyIncome: yearlyIncomeAmount.value,
    taxBracketsTable: TAX_BRACKETS_TABLE,
  });
  const { deductions, taxableAmounts } = calculation;

  return (
    <div className="p-4">
      <div className="flex items-center">
        <label className="mr-4" htmlFor="yearlyIncomeAmount">
          ¿Cuánto ganaste el año 2021?
        </label>
        <select
          className="mr-4 border p-2 text-base"
          id="yearlyIncomeCurrency"
          value={yearlyIncomeCurrency.htmlValue}
          onChange={yearlyIncomeCurrency.handleChange}
        >
          <option value="USD">Dólares</option>
          <option value="PEN">Soles</option>
        </select>
        <input
          type="number"
          id="yearlyIncomeAmount"
          className="border text-base p-2 w-32 text-right"
          value={yearlyIncomeAmount.htmlValue}
          onChange={yearlyIncomeAmount.handleChange}
        />
      </div>
      <div className="w-full h-px border-b inline-block" />
      <UITInfoBlock uit={UIT} />
      <div className="mt-4 max-w-2xl border p-4 space-y-6">
        <h2 className="text-xl border-b border-gray-700 inline-flex">
          Monto Imponible
        </h2>
        <div className="mt-8 space-y-6">
          <div className="text-lg flex items-center">
            <div className="border bg-teal-600 text-white inline-flex w-8 h-8 items-center rounded-full mr-3">
              <h3 className="w-full text-center">1</h3>
            </div>
            <div className="mr-3">
              <div className="mr-2">Deducción del 20%</div>
              <div className="text-base text-gray-700">
                hasta {deductions.first.limitInUIT} UIT (S/.{" "}
                {deductions.first.limit})
              </div>
            </div>
            <div className="ml-auto font-semibold text-xl text-right">
              <div className="py-1">
                S/. {taxableAmounts.afterFirstDeduction}
              </div>
              <div className="font-normal text-base">
                S/. {taxableAmounts.initialAmount} - S/.{" "}
                {deductions.first.deductedAmount}
              </div>
            </div>
          </div>
          <div className="text-lg flex items-center">
            <div className="border bg-teal-600 text-white inline-flex w-8 h-8 items-center rounded-full mr-3">
              <h3 className="w-full text-center">2</h3>
            </div>
            <div className="mr-3">
              <div className="mr-2">
                Deducción de {deductions.second.amountInUIT} UIT{" "}
                <span className="text-base text-gray-700">
                  (S/. {deductions.second.expectedAmount})
                </span>
              </div>
              <div className="text-base text-gray-700">
                hasta S/. {taxableAmounts.afterFirstDeduction}
              </div>
            </div>
            <div className="ml-auto font-semibold text-xl text-right">
              <div className="py-1">
                S/. {taxableAmounts.afterSecondDeduction}
              </div>
              <div className="font-normal text-base">
                S/. {taxableAmounts.afterFirstDeduction} - S/.{" "}
                {deductions.second.deductedAmount}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl border-b border-gray-700 inline-flex">
          Impuesto a la Renta
        </h2>
        <TaxBrackets calculation={calculation} />
      </div>
    </div>
  );
}

function TaxBrackets({ calculation }: { calculation: CalculationData }) {
  const { taxBracketResults } = calculation;

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th className="text-left pr-2 py-2 font-semibold">Tramo</th>
          <th className="text-left pr-2 py-2 font-semibold">Tasa</th>
          <th className="text-right pr-2 py-2 font-semibold">Monto</th>
          <th className="text-right pr-2 py-2 font-semibold">Impuestos</th>
        </tr>
      </thead>
      <tbody>
        {taxBracketResults.map((result, index) => {
          return (
            <tr key={index}>
              <td className="pr-2 py-1">{rangeToText(result.rangeInUIT)}</td>
              <td className="pr-2 py-1">{Math.round(result.rate * 100)}%</td>
              <td className="pr-2 py-1 text-right">
                S/. {result.taxableAmount}
              </td>
              <td className="pr-2 py-1 text-right">S/. {result.taxes}</td>
            </tr>
          );
        })}
        <tr className="border-b h-4"></tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td className="text-right pt-4 font-semibold">
            S/. {calculation.totalTaxes}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function UITInfoBlock({ uit }: { uit: number }) {
  return (
    <div className="border p-2 mt-4 inline-flex items-center bg-yellow-50">
      <span className="p-2 text-black bg-yellow-400 font-mono mr-3 font-bold">
        FYI
      </span>{" "}
      <span>
        Éste es el valor de la{" "}
        <a
          href="https://www.gob.pe/435-valor-de-la-uit"
          target="_blank"
          rel="noreferrer"
          className="border-b border-black border-dashed"
        >
          UIT
        </a>{" "}
        para el ejercicio del año 2021:
      </span>{" "}
      <span className="ml-3 p-2 font-semibold border border-dashed bg-yellow-200">
        S/. {uit}
      </span>
    </div>
  );
}

function rangeToText({ min, max }: { min: number; max: number }) {
  if (min === 0) {
    return `Hasta ${max} UIT`;
  }
  if (max === Infinity) {
    return `Desde ${min} UIT`;
  }
  return `${min} UIT → ${max} UIT`;
}

export default App;
