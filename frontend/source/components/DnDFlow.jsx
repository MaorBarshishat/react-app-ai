import React, { useRef, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
  MarkerType
} from '@xyflow/react';
import CombinedNode from './nodes/CombinedNode';
import TextNode from './nodes/TextNode'; 
import FourWayNode from './nodes/FourWayNode';
import OperatorNode from './nodes/OperatorNode';
import DefaultNode from './nodes/DefaultNode';
import { DnDProvider, useDnD } from './nodes/DnDContext';
import { FaTrash } from 'react-icons/fa';
import '@xyflow/react/dist/style.css';
import '../styles/FlowScreen.css';

const getId = (id) => `dndnode_${id}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(JSON.parse(localStorage.getItem('nodes')) || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(JSON.parse(localStorage.getItem('edges')) || []);
  
  const { screenToFlowPosition } = useReactFlow();
  const [type, label, color] = useDnD();

  useEffect(() => {
    localStorage.setItem('nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('edges', JSON.stringify(edges));
  }, [edges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    if (!type) return; // Ensure the type is defined before proceeding
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: getId(nodes.length), // Get unique ID for the node
      type,
      position,
      color,
      position,
      data: { label: `${label}` },
      style: {
        border: `2px solid ${color}`,
      },
    };
    
    setNodes((nds) => nds.concat(newNode)); // Add the new node to state
  }, [screenToFlowPosition, type, label, color, nodes.length, setNodes]);

  const onConnect = useCallback((params) => {
    // Set default color to blue
   
    let edgeColor = 'blue';
    if (params.sourceHandle === 'false') {
      edgeColor = 'red'; // False exit
      params.markerEnd = {
        type: MarkerType.Arrow,
        width: 20,
        height: 20,
        color: 'red',
      };
    } else if (params.sourceHandle === 'true') {
      edgeColor = 'green'; // True exit
      params.markerEnd = {
        type: MarkerType.Arrow,
        width: 20,
        height: 20,
        color: 'green',
      };
    }

    params.style = {
      stroke: edgeColor,
      strokeWidth: 1,
      label: 'marker size and color',
    };



    console.log(params);
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);



  const clearScreen = () => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('nodes');
    localStorage.removeItem('edges');
  };

  const nodeTypes = {
    text: TextNode,
    fourWay: FourWayNode,
    operator: OperatorNode,
    default: DefaultNode,
    combined: CombinedNode,
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
          nodeTypes={nodeTypes}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
          connectionMode="loose"
        >
      
        
          <Controls position='bottom-right'>
          <button className='react-clear-screen-button' onClick={clearScreen}>
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