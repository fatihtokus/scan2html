import React, { useEffect, useState } from 'react';
import { Button, Space, Checkbox } from 'antd';
import './SeverityToolbar.css';
import { NormalizedResultForDataTable } from '../../types';
import { SeverityCount } from '../../types/ui/index.ts';

interface SeverityToolbarProps {
  result: NormalizedResultForDataTable[];
  onSeverityClick: (severity: string) => void;
  onDeduplicationClick: () => void;
  deduplicationOn: boolean;
}

const SeverityToolbar: React.FC<SeverityToolbarProps> = ({ result, onSeverityClick, onDeduplicationClick, deduplicationOn }) => {
  const [resultsPerSeverity, setResultsPerSeverity] = useState<SeverityCount[]>([]);

  useEffect(() => {
    const tmpResult = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      negligible: 0
    };

    result.forEach(item => {
      switch (item.Severity?.toLowerCase()) {
        case 'critical':
          tmpResult.critical += 1;
          break;
        case 'high':
          tmpResult.high += 1;
          break;
        case 'medium':
          tmpResult.medium += 1;
          break;
        case 'low':
          tmpResult.low += 1;
          break;
        default:
          tmpResult.negligible += 1;
          break;
      }
    });

    setResultsPerSeverity([
      { severity: 'Critical', count: tmpResult.critical, color: '#FF6666' },
      { severity: 'High', count: tmpResult.high, color: '#FF9966' },
      { severity: 'Medium', count: tmpResult.medium, color: '#FFCC66' },
      { severity: 'Low', count: tmpResult.low, color: '#FFFF99' },
      { severity: 'Negligible', count: tmpResult.negligible, color: '#CCFFFF' },
      { severity: 'All', count: result.length, color: '#DDEE' },
    ]);
  }, [result]);

  return (
    <div className="severity-toolbar">
    <Space>
     Filter by:
      {resultsPerSeverity.map(({ severity, count, color }) => (
        <Button
          key={severity}
          style={{
            backgroundColor: color,
            color: '#000', // Set text color to black
          }}
          onClick={() => onSeverityClick(severity.toLowerCase())}
        >
          {count} {severity}
        </Button>
      ))}
      </Space>
      <Checkbox onClick={() => onDeduplicationClick()} checked={deduplicationOn}>
        Enable Deduplication
      </Checkbox>
    </div>
  );
};

export default SeverityToolbar;