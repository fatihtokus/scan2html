import { Divider, Radio } from "antd";
import { NormalizedResultForDataTable } from "../../types";
import Misconfigurations from "./Misconfigurations";
import Vulnerabilities from "./Vulnerabilities";

interface TrivyReportProps {
  vulnerabilities: NormalizedResultForDataTable[];
  misconfigurations: NormalizedResultForDataTable[];
  vulnerabilitiesOrMisconfigurations: string;
  setVulnerabilitiesOrMisconfigurations: (value: string) => void;
}

const TrivyReport: React.FC<TrivyReportProps> = ({ vulnerabilities, misconfigurations, vulnerabilitiesOrMisconfigurations, setVulnerabilitiesOrMisconfigurations }) => {
  console.log("TrivyReport-vulnerabilities:", vulnerabilities);
  console.log("TrivyReport-misconfigurations:", misconfigurations);
  return (
    <>
      <Radio.Group
      onChange={({ target: { value } }) => {
        setVulnerabilitiesOrMisconfigurations(value);
      }}
      value={vulnerabilitiesOrMisconfigurations}
      >
        <Radio value="vulnerabilities">Vulnerabilities ({vulnerabilities.length})</Radio>
        <Radio value="misconfigurations">Misconfigurations ({misconfigurations.length})</Radio>
      </Radio.Group>

      <Divider />

      {vulnerabilitiesOrMisconfigurations === "vulnerabilities" && <Vulnerabilities result={vulnerabilities}/>}
      {vulnerabilitiesOrMisconfigurations === "misconfigurations" && <Misconfigurations result={misconfigurations}/>}
    </>
  );
};

export default TrivyReport;
