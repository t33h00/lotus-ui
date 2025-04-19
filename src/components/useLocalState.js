import { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";

function useLocalState(defaultValue, key) {
  if (!key || typeof key !== "string") {
    throw new Error("The key parameter must be a non-empty string.");
  }

  const [value, setValue] = useState(() => {
    const localStorageValue = secureLocalStorage.getItem(key);
    try {
      return localStorageValue !== null ? JSON.parse(localStorageValue) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (value === null) {
      secureLocalStorage.removeItem(key); // Remove the key if value is null
    } else {
      secureLocalStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalState;