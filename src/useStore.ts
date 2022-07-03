import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { UIT_BY_YEAR } from "./App";
import { v4 as uuidv4 } from "uuid";

export type BreakdownItem = {
  amount: number;
  label: string;
};

type BreakdownItems = {
  [id: string]: BreakdownItem;
};

type AvailableYears = keyof typeof UIT_BY_YEAR;
type AppState = {
  year: AvailableYears;
  yearlyIncome: number;
  usingBrekdown: boolean;
  breakdownItems: BreakdownItems;

  updateYear: (year: AvailableYears) => void;
  updateYearlyIncome: (income: number) => void;
  toggleUsingBreakdown: () => void;

  addBreakdownItem: (item: BreakdownItem) => void;
  updateBreakdownItem: (id: string, changes: Partial<BreakdownItem>) => void;
  duplicateBreakdownItem: (id: string) => void;
  deleteBreakdownItem: (id: string) => void;
};

const useStore = create<AppState>()(
  persist(
    immer((set) => {
      return {
        year: "2021",
        yearlyIncome: 0,
        usingBrekdown: false,
        breakdownItems: {},

        updateYear(year) {
          set((state) => {
            state.year = year;
          });
        },

        updateYearlyIncome(yearlyIncome) {
          set((state) => {
            state.yearlyIncome = yearlyIncome;
          });
        },

        toggleUsingBreakdown() {
          set((state) => {
            state.usingBrekdown = !state.usingBrekdown;
          });
        },

        addBreakdownItem(item) {
          set((state) => {
            const newId = uuidv4();
            state.breakdownItems[newId] = item;
          });
        },

        updateBreakdownItem(id, changes) {
          set((state) => {
            state.breakdownItems[id] = {
              ...state.breakdownItems[id],
              ...changes,
            };
          });
        },

        duplicateBreakdownItem(id) {
          set((state) => {
            const newId = uuidv4();
            state.breakdownItems[newId] = { ...state.breakdownItems[id] };
          });
        },

        deleteBreakdownItem(id) {
          set((state) => {
            delete state.breakdownItems[id];
          });
        },
      };
    }),
    {
      name: "income-tax-calculator",
    },
  ),
);

export default useStore;
