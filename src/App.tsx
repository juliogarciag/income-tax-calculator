import clsx from "clsx";
import { ReactNode, useEffect, useMemo, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";
import useIncomeTaxCalculation, {
  CalculationData,
} from "./useIncomeTaxCalculation";
import useInputState, { UseInputStateReturn } from "./useInputState";
import useToggle from "./useToggle";

const TAX_BRACKETS_TABLE = [
  { amountInUIT: 5, rate: 0.08 },
  { amountInUIT: 15, rate: 0.14 },
  { amountInUIT: 15, rate: 0.17 },
  { amountInUIT: 10, rate: 0.2 },
  { amountInUIT: Infinity, rate: 0.3 },
];

const UIT_BY_YEAR = {
  "2012": 3650,
  "2013": 3700,
  "2014": 3800,
  "2015": 3850,
  "2016": 3950,
  "2017": 4050,
  "2018": 4150,
  "2019": 4200,
  "2020": 4300,
  "2021": 4400,
  "2022": 4600,
} as const;

const AVAILABLE_YEARS = Object.keys(UIT_BY_YEAR);
type AvailableYears = keyof typeof UIT_BY_YEAR;

function App() {
  const yearlyIncomeAmountInput = useInputState<number>(0);
  const yearInput = useInputState<AvailableYears>("2021");
  const usingBrekdownToggle = useToggle(false);

  const calculation = useIncomeTaxCalculation({
    uit: UIT_BY_YEAR[yearInput.value],
    grossYearlyIncome: yearlyIncomeAmountInput.value,
    taxBracketsTable: TAX_BRACKETS_TABLE,
  });

  return (
    <div className="p-4 max-w-4xl mx-auto flex-row space-y-4">
      <h1 className="text-3xl">Calculadora del Impuesto a la Renta en 🇵🇪</h1>
      <div className="w-full h-px border-t border-gray-300" />
      <CalculationFields
        yearInput={yearInput}
        yearlyIncomeAmountInput={yearlyIncomeAmountInput}
        usingBrekdownToggle={usingBrekdownToggle}
      />
      <div className="w-full h-px border-b border-gray-300" />
      <UITInfoBlock year={yearInput.value} />
      <div className="border border-gray-400 p-4 space-y-6">
        <h2 className="text-xl border-b border-gray-700 inline-flex">
          Deducciones
        </h2>
        <TaxDeductions calculation={calculation} />

        <h2 className="text-xl border-b border-gray-700 inline-flex">
          Distribución del Monto Imponible
        </h2>
        <TaxableAmountDistributionTable calculation={calculation} />
      </div>
    </div>
  );
}

function TaxDeductionListItem({
  number,
  title,
  subtitle,
  content,
  subContent,
  bulletClassName,
  bullet,
}: {
  number: number;
  title: ReactNode;
  subtitle?: ReactNode;
  content: ReactNode;
  subContent?: ReactNode;
  bulletClassName?: string;
  bullet?: ReactNode;
}) {
  const numberClassName = clsx(
    "border bg-teal-600 text-white inline-flex w-8 h-8 items-center rounded-full mr-3",
    bulletClassName ?? "",
  );

  return (
    <div className="text-lg flex items-center">
      <div className={numberClassName}>
        <h3 className="w-full text-center">{bullet ? bullet : number}</h3>
      </div>
      <div className="mr-3">
        <div className="mr-2">{title}</div>
        {subtitle ? (
          <div className="text-base text-gray-700">{subtitle}</div>
        ) : null}
      </div>
      <div className="ml-auto font-semibold text-xl text-right">
        <div className="py-1">{content}</div>
        {subContent}
      </div>
    </div>
  );
}

function TaxDeductions({ calculation }: { calculation: CalculationData }) {
  const { deductions, taxableAmounts } = calculation;

  return (
    <div className="mt-8 space-y-6">
      <TaxDeductionListItem
        number={1}
        title="Deducción del 20%"
        subtitle={
          <>
            hasta {deductions.first.limitInUIT} UIT (
            <span className="text-sm">
              {formatMoney(deductions.first.limit)})
            </span>
          </>
        }
        content={<>{formatMoney(-deductions.first.deductedAmount)}</>}
      />
      <TaxDeductionListItem
        number={2}
        title={
          <>
            Deducción de {deductions.second.amountInUIT} UIT{" "}
            <span className="text-sm text-gray-700">
              ({formatMoney(deductions.second.expectedAmount)})
            </span>
          </>
        }
        subtitle={<>hasta {formatMoney(taxableAmounts.afterFirstDeduction)}</>}
        content={<>{formatMoney(-deductions.second.deductedAmount)}</>}
      />
      <TaxDeductionListItem
        number={3}
        title="Total a deducir"
        content={formatMoney(
          -(deductions.first.deductedAmount + deductions.second.deductedAmount),
        )}
      />

      <TaxDeductionListItem
        number={4}
        title="Monto Imponible"
        bullet={<>4</>}
        bulletClassName="bg-teal-50 border-2 border-teal-700 text-teal-700 font-bold"
        content={formatMoney(taxableAmounts.finalAmount)}
        subContent={
          <div className="font-normal text-sm">
            {formatMoney(taxableAmounts.initialAmount)} -{" "}
            {formatMoney(
              deductions.first.deductedAmount +
                deductions.second.deductedAmount,
            )}
          </div>
        }
      />
    </div>
  );
}

function CalculationFields({
  yearInput,
  yearlyIncomeAmountInput,
  usingBrekdownToggle,
}: {
  yearInput: UseInputStateReturn<AvailableYears>;
  yearlyIncomeAmountInput: UseInputStateReturn<number>;
  usingBrekdownToggle: ReturnType<typeof useToggle>;
}) {
  const toggleInputBreakdown = () => {
    usingBrekdownToggle.toggle();
  };

  return (
    <div className="flex-col space-y-2 text-lg">
      <div className="flex items-center w-96 justify-between">
        <label className="mr-4" htmlFor="year">
          Año
        </label>
        <select
          id="year"
          className="border p-2 w-32 text-right"
          value={yearInput.htmlValue}
          onChange={yearInput.handleChange}
        >
          {AVAILABLE_YEARS.map((year) => {
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>
      <div className="flex items-center w-160 justify-between">
        <label className="mr-4" htmlFor="yearlyIncomeAmount">
          Ingresos del año {yearInput.value}
        </label>
        <div>
          <span className="px-1">S/ </span>
          <input
            type="number"
            id="yearlyIncomeAmount"
            className="border p-2 w-32 text-right"
            value={yearlyIncomeAmountInput.htmlValue}
            onChange={yearlyIncomeAmountInput.handleChange}
            disabled={usingBrekdownToggle.value}
          />
        </div>
        <div className="w-56">
          <button
            className="text-sm relative right-4 border border-gray-400 px-2 py-1 bg-gray-100"
            onClick={toggleInputBreakdown}
          >
            {usingBrekdownToggle.value ? (
              <>esconder desglose</>
            ) : (
              <>usar desglose</>
            )}
          </button>
        </div>
      </div>

      <div
        className={clsx("py-3 border border-gray-400 bg-yellow-50", {
          hidden: !usingBrekdownToggle.value,
        })}
      >
        <Breakdown
          initialAmount={yearlyIncomeAmountInput.value}
          onChange={({ totalAmount }) => {
            yearlyIncomeAmountInput.updateValue(
              totalAmount.toString(),
              totalAmount,
            );
          }}
        />
      </div>
    </div>
  );
}

type BreakdownItem = {
  amount: number;
  label: string;
};

type BreakdownState = {
  [id: string]: BreakdownItem;
};

type BreakdownAction =
  | {
      type: "UPDATE_LABEL";
      id: string;
      label: string;
    }
  | {
      type: "UPDATE_AMOUNT";
      id: string;
      amount: number;
    }
  | {
      type: "ADD_ITEM";
      label: string;
      amount: number;
    }
  | {
      type: "DUPLICATE_ITEM";
      id: string;
    }
  | {
      type: "DELETE_ITEM";
      id: string;
    };

function breakdownReducer(
  state: BreakdownState,
  action: BreakdownAction,
): BreakdownState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        [uuidv4()]: {
          label: action.label,
          amount: action.amount,
        },
      };
    case "UPDATE_AMOUNT":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          amount: action.amount,
        },
      };
    case "UPDATE_LABEL":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          label: action.label,
        },
      };
    case "DUPLICATE_ITEM":
      return {
        ...state,
        [uuidv4()]: {
          ...state[action.id],
        },
      };
    case "DELETE_ITEM":
      const newState = { ...state };
      delete newState[action.id];
      return newState;
    default:
      return state;
  }
}

function Breakdown({
  initialAmount,
  onChange,
}: {
  initialAmount: number;
  onChange: (options: { totalAmount: number }) => void;
}) {
  const [items, dispatch] = useReducer(breakdownReducer, {
    [uuidv4()]: { label: "Ingreso", amount: initialAmount },
  });

  const totalAmount = useMemo(() => {
    return Object.values(items).reduce((total, item) => total + item.amount, 0);
  }, [items]);

  useEffect(
    function emitChangeEvent() {
      onChange({ totalAmount });
    },
    [totalAmount, onChange],
  );

  return (
    <ul className="space-y-2">
      {Object.entries(items).map(([id, item], index) => {
        return (
          <li key={id}>
            <Item
              id={id}
              itemNumber={index + 1}
              item={item}
              updateLabel={(id: string, label: string) => {
                dispatch({ type: "UPDATE_LABEL", id, label });
              }}
              updateAmount={(id: string, amount: number) => {
                dispatch({ type: "UPDATE_AMOUNT", id, amount });
              }}
              duplicateItem={(id: string) => {
                dispatch({ type: "DUPLICATE_ITEM", id });
              }}
              deleteItem={(id: string) => {
                dispatch({ type: "DELETE_ITEM", id });
              }}
            />
          </li>
        );
      })}
      <li>
        <button
          onClick={() => {
            dispatch({ type: "ADD_ITEM", label: "Ingreso", amount: 0 });
          }}
          className="mx-2 text-sm border border-gray-400 px-2 py-1 bg-yellow-100 mt-3"
        >
          Agregar Entrada
        </button>
      </li>
    </ul>
  );
}

function Item({
  id,
  item,
  itemNumber,
  updateLabel,
  updateAmount,
  duplicateItem,
  deleteItem,
}: {
  id: string;
  item: BreakdownItem;
  itemNumber: number;
  updateLabel: (id: string, label: string) => void;
  updateAmount: (id: string, amount: number) => void;
  duplicateItem: (id: string) => void;
  deleteItem: (id: string) => void;
}) {
  const itemAmount = useInputState(item.amount);

  useEffect(() => {
    updateAmount(id, itemAmount.value);
  }, [itemAmount.value, updateAmount, id]);

  return (
    <div className="flex flex-row text-sm items-center w-160">
      <div className="ml-3">{itemNumber}</div>
      <input
        type="text"
        className="border px-2 py-1 ml-2"
        value={item.label}
        onChange={(event) => updateLabel(id, event.target.value)}
      />
      <input
        type="number"
        className="w-32 border px-2 py-1 ml-auto text-right"
        value={itemAmount.htmlValue}
        onChange={itemAmount.handleChange}
      />
      <div className="w-64">
        <button
          className="ml-4 px-2 py-1 border bg-yellow-100 border-gray-400"
          onClick={() => duplicateItem(id)}
        >
          Duplicar
        </button>
        <button
          className="ml-4 px-2 py-1  bg-gray-500 text-white border-gray-400"
          onClick={() => deleteItem(id)}
        >
          Remover
        </button>
      </div>
    </div>
  );
}

function FullCell({ size, children }: { size: number; children: ReactNode }) {
  return (
    <th className="font-normal text-xl p-4 bg-yellow-50" colSpan={size}>
      {children}
    </th>
  );
}

function ImportantNumberCell({ children }: { children: ReactNode }) {
  return (
    <td className="p-4 text-xl font-medium border-t border-x border-collapse border-gray-600">
      {children}
    </td>
  );
}

function NumberDetailCell({ children }: { children: ReactNode }) {
  return (
    <td className="px-4 pb-2 text-sm border-b border-x border-collapse border-gray-600">
      {children}
    </td>
  );
}

const PROGRESS_BAR_COLORS = [
  `bg-teal-300`,
  `bg-green-300`,
  `bg-lime-300`,
  `bg-orange-300`,
  `bg-red-300`,
];
const PROGRESS_BAR_DEFAULT_COLOR = "bg-gray-100";

function ProgressBarRow({
  taxBracketResults,
}: {
  taxBracketResults: CalculationData["taxBracketResults"];
}) {
  return (
    <tr>
      {taxBracketResults.map((result, index) => {
        const backgroundClassName =
          result.taxableAmount === 0
            ? PROGRESS_BAR_DEFAULT_COLOR
            : PROGRESS_BAR_COLORS[index];

        return (
          <th
            key={index}
            className={`p-4 border border-gray-600 ${backgroundClassName}`}
          ></th>
        );
      })}
    </tr>
  );
}

function TaxableAmountDistributionTable({
  calculation,
}: {
  calculation: CalculationData;
}) {
  const { taxBracketResults } = calculation;

  return (
    <div className="space-y-2">
      <table className="w-full border border-gray-600 text-center">
        <thead>
          <tr>
            <FullCell size={taxBracketResults.length}>
              <span>Monto Imponible:</span>{" "}
              <strong>
                {formatMoney(calculation.taxableAmounts.finalAmount)}
              </strong>
            </FullCell>
          </tr>
          <ProgressBarRow taxBracketResults={taxBracketResults} />
        </thead>
        <tbody>
          <tr>
            {taxBracketResults.map((result, index) => {
              return (
                <ImportantNumberCell key={index}>
                  {formatMoney(result.taxableAmount)}
                </ImportantNumberCell>
              );
            })}
          </tr>
          <tr>
            {taxBracketResults.map((result, index) => {
              const taxBracket = TAX_BRACKETS_TABLE[index];

              return (
                <NumberDetailCell key={index}>
                  {result.rangeInUIT.min === 0 ? (
                    <>Primeras {taxBracket.amountInUIT} UIT</>
                  ) : result.rangeInUIT.max === Infinity ? (
                    <>El monto restante</>
                  ) : (
                    <>Siguientes {taxBracket.amountInUIT} UIT</>
                  )}
                  <br />
                  <span>
                    {result.rangeInUIT.max === Infinity ? null : (
                      <>
                        ({taxBracket.amountInUIT} UIT ={" "}
                        {formatMoney(taxBracket.amountInUIT * calculation.uit)})
                      </>
                    )}
                  </span>
                </NumberDetailCell>
              );
            })}
          </tr>
          <tr>
            {taxBracketResults.map((result, index) => {
              return (
                <ImportantNumberCell key={index}>
                  {formatMoney(result.taxes)}
                </ImportantNumberCell>
              );
            })}
          </tr>
          <tr>
            {taxBracketResults.map((result, index) => {
              return (
                <NumberDetailCell key={index}>
                  {Math.round(result.rate * 100)}% de{" "}
                  <span className="font-medium">
                    {formatMoney(result.taxableAmount)}
                  </span>
                </NumberDetailCell>
              );
            })}
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <FullCell size={taxBracketResults.length}>
              <p>
                Impuesto a la Renta:{" "}
                <em className="text-base text-gray-700">(aprox.)</em>
              </p>
              <strong className="block text-3xl p-3">
                {formatMoney(calculation.totalTaxes)}
              </strong>
            </FullCell>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function UITInfoBlock({ year }: { year: AvailableYears }) {
  return (
    <div className="border border-gray-400 p-2 inline-flex items-center bg-yellow-50">
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
        para el ejercicio del año {year}:
      </span>{" "}
      <span className="ml-3 p-2 font-semibold border border-dashed bg-yellow-200">
        {formatMoney(UIT_BY_YEAR[year])}
      </span>
    </div>
  );
}

function formatMoney(amount: number) {
  if (amount === 0) {
    return `S/ 0`;
  }
  if (amount < 0) {
    return `- S/ ${Math.abs(amount).toLocaleString()}`;
  }
  return `S/ ${amount.toLocaleString()}`;
}

export default App;
