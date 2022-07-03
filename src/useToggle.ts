import { useState } from "react";

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    turnOn() {
      setValue(true);
    },
    turnOff() {
      setValue(false);
    },
    toggle() {
      setValue(!value);
    },
  };
}

export default useToggle;
