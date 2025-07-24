import React, { createContext, useContext, useState } from "react";

type SidebarSelectionContextType = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  module: number;
  setModule: (module: number) => void;
};

const SidebarSelectionContext = createContext<
  SidebarSelectionContextType | undefined
>(undefined);

export const SidebarSelectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [module, setModule] = useState(0);

  return (
    <SidebarSelectionContext.Provider
      value={{ selectedIndex, setSelectedIndex, module, setModule }}
    >
      {children}
    </SidebarSelectionContext.Provider>
  );
};

export const useSidebarSelection = () => {
  const context = useContext(SidebarSelectionContext);
  if (!context) {
    throw new Error(
      "useSidebarSelection must be used within a SidebarSelectionProvider"
    );
  }
  return context;
};
