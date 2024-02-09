import { useEffect, useState } from "react";

import TrivyReport from "./components/trivy-report/TrivyReport";
//import defaultData1 from "./data/default/data.json";
import defaultData from "./data/default/data.json";
import k8sData from "./data/k8s/data.json";
import { NormalizedResultForDataTable } from "./types";
import { getMisconfigurations, getVulnerabilities } from "./utils/index";

function App() {
  const [vulnerabilities, setVulnerabilities] = useState<NormalizedResultForDataTable[]>([]);
  const [misconfigurations, setMisconfigurations] = useState<NormalizedResultForDataTable[]>([]);
  const [vulnerabilitiesOrMisconfigurations, setVulnerabilitiesOrMisconfigurations] = useState("vulnerabilities");
  const queryParameters = new URLSearchParams(window.location.search)


  useEffect(() => {
    const dataSource = queryParameters.get("dataSource")
    const data = dataSource ? k8sData : defaultData; 
    setVulnerabilities(getVulnerabilities(data));
    setMisconfigurations(getMisconfigurations(data));
  }, []);

  return (
    <>
      <TrivyReport 
          vulnerabilities={vulnerabilities}
          misconfigurations={misconfigurations}
          vulnerabilitiesOrMisconfigurations={vulnerabilitiesOrMisconfigurations} 
          setVulnerabilitiesOrMisconfigurations={setVulnerabilitiesOrMisconfigurations}
        />
    </>
  );
}

export default App;
