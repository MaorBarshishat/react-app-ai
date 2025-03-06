import React from 'react';
import { NodeData } from '../nodes/types';
import './NodeItem.css';

interface NodeItemProps {
  data: NodeData;
}

const NodeItem: React.FC<NodeItemProps> = ({ data }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="node-item"
      onDragStart={(event) => onDragStart(event, data.type)}
      draggable
    >
      <div className="node-icon" style={{ backgroundColor: data.color || '#4CAF50' }}>
        {data.icon || '⬡'}
      </div>
      <span className="node-label">{data.label}</span>
    </div>
  );
};

export default NodeItem; 