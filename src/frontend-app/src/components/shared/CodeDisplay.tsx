import React from 'react';
import { Typography } from 'antd';
import { Line } from '../../types';
const { Text, Paragraph } = Typography;

interface CodeDisplayProps {
  lines: Line[];
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ lines }) => {
  return (
    <div>
    <br />
    <strong>Lines:</strong>
    <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
      
      {lines.map((line, index) => (
        <div
          key={line.Number || index}
          style={{
            display: 'flex',
            alignItems: 'center',
            lineHeight: '1.6',
            color: line.IsCause ? 'red' : 'black',
          }}
        >
          <Text type="secondary" style={{ width: '40px', textAlign: 'right', marginRight: '16px' }}>
            {line.Number}
          </Text>
          <Paragraph
            style={{
              margin: 0,
              background: line.FirstCause || line.LastCause ? '#ffe7ba' : 'transparent',
              padding: line.FirstCause || line.LastCause ? '2px 4px' : '0',
              borderRadius: '4px',
              flexGrow: 1,
            }}
            code
          >
            {line.Content || (line.Truncated ? '...' : '')}
          </Paragraph>
        </div>
      ))}
    </div>
    </div>
  );
};

export default CodeDisplay;