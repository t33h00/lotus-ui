import { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";

function useLocalState(defaultValue, key) {
    const[value,setValue] = useState(()=>{
        const localStorageValue = secureLocalStorage.getItem(key);
        return localStorageValue !== null ? JSON.parse(localStorageValue) : defaultValue;
    });

    useEffect(()=>{
        secureLocalStorage.setItem(key, JSON.stringify(value))
    },[key, value]);
    return[value,setValue];
}

export default useLocalState;