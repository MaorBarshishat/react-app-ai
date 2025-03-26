import React, { createContext, useState, useContext } from 'react';

type TabType = 'policies' | 'investigations' | 'signals';

interface NavigationContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('policies');
  
  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Find the reducer or state management logic
const navigationReducer = (state, action) => {
  switch (action.type) {
    // ... existing cases ...
    
    case 'ADD_ITEM_TO_FOLDER':
      const { payload, folder, subFolder } = action;
      
      // Create a copy of the current folders
      const updatedFolders = { ...state.folders };
      
      // Ensure the folder exists
      if (!updatedFolders[folder]) {
        updatedFolders[folder] = { items: [], subFolders: {} };
      }
      
      // Ensure the subFolder exists
      if (subFolder) {
        if (!updatedFolders[folder].subFolders) {
          updatedFolders[folder].subFolders = {};
        }
        
        if (!updatedFolders[folder].subFolders[subFolder]) {
          updatedFolders[folder].subFolders[subFolder] = { items: [] };
        }
        
        // Add the item to the subFolder
        updatedFolders[folder].subFolders[subFolder].items = [
          payload,
          ...updatedFolders[folder].subFolders[subFolder].items
        ];
      } else {
        // Add to the main folder if no subFolder specified
        updatedFolders[folder].items = [
          payload,
          ...updatedFolders[folder].items
        ];
      }
      
      return {
        ...state,
        folders: updatedFolders
      };
      
    // ... other cases ...
  }
}; 