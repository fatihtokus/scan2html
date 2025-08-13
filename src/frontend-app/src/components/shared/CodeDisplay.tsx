import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { Line } from '../../types';
const { Text, Paragraph } = Typography;


interface CodeDisplayProps {
  lines: Line[];
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ lines }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          setIsDarkMode(newTheme === 'dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const colors = {
    light: {
      background: '#fafafa',
      border: '#e6e6e6',
      text: '#2c3e50',
      lineNumber: '#999',
      errorText: '#dc3545',
      errorBg: '#fff5f5'
    },
    dark: {
      background: '#1a1a1a',
      border: '#333',
      text: '#e0e0e0',
      lineNumber: '#a0a0a0',
      errorText: '#ff7875',
      errorBg: 'rgba(255, 120, 117, 0.25)'
    }
  };

  const currentTheme = isDarkMode ? colors.dark : colors.light;
  return (
    <div>
    <br />
    <strong>Lines:</strong>
    <div style={{ 
      background: currentTheme.background, 
      padding: '16px', 
      borderRadius: '8px', 
      border: `1px solid ${currentTheme.border}` 
    }}>
      
      {lines.map((line, index) => (
        <div
          key={line.Number || index}
          style={{
            display: 'flex',
            alignItems: 'center',
            lineHeight: '1.6',
            color: line.IsCause ? currentTheme.errorText : currentTheme.text,
          }}
        >
          <Text style={{ 
            width: '40px', 
            textAlign: 'right', 
            marginRight: '16px', 
            color: currentTheme.lineNumber 
          }}>
            {line.Number}
          </Text>
          <Paragraph
            style={{
              margin: 0,
              background: line.FirstCause || line.LastCause ? currentTheme.errorBg : 'transparent',
              padding: line.FirstCause || line.LastCause ? '2px 4px' : '0',
              borderRadius: '4px',
              flexGrow: 1,
              color: 'inherit',
              borderLeft: line.FirstCause || line.LastCause ? `3px solid ${currentTheme.errorText}` : 'none',
              boxShadow: line.FirstCause || line.LastCause ? `0 0 0 1px ${currentTheme.errorText}20` : 'none',
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