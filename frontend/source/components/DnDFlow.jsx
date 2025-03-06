import React, { useRef, useCallback, useEffect } from 'react';
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
import { FaTrash } from 'react-icons/fa'; // Import the trash icon
import '@xyflow/react/dist/style.css';
import '../styles/FlowScreen.css'; // Import the new styles

const getId = (id) => `dndnode_${id}`; // Use the id directly.

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  
  // Load nodes and edges from local storage, or use empty arrays if there are none.
  const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')) || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges')) || []);
  
  const { screenToFlowPosition } = useReactFlow();
  const [type, label, color] = useDnD();

  // Save the nodes and edges to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('edges', JSON.stringify(edges));
  }, [edges]);

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
      id: getId(nodes.length), // You may want a unique ID generation strategy
      type,
      color,
      position,
      data: { label: `${label}` },
      style: {
        border: `2px solid ${color}`,
      },
    };

    setNodes((nds) => nds.concat(newNode)); // Add the new node to state
  }, [screenToFlowPosition, type, label, color, nodes.length, setNodes]);

  // Handle connection events
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Clear all nodes and edges
  const clearScreen = () => {
    setNodes([]); // Clear nodes
    setEdges([]); // Clear edges
    localStorage.removeItem('nodes'); // Clear from local storage
    localStorage.removeItem('edges'); // Clear from local storage
  };

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
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
          connectionMode="loose"
        >
          <Controls position='bottom-right'>
            <button className='react-clear-screen-button' onClick={clearScreen} >
              <FaTrash /> {/* Adding the trash icon */}
            </button>
          </Controls>
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DnDFlow;