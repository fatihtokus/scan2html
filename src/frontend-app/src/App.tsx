import { useEffect, useState } from "react";
import TrivyReport from "./components/trivy-report/TrivyReport";
import { Spin } from "antd";
import { mapVulnerabilityResults } from "./utils/ındex";

function App() {
  const [result, setResult] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch("../../../test/data/default/result.json");
        const response = await fetch("/api/defaultResults.json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log("Fetched Data:", data);
        // setResult(mapVulnerabilityResults(data.Results));
        setResult(data.Results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {result.length > 0 ? (
        <TrivyReport />
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
