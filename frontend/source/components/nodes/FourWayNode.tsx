import React, { memo, useEffect, useRef } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';

function FourWayNode({ id, data }: NodeProps<Node<{ text: string; label?: string }>>) {
  const { updateNodeData } = useReactFlow();

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '12px'; // Reset height before calculating new size
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Resize based on content
      }
    }, [data.text]); // Run every time the text content changes
  

  return (
    <div>
      <div>{data.label ? data.label : `node ${id}`}</div> {/* הצגת label אם קיים, אחרת id */}
      <div style={{paddingTop:"4px"}}>
      <textarea
        ref={textareaRef}
        onChange={(evt) => updateNodeData(id, { text: evt.target.value })}
        value={data?.text || ''}
        style={{
          width: '100%',
          fontSize: '12px', // You can adjust this if you'd like the text to be bigger or smaller
          resize: 'none', // Disable manual resizing, since we are handling resizing programmatically
          overflow: 'hidden', // Hide the scrollbar
        }}
      ></textarea>


      </div>
      <Handle type="source" id = "t" position={Position.Top}   />
      <Handle type="source" id = "r"  position={Position.Right} />
      <Handle type="source" id = "b" position={Position.Bottom}  />
      <Handle type="source" id = "l" position={Position.Left}  />
    </div>
  );
}

export default memo(FourWayNode);