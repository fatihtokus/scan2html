import { Tag } from "antd";

export function isNegligible(severity: string)
: boolean {
  switch (severity.toLowerCase()) {
    case "critical":
    case "high":
    case "medium":
    case "low":
      return false
    default:
      return true;
  }
};

export function isASeverity(severity: string)
: boolean {
  switch (severity.toLowerCase()) {
    case "critical":
    case "high":
    case "medium":
    case "low":
    case "unknown":
    case "negligible":
      return true
    default:
      return false;
  }
};

const SeverityTag = ({ severity }: { severity: string }) => {
  let color;

  switch (severity.toLowerCase()) {
    case "critical":
      color = "#FF6666";
      break;
    case "high":
      color = "#FF9966";
      break;
    case "medium":
      color = "#FFCC66";
      break;
    case "low":
      color = "#FFFF99";
      break;
    default:
      color = "#CCFFFF";
      break;
  }

  return (
    <Tag color={color} key={severity} style={{
      backgroundColor: color,
      color: '#000', // Set text color to black
    }}>
      {severity}
      
    </Tag>
  );
};

export default SeverityTag;
