import React, { memo, useEffect, useRef } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import '../../styles/CombinedNode.css';

// Define types for our node data structure
interface NodeType {
  label: string;
  title?: string;
  type: 'string' | 'stringInput' | 'timeInput' | 'operator';
  value?: string;
  timeFormat?: 'specific' | 'duration';
  operatorType?: string;
  leftParam?: { type: 'string' | 'input', value: string };
  rightParam?: { type: 'string' | 'input', value: string };
  enabled?: boolean;
}

// Helper to convert operator types to symbols
const getOperatorSymbol = (operatorType?: string): string => {
  switch (operatorType?.toLowerCase()) {
    case 'and': return '&&';
    case 'or': return '||';
    case 'xor': return '⊕';
    case 'not': return '!';
    case 'eq': return '==';
    case 'neq': return '!=';
    case 'gt': return '>';
    case 'gte': return '≥';
    case 'lt': return '<';
    case 'lte': return '≤';
    case 'contains': return '∋';
    case 'startswith': return '^=';
    case 'endswith': return '$=';
    case 'matches': return '≈';
    default: return operatorType || '';
  }
};

function CombinedNode({ id, data }: NodeProps<Node<{text: string; label: string }>>) {
  const { updateNodeData } = useReactFlow();
  
  // Parse the node data
  let nodeArray: NodeType[] = [];
  try {
    nodeArray = JSON.parse(data.label);
    console.log("Parsed node data:", nodeArray);
  } catch (error) {
    console.error("Failed to parse node data:", error);
  }

  // Filter out disabled nodes
  const enabledNodes = nodeArray.filter(node => node.enabled !== false);

  return (
    <div className="combined-node">
      <div className="combined-node-content">
        {enabledNodes.length > 0 ? (
          enabledNodes.map((node, index) => (
            <div 
              key={index} 
              className={`node-line ${node.type}`}
            >
              {node.type === 'string' && (
                <div className="string-node">
                  <span>{node.label}</span>
                </div>
              )}
              
              {node.type === 'stringInput' && (
                <div className="string-input-node">
                  <label>{node.label}</label>
                  <input 
                    type="text"
                    value={node.value || ''}
                    onChange={(e) => {
                      // Create a deep copy of the node array
                      const updatedNodes = [...nodeArray];
                      // Find the original node index in the full array
                      const originalIndex = nodeArray.findIndex(n => 
                        n.label === node.label && n.type === node.type
                      );
                      if (originalIndex !== -1) {
                        updatedNodes[originalIndex] = { ...node, value: e.target.value };
                        // Update the node data
                        updateNodeData(id, { label: JSON.stringify(updatedNodes) });
                      }
                    }}
                    placeholder="Enter value"
                    className="node-input"
                  />
                </div> 
              )}
              
              {node.type === 'timeInput' && (
                <div className="time-input-node">
                  <label>{node.label}</label>
                  {node.timeFormat === 'duration' ? (
                    <input 
                      type="text"
                      value={node.value || ''}
                      onChange={(e) => {
                        const updatedNodes = [...nodeArray];
                        const originalIndex = nodeArray.findIndex(n => 
                          n.label === node.label && n.type === node.type
                        );
                        if (originalIndex !== -1) {
                          updatedNodes[originalIndex] = { ...node, value: e.target.value };
                          updateNodeData(id, { label: JSON.stringify(updatedNodes) });
                        }
                      }}
                      placeholder="e.g. 30ms"
                      className="node-input"
                    />
                  ) : (
                    <input 
                      type="time"
                      value={node.value || ''}
                      onChange={(e) => {
                        const updatedNodes = [...nodeArray];
                        const originalIndex = nodeArray.findIndex(n => 
                          n.label === node.label && n.type === node.type
                        );
                        if (originalIndex !== -1) {
                          updatedNodes[originalIndex] = { ...node, value: e.target.value };
                          updateNodeData(id, { label: JSON.stringify(updatedNodes) });
                        }
                      }}
                      className="node-input time-input"
                    />
                  )}
                </div>
              )}
              
              {node.type === 'operator' && node.operatorType === 'newline' ? (
                <div className="node-divider"></div>
              ) : node.type === 'operator' && (
                <div className="operator-node">
                  <div className="operator-param left-param">
                    {node.leftParam?.type === 'input' ? (
                      <input 
                        type="text"
                        value={node.leftParam?.value || ''}
                        onChange={(e) => {
                          const updatedNodes = [...nodeArray];
                          const originalIndex = nodeArray.findIndex(n => 
                            n.label === node.label && n.type === node.type
                          );
                          if (originalIndex !== -1) {
                            updatedNodes[originalIndex] = { 
                              ...node, 
                              leftParam: { ...node.leftParam, value: e.target.value } 
                            };
                            updateNodeData(id, { label: JSON.stringify(updatedNodes) });
                          }
                        }}
                        className="param-input"
                      />
                    ) : (
                      <span>{node.leftParam?.value}</span>
                    )}
                  </div>
                  
                  <div className="operator-symbol">
                    {getOperatorSymbol(node.operatorType)}
                  </div>
                  
                  <div className="operator-param right-param">
                    {node.rightParam?.type === 'input' ? (
                      <input 
                        type="text"
                        value={node.rightParam?.value || ''}
                        onChange={(e) => {
                          const updatedNodes = [...nodeArray];
                          const originalIndex = nodeArray.findIndex(n => 
                            n.label === node.label && n.type === node.type
                          );
                          if (originalIndex !== -1) {
                            updatedNodes[originalIndex] = { 
                              ...node, 
                              rightParam: { ...node.rightParam, value: e.target.value } 
                            };
                            updateNodeData(id, { label: JSON.stringify(updatedNodes) });
                          }
                        }}
                        className="param-input"
                      />
                    ) : (
                      <span>{node.rightParam?.value}</span>
                    )}
                  </div>
                </div>
              )}
              
            </div>
          ))
        ) : (
          <div className="empty-node">Node configuration empty</div>
        )}
      </div>
      
      {/* Handles for connections */}
      <Handle type="source" id="l" position={Position.Left} />
      <Handle type="source" id="b" position={Position.Bottom} />
      <Handle type="source" id="t" position={Position.Top} />
      <Handle type="source" id="r" position={Position.Right} />
    </div>
  );
}

export default memo(CombinedNode);
