import React, { memo } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function OperatorNode({ id, data }: NodeProps<Node<{ text: string; label?: string }>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <div style={{minWidth:'15px'}}>
      <div>{data.label ? data.label : `node ${id}`}</div> {/* הצגת label אם קיים, אחרת id */}
      <div>
    </div>
      <Handle type="source" id = "t" position={Position.Top}   />
      <Handle type="source" id = "l" position={Position.Left}   />
      <Handle type="source" id = "r" position={Position.Right}  />
      <Handle type="source" id='false' position={Position.Bottom} style={{zIndex: '999',left:'75%',background: 'black', position: 'absolute' }}>
        <FaTimesCircle style={{color: 'red', pointerEvents: 'none', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/></Handle>
      <Handle type="source" id='true' position={Position.Bottom}  style={{zIndex: '999',left: '25%', background: 'black', position: 'absolute' }}>
        <FaCheckCircle style={{color: 'green',pointerEvents: 'none', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/></Handle>

    </div>
  );
}

export default memo(OperatorNode);