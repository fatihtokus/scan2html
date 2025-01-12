import { NormalizedResultForDataTable, UploadInfo } from "../../types";
import Misconfigurations from "./Misconfigurations";
import Vulnerabilities from "./Vulnerabilities";
import MisconfigurationSummary from "./MisconfigurationSummary";
import K8sClusterSummary from "./K8sClusterSummary";
import SupplyChainSBOM from "./SupplyChainSBOM";
import UploadAReport from "./UploadAReport";
import Secrets from "./Secrets";
import Licenses from "./Licenses";

interface TrivyReportProps {
  vulnerabilities: NormalizedResultForDataTable[];
  secrets: NormalizedResultForDataTable[];
  licenses: NormalizedResultForDataTable[];
  misconfigurations: NormalizedResultForDataTable[];
  misconfigurationSummary: NormalizedResultForDataTable[];
  k8sClusterSummaryInfraAssessment: NormalizedResultForDataTable[];
  k8sClusterSummaryRBACAssessment: NormalizedResultForDataTable[];
  supplyChainSBOM: NormalizedResultForDataTable[];
  selectedMenu: string;
  onReportUpload: (info: UploadInfo) => void;
  loadedReportFiles: string[];
  manuallyLoadedReportFile: string;
}

const TrivyReport: React.FC<TrivyReportProps> = ({
  vulnerabilities,
  secrets,
  licenses,
  misconfigurations,
  misconfigurationSummary,
  k8sClusterSummaryInfraAssessment,
  k8sClusterSummaryRBACAssessment,
  selectedMenu,
  supplyChainSBOM,
  onReportUpload,
  loadedReportFiles,
  manuallyLoadedReportFile
}) => {
  console.log("TrivyReport-vulnerabilities:", vulnerabilities);
  console.log("TrivyReport-secrets:", secrets);
  console.log("TrivyReport-licenses:", licenses);
  console.log("TrivyReport-misconfigurations:", misconfigurations);
  console.log("TrivyReport-misconfigurationSummary:", misconfigurationSummary);
  console.log("TrivyReport-k8sClusterSummaryInfraAssessment:", k8sClusterSummaryInfraAssessment);
  console.log("TrivyReport-k8sClusterSummaryRBACAssessment:", k8sClusterSummaryRBACAssessment);
  console.log("TrivyReport-supplyChainSBOM:", supplyChainSBOM);

  return (
    <>
      {selectedMenu === "vulnerabilities" && <Vulnerabilities result={vulnerabilities} />}
      {selectedMenu === "secrets" && <Secrets result={secrets} />}
      {selectedMenu === "licenses" && <Licenses result={licenses} />}
      {selectedMenu === "misconfigurations" && <Misconfigurations result={misconfigurations} />}
      {selectedMenu === "misconfigurationSummary" && <MisconfigurationSummary result={misconfigurationSummary} />}
      {selectedMenu === "k8sClusterSummary" && (
        <K8sClusterSummary k8sClusterSummaryInfraAssessment={k8sClusterSummaryInfraAssessment} k8sClusterSummaryRBACAssessment={k8sClusterSummaryRBACAssessment} />
      )}
      {selectedMenu === "supplyChainSBOM" && <SupplyChainSBOM result={supplyChainSBOM} />}
      {selectedMenu === "loadAReport" && <UploadAReport onReportUpload={onReportUpload} loadedReportFiles={loadedReportFiles} manuallyLoadedReportFile={manuallyLoadedReportFile}/>}
    </>
  );
};

export default TrivyReport;
