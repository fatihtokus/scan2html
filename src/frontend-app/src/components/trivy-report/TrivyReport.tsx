import { useEffect, useState } from "react";
import { Divider, Input, Radio } from "antd";
import Icon from "@ant-design/icons";

import { NormalizedResultForDataTable } from "../../types";
import Misconfigurations from "./components/Misconfigurations";
import Vulnerabilities from "./components/Vulnerabilities";
import MisconfigurationSummary from "./components/MisconfigurationSummary";

interface TrivyReportProps {
  vulnerabilities: NormalizedResultForDataTable[];
  misconfigurations: NormalizedResultForDataTable[];
  misconfigurationSummary: NormalizedResultForDataTable[];
  vulnerabilitiesOrMisconfigurations: string;
  setVulnerabilitiesOrMisconfigurations: (value: string) => void;
}

const TrivyReport: React.FC<TrivyReportProps> = ({
  vulnerabilities,
  misconfigurations,
  misconfigurationSummary,
  vulnerabilitiesOrMisconfigurations,
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
    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.pushState({ search: value }, "", newUrl);
  };

  const resultTable = () => {
    let data;
    switch (vulnerabilitiesOrMisconfigurations) {
      case "misconfigurationSummary":
        data = misconfigurationSummary;
        break;
      case "misconfigurations":
        data = misconfigurations;
        break;
      default:
        data = vulnerabilities;
        break;
    }

    const filteredData = data.filter(row => {
      return Object.values(row).some(
        value =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (vulnerabilitiesOrMisconfigurations === "vulnerabilities") {
      return <Vulnerabilities result={filteredData} />;
    }

    if (vulnerabilitiesOrMisconfigurations === "misconfigurationSummary") {
      return <MisconfigurationSummary result={filteredData} />;
    }

    if (vulnerabilitiesOrMisconfigurations === "misconfigurations") {
      return <Misconfigurations result={filteredData} />;
    }
  };

  return (
    <>
      <Icon type="search" />
      <div
        style={{
          paddingBottom: "1em",
          marginTop: "-0.625em",
        }}
      >
        <Search
          placeholder="input search text"
          allowClear
          enterButton="Search"
          size="large"
          value={searchTerm}
          onChange={e => onSearch(e.target.value)}
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
        <Radio value="misconfigurationSummary">
          Misconfiguration Summary ({misconfigurationSummary.length})
        </Radio>
        <Radio value="misconfigurations">
          Misconfigurations ({misconfigurations.length})
        </Radio>
      </Radio.Group>
      <Divider />
      {resultTable()}
    </>
  );
};

export default TrivyReport;
