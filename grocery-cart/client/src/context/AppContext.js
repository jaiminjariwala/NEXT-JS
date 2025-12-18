// global state management
// create context using useContext Hook

import { createContext, useContext } from "react";

export const AppContext = createContext(null);  // empty container for shared data

export const useAppContext = () => {
  return useContext(AppContext);
}; 
