import React from 'react';
import { useEffect, useState } from "react";
import { Button, Space } from 'antd';
import './SeverityToolbar.css';
import { NormalizedResultForDataTable } from '../../types';
import { SeverityCount } from '../../types/ui/index.ts';

interface SeverityToolbarProps {
  result: NormalizedResultForDataTable[];
}

const SeverityToolbar: React.FC<SeverityToolbarProps> = ({ result }) => {
  const [resultsPerSeverity, setResultsPerSeverity] = useState<SeverityCount[]>([]);
  
  useEffect(() => {
    let tmpResult = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      negligible: 0
   };

    result.forEach(item => {
      switch (item.Severity?.toLowerCase()) {
        case "critical":
          tmpResult["critical"] = tmpResult["critical"] + 1;
          break;
        case "high":
          tmpResult["high"] = tmpResult["high"] + 1;
          break;
        case "medium":
          tmpResult["medium"] = tmpResult["medium"] + 1;
          break;
        case "low":
          tmpResult["low"] = tmpResult["low"] + 1;
          break;
        default:
          tmpResult["negligible"] = tmpResult["negligible"] + 1;
          break;
      }
    })

    setResultsPerSeverity([
      { severity: 'Critical', count: `${tmpResult["critical"]}`, color: '#FF6666' },
      { severity: 'High', count: `${tmpResult["high"]}`, color: '#FF9966' },
      { severity: 'Medium', count: `${tmpResult["medium"]}`, color: '#FFCC66' },
      { severity: 'Low', count: `${tmpResult["low"]}`, color: '#FFFF99' },
      { severity: 'Negligible', count: `${tmpResult["negligible"]}`, color: '#CCFFFF' },
    ]);
  }, [result]);

  return (
    <Space>
      {resultsPerSeverity.map(({ severity, count, color }) => (
        <Button
          key={severity}
          style={{
            backgroundColor: color,
            color: '#000', // Set text color to black
          }}
        >
          {count} {severity}
        </Button>
      ))}
    </Space>
  );
};

export default SeverityToolbar;
