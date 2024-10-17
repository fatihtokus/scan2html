import { Typography } from "antd";
import { GithubOutlined } from "@ant-design/icons";

const { Title, Link } = Typography;

const TableTitle = ({ title = "Trivy Report" }) => {
  const href = "https://github.com/fatihtokus/scan2html";

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Title level={3}>{title}</Title>
      <div style={{ display: "flex", alignItems: "center", paddingTop: "1.25rem" }}>
        <Link href={href} target="_blank">
          via scan2html(v0.3.6)
        </Link>
        <Link href={href} target="_blank">
          <GithubOutlined style={{ fontSize: "1.5em", marginLeft: "0.5em" }} />
        </Link>
      </div>
    </div>
  );
};

export default TableTitle;
