import { ChangeEvent, useCallback, useMemo, useState } from "react";

function useInputState<Value extends string | number | Date>(
  defaultValue: Value,
) {
  const [rawValue, setRawValue] = useState<string>(defaultValue.toString());
  const [value, setValue] = useState<Value>(defaultValue);

  const htmlValue = useMemo(() => {
    if (typeof value === "string") {
      return value;
    } else if (typeof value === "number") {
      if (rawValue === "") {
        return "";
      } else {
        return Number(value);
      }
    } else if (typeof value === "object" && value instanceof Date) {
      const isoDate = value.toISOString();
      return isoDate.split("T")[0];
    } else {
      throw new Error("Type of value is not a supported value yet.");
    }
  }, [value, rawValue]);

  const updateValue = useCallback((rawValue: string, value: Value) => {
    setRawValue(rawValue);
    setValue(value);
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const inputType = event.target.type;
      const rawValue = event.target.value;

      setRawValue(rawValue.trim());

      if (inputType === "text" || event.target instanceof HTMLSelectElement) {
        setValue(event.target.value as Value);
      } else if (inputType === "number") {
        const valueAsNumber = event.target.valueAsNumber;
        if (rawValue === "") {
          setValue(0 as Value);
        } else if (!isNaN(valueAsNumber)) {
          setValue(valueAsNumber as Value);
        }
      } else if (inputType === "date") {
        const valueAsDate = event.target.valueAsDate;
        if (valueAsDate !== null) {
          setValue(event.target.valueAsDate as Value);
        }
      } else {
        throw new Error("input type is not something we can parse yet.");
      }
    },
    [setValue],
  );

  return {
    value,
    htmlValue,
    handleChange,
    updateValue,
  };
}

class Wrapper<T extends string | number | Date> {
  // wrapped has no explicit return type so we can infer it
  wrapped(e: T) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useInputState<T>(e);
  }
}

export type UseInputStateReturn<Value extends string | number | Date> =
  ReturnType<Wrapper<Value>["wrapped"]>;

export default useInputState;
