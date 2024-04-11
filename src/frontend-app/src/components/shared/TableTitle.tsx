import { Typography } from "antd";
import { GithubOutlined } from "@ant-design/icons";

const { Title, Link } = Typography;

const TableTitle = () => {
  const href = "https://github.com/fatihtokus/scan2html";

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Title level={3}>Trivy Report</Title>
      <div
        style={{ display: "flex", alignItems: "center", paddingTop: "1.25rem" }}
      >
        <Link href={href} target="_blank">
          via scan2html
        </Link>
        <Link href={href} target="_blank">
          <GithubOutlined style={{ fontSize: "24px", marginLeft: "8px" }} />
        </Link>
      </div>
    </div>
  );
};

export default TableTitle;
