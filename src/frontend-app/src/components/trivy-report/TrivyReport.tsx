import { useEffect, useState } from "react";
import { Divider, Input, Radio } from "antd";
import Icon from "@ant-design/icons";

import { NormalizedResultForDataTable } from "../../types";
import Vulnerabilities from "./components/Vulnerabilities";
import MisconfigurationSummary from "./components/MisconfigurationSummary";
import Misconfigurations from "./components/Misconfigurations";
import K8sClusterSummary from "./K8sClusterSummary";
import SupplyChainSBOM from "./SupplyChainSBOM";

interface TrivyReportProps {
  vulnerabilities: NormalizedResultForDataTable[];
  misconfigurations: NormalizedResultForDataTable[];
  misconfigurationSummary: NormalizedResultForDataTable[];
  k8sClusterSummaryInfraAssessment: NormalizedResultForDataTable[];
  k8sClusterSummaryRBACAssessment: NormalizedResultForDataTable[];
  supplyChainSBOM: NormalizedResultForDataTable[];
  vulnerabilitiesOrMisconfigurations: string;
  setVulnerabilitiesOrMisconfigurations: (value: string) => void;
}

const TrivyReport: React.FC<TrivyReportProps> = ({
  vulnerabilities,
  misconfigurations,
  misconfigurationSummary,
  k8sClusterSummaryInfraAssessment,
  k8sClusterSummaryRBACAssessment,
  vulnerabilitiesOrMisconfigurations,
  supplyChainSBOM,
  setVulnerabilitiesOrMisconfigurations,
}) => {
  console.log("TrivyReport-vulnerabilities:", vulnerabilities);
  console.log("TrivyReport-misconfigurations:", misconfigurations);
  console.log("TrivyReport-misconfigurationSummary:", misconfigurationSummary);

  const [searchTerm, setSearchTerm] = useState("");

  const { Search } = Input;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  const onSearch = (value: string) => {
    setSearchTerm(value);
    addToURLSearchParams(value);
  };

  const addToURLSearchParams = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.pushState({ search: value }, "", newUrl);
  };

  const filteredResult = (data: NormalizedResultForDataTable[]) => {
    const filteredData = data.filter((row) => {
      return Object.values(row).some((value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    return filteredData;
  };

  console.log("TrivyReport-k8sClusterSummaryInfraAssessment:", k8sClusterSummaryInfraAssessment);
  console.log("TrivyReport-k8sClusterSummaryRBACAssessment:", k8sClusterSummaryRBACAssessment);
  console.log("TrivyReport-supplyChainSBOM:", supplyChainSBOM);

  return (
    <>
      <Icon type="search" />
      <div
        style={{
          paddingBottom: "1em",
          marginTop: "-0.625em",
        }}
      >
        <Search placeholder="input search text" allowClear enterButton="Search" size="large" value={searchTerm} onChange={(e) => onSearch(e.target.value)} />
      </div>
      <Radio.Group
        onChange={({ target: { value } }) => {
          setVulnerabilitiesOrMisconfigurations(value);
        }}
        value={vulnerabilitiesOrMisconfigurations}
      >
        <Radio value="vulnerabilities">Vulnerabilities ({vulnerabilities.length})</Radio>
        <Radio value="misconfigurationSummary">Misconfiguration Summary ({misconfigurationSummary.length})</Radio>
        <Radio value="misconfigurations">Misconfigurations ({misconfigurations.length})</Radio>
        <Radio value="k8sClusterSummary">
          K8s Cluster Summary ({k8sClusterSummaryInfraAssessment.length}/{k8sClusterSummaryRBACAssessment.length})
        </Radio>
        <Radio value="supplyChainSBOM">Supply Chain SBOM(spdx) ({supplyChainSBOM.length})</Radio>
      </Radio.Group>
      <Divider />

      {vulnerabilitiesOrMisconfigurations === "vulnerabilities" && <Vulnerabilities result={filteredResult(vulnerabilities)} />}
      {vulnerabilitiesOrMisconfigurations === "misconfigurations" && <Misconfigurations result={filteredResult(misconfigurations)} />}
      {vulnerabilitiesOrMisconfigurations === "misconfigurationSummary" && <MisconfigurationSummary result={filteredResult(misconfigurationSummary)} />}
      {vulnerabilitiesOrMisconfigurations === "k8sClusterSummary" && (
        <K8sClusterSummary k8sClusterSummaryInfraAssessment={filteredResult(k8sClusterSummaryInfraAssessment)} k8sClusterSummaryRBACAssessment={filteredResult(k8sClusterSummaryRBACAssessment)} />
      )}
      {vulnerabilitiesOrMisconfigurations === "supplyChainSBOM" && <SupplyChainSBOM result={filteredResult(supplyChainSBOM)} />}
    </>
  );
};

export default TrivyReport;
