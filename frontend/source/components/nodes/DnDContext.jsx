// DnDContext.jsx
import { createContext, useContext, useState } from 'react';

// יצירת הקשר
const DnDContext = createContext([null, () => {}, null]);

export const DnDProvider = ({ children }) => {
  const [type, setType] = useState(null); // מאחסן את ה-type
  const [label, setLabel] = useState(null); // מאחסן את ה-label
  const [color, setColor] = useState(null); // מאחסן את ה-color

  // הפונקציה שתשנה את ה-type וה-label
  const setNode = (nodeType, nodeLabel, nodeColor) => {
    setType(nodeType);  // עדכון ה-type
    setLabel(nodeLabel); // עדכון ה-label
    setColor(nodeColor); // עדכון ה-color

  };

  return (
    <DnDContext.Provider value={[type, label, color, setNode]}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

// הפונקציה שמחזירה את type, label ו-setNode
export const useDnD = () => {
  return useContext(DnDContext);
};