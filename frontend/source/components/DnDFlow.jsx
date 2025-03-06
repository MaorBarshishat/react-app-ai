import React, { useRef, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';
import TextNode from './nodes/TextNode'; 
import FourWayNode from './nodes/FourWayNode';
import OperatorNode from './nodes/OperatorNode';
import DefaultNode from './nodes/DefaultNode';
import { DnDProvider, useDnD } from './nodes/DnDContext';
import '@xyflow/react/dist/style.css';
import '../styles/FlowScreen.css'; // Import the new styles

const initialNodes = [];
let id = 0;

// Function to generate unique IDs for nodes
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type, label, color] = useDnD();

  // Handle drag over event
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop event to create new nodes
  const onDrop = useCallback((event) => {
      event.preventDefault();

      if (!type) return; // Ensure the type is defined before proceeding

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        color,
        position,
        data: { label: `${label}` },
        style: {
          border: `2px solid ${color}`,
        },
      };

      setNodes((nds) => nds.concat(newNode)); // Add the new node to state
    },
    [screenToFlowPosition, type, label, color],
  );

  // Define custom node types
  const nodeTypes = {
    text: TextNode,
    fourWay: FourWayNode,
    operator: OperatorNode,
    default: DefaultNode,
  };

  // Handle connection events
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="dndflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          className='dark'
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
          connectionMode="loose"
        >
          <Controls position='bottom-right'/>
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DnDFlow;