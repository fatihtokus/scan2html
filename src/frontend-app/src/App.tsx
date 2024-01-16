import { useEffect, useState } from "react";
import { Spin } from "antd";

import TrivyReport from "./components/trivy-report/TrivyReport";
import { mapVulnerabilityResults } from "./utils/ındex";
import { FormattedResult } from "./types";
import data from './data/default/data.json'

function App() {
  const [result, setResult] = useState<FormattedResult[]>([]);

  useEffect(() => {
    setResult(mapVulnerabilityResults(data.Results));
  }, []);

  return (
    <>
      {result.length > 0 ? (
        <TrivyReport result={result} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </>
  );
}

export default App;
