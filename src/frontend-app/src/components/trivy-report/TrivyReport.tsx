import { Divider, Radio } from "antd";
import { NormalizedResultForDataTable } from "../../types";
import Misconfigurations from "./Misconfigurations";
import Vulnerabilities from "./Vulnerabilities";
import MisconfigurationSummary from "./MisconfigurationSummary";
import K8sClusterSummary from "./K8sClusterSummary";

interface TrivyReportProps {
  vulnerabilities: NormalizedResultForDataTable[];
  misconfigurations: NormalizedResultForDataTable[];
  misconfigurationSummary: NormalizedResultForDataTable[];
  k8sClusterSummaryInfraAssessment: NormalizedResultForDataTable[];
  k8sClusterSummaryRBACAssessment: NormalizedResultForDataTable[];
  vulnerabilitiesOrMisconfigurations: string;
  setVulnerabilitiesOrMisconfigurations: (value: string) => void;
}

const TrivyReport: React.FC<TrivyReportProps> = ({ vulnerabilities, misconfigurations, misconfigurationSummary, k8sClusterSummaryInfraAssessment, k8sClusterSummaryRBACAssessment, vulnerabilitiesOrMisconfigurations, setVulnerabilitiesOrMisconfigurations }) => {
  console.log("TrivyReport-vulnerabilities:", vulnerabilities);
  console.log("TrivyReport-misconfigurations:", misconfigurations);
  console.log("TrivyReport-misconfigurationSummary:", misconfigurationSummary);
  console.log("TrivyReport-k8sClusterSummaryInfraAssessment:", k8sClusterSummaryInfraAssessment);
  console.log("TrivyReport-k8sClusterSummaryRBACAssessment:", k8sClusterSummaryRBACAssessment);
  return (
    <>
      <Radio.Group onChange={({ target: { value } }) => {
        setVulnerabilitiesOrMisconfigurations(value);
      }}
      value={vulnerabilitiesOrMisconfigurations}
      >
        <Radio value="vulnerabilities">Vulnerabilities ({vulnerabilities.length})</Radio>
        <Radio value="misconfigurationSummary">Misconfiguration Summary ({misconfigurationSummary.length})</Radio>
        <Radio value="misconfigurations">Misconfigurations ({misconfigurations.length})</Radio>
        <Radio value="k8sClusterSummary">K8s Cluster Summary ({k8sClusterSummaryInfraAssessment.length}/{k8sClusterSummaryRBACAssessment.length})</Radio>
      </Radio.Group>

      <Divider />

      {vulnerabilitiesOrMisconfigurations === "vulnerabilities" && <Vulnerabilities result={vulnerabilities}/>}
      {vulnerabilitiesOrMisconfigurations === "misconfigurations" && <Misconfigurations result={misconfigurations}/>}
      {vulnerabilitiesOrMisconfigurations === "misconfigurationSummary" && <MisconfigurationSummary result={misconfigurationSummary}/>}
      {vulnerabilitiesOrMisconfigurations === "k8sClusterSummary" && <K8sClusterSummary k8sClusterSummaryInfraAssessment={k8sClusterSummaryInfraAssessment} k8sClusterSummaryRBACAssessment={k8sClusterSummaryRBACAssessment}/>}
    </>
  );
};

export default TrivyReport;
