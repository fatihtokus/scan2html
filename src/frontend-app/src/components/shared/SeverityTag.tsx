import { Tag } from "antd";

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
