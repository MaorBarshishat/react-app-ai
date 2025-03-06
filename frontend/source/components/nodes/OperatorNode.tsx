import React, { memo } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';

function OperatorNode({ id, data }: NodeProps<Node<{ text: string; label?: string }>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <div style={{minWidth:'15px'}}>
      <div>{data.label ? data.label : `node ${id}`}</div> {/* הצגת label אם קיים, אחרת id */}
      <div>
    </div>
      <Handle type="source" id = "l" position={Position.Left}   />
      <Handle type="source" id='bottom-left' position={Position.Bottom} style={{left:'75%',background: 'red', position: 'absolute' }}/>
      <Handle type="source" id='bottom-right' position={Position.Bottom}  style={{left: '25%', background: 'green', position: 'absolute' }}/>
      <Handle type="source" id = "r" position={Position.Right}  />
    </div>
  );
}

export default memo(OperatorNode);