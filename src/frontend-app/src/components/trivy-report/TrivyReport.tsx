import { Divider, Input, Radio } from "antd";
import Title from "antd/es/typography/Title";
import { NormalizedResultForDataTable } from "../../types";
import Misconfigurations from "./components/Misconfigurations";
import Vulnerabilities from "./components/Vulnerabilities";

interface TrivyReportProps {
  vulnerabilities: NormalizedResultForDataTable[];
  misconfigurations: NormalizedResultForDataTable[];
  vulnerabilitiesOrMisconfigurations: string;
  setVulnerabilitiesOrMisconfigurations: (value: string) => void;
}

const TrivyReport: React.FC<TrivyReportProps> = ({
  vulnerabilities,
  misconfigurations,
  vulnerabilitiesOrMisconfigurations,
  setVulnerabilitiesOrMisconfigurations,
}) => {
  console.log("TrivyReport-vulnerabilities:", vulnerabilities);
  console.log("TrivyReport-misconfigurations:", misconfigurations);

  const { Search } = Input;

  const onSearch = (value: string) => console.log(value);

  return (
    <>
      <Title level={3}>Trivy Report</Title>
      <div style={{ paddingBottom: "10px" }}>
        <Search
          placeholder="input search text"
          allowClear
          enterButton="Search"
          size="large"
          onSearch={onSearch}
        />
      </div>

      <Radio.Group
        onChange={({ target: { value } }) => {
          setVulnerabilitiesOrMisconfigurations(value);
        }}
        value={vulnerabilitiesOrMisconfigurations}
      >
        <Radio value="vulnerabilities">
          Vulnerabilities ({vulnerabilities.length})
        </Radio>
        <Radio value="misconfigurations">
          Misconfigurations ({misconfigurations.length})
        </Radio>
      </Radio.Group>

      <Divider />

      {vulnerabilitiesOrMisconfigurations === "vulnerabilities" && (
        <Vulnerabilities result={vulnerabilities} />
      )}
      {vulnerabilitiesOrMisconfigurations === "misconfigurations" && (
        <Misconfigurations result={misconfigurations} />
      )}
    </>
  );
};

export default TrivyReport;
