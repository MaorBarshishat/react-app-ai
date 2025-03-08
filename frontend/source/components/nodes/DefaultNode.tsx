import React, { memo } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';

function DefaultNode({ id, data }: NodeProps<Node<{ text: string; label?: string }>>) {
  const { updateNodeData } = useReactFlow();

  return (
    <div >
      <div>{data.label ? data.label : `node ${id}`}</div> {/* הצגת label אם קיים, אחרת id */}
      <div>
    </div>
      <Handle type="source" id = "l" position={Position.Left}   />
      <Handle type="source" id='b' position={Position.Bottom} />
      <Handle type="source" id='t' position={Position.Top} />
      <Handle type="source" id = "r" position={Position.Right}  />
    </div>
  );
}

export default memo(DefaultNode);