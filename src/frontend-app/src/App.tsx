import { useEffect, useState } from "react";
import { Button, notification, Menu, Switch, MenuTheme, ConfigProvider, theme as antdTheme } from "antd";
import Papa, { ParseResult } from "papaparse";
import TrivyReport from "./components/trivy-report/TrivyReport";
import TableTitle from "./components/shared/TableTitle";
import defaultData from "./data/results.json";
import knownExploitedVulnerabilitiesData from "./data/cisa-known-exploited-vulnerabilities.json";
import defaultEPSSData from "./data/epss.cvs?raw";
import defaultResultMetaData from "./data/result-metadata.json";
import { NormalizedResultForDataTable, UploadInfo } from "./types";
import { EPSSPerVulnerability } from "./types/external/epss";
import { CisaExploit, isCisaExploitArray } from "./types/external/cisaExploit";
import { getSecrets, getLicenses, getMisconfigurationSummary, getK8sClusterSummaryForInfraAssessment, getK8sClusterSummaryForRBACAssessment, getMisconfigurations, getVulnerabilities, getSupplyChainSBOM } from "./utils/index";
import { FileProtectOutlined, UploadOutlined, LockOutlined, ExclamationCircleOutlined, SettingOutlined, ClusterOutlined, ProfileOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BugOutlined } from "@ant-design/icons";
import "./App.css";
import type { MenuProps } from "antd";


const knownExploitedVulnerabilities: CisaExploit[] = isCisaExploitArray(knownExploitedVulnerabilitiesData) ? knownExploitedVulnerabilitiesData : [];

type MenuItem = {
  key: string;
  icon: any;
  label: string;
};

const getThemeConfig = (isDark: boolean) => ({
  algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: {
    borderRadius: 8,
    colorBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    boxShadow: "none",
    boxShadowSecondary: "none",
    controlOutline: "none",
  },
  components: {
    Table: {
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
      headerBg: "transparent",
      bodySortBg: "transparent",
      rowHoverBg: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
    },
    Card: {
      boxShadow: "none",
      boxShadowTertiary: "none",
    },
    Button: {
      boxShadow: "none",
      primaryShadow: "none",
    },
    Input: {
      boxShadow: "none",
      activeShadow: "none",
    },
  },
});

function App() {
  const [vulnerabilities, setVulnerabilities] = useState<NormalizedResultForDataTable[]>([]);
  const [secrets, setSecrets] = useState<NormalizedResultForDataTable[]>([]);
  const [licenses, setLicenses] = useState<NormalizedResultForDataTable[]>([]);
  const [misconfigurations, setMisconfigurations] = useState<NormalizedResultForDataTable[]>([]);
  const [misconfigurationSummary, setMisconfigurationSummary] = useState<NormalizedResultForDataTable[]>([]);
  const [k8sClusterSummaryInfraAssessment, setK8sClusterSummaryInfraAssessment] = useState<NormalizedResultForDataTable[]>([]);
  const [k8sClusterSummaryRBACAssessment, setK8sClusterSummaryRBACAssessment] = useState<NormalizedResultForDataTable[]>([]);
  const [supplyChainSBOM, setSupplyChainSBOM] = useState<NormalizedResultForDataTable[]>([]);
  const [selectedMenu, setSelectedMenu] = useState("vulnerabilities");
  const [loadedReportFiles, setLoadedReportFiles] = useState<string[]>([]);
  const [manuallyLoadedReportFile, setManuallyLoadedReportFile] = useState("");
  const [loadedData, setLoadedData] = useState([{}]);
  const [epssData, setEpssData] = useState<EPSSPerVulnerability[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<MenuTheme>('light');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reportTitle, setReportTitle] = useState('Trivy Report');
  const [filledResultsPerCategory, setFilledResultsPerCategory] = useState<string[]>([]);
  const queryParameters = new URLSearchParams(window.location.search)

  const onThemeChanged = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  // Update document attribute when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const onToggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onMenuSelected: MenuProps['onClick'] = (e) => {
    setSelectedMenu(e.key);
  };

  const fetchJsonData = (jsonUrl: string) => {
    return fetch(jsonUrl)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching JSON data:', error);
            return { error: 'Failed to load JSON data' };
        });
  };


  const loadEPSSData = () => {
    // Step 1: Remove the first line that starts with `#`
    const cleanedEPSSData = defaultEPSSData.split('\n').slice(1).join('\n');
    console.log(`cleanedEPSSData:`, cleanedEPSSData);
    Papa.parse<EPSSPerVulnerability>(cleanedEPSSData, {
      header: true, // Treat the first line as headers
      dynamicTyping: true, // Automatically convert strings to numbers when appropriate
      complete: (results: ParseResult<EPSSPerVulnerability>) => {
        console.log(`Parsed Results:`, results.data);  // Log parsed results here
        setEpssData(results.data as EPSSPerVulnerability[]);         
      },
      error: (error: Error) => {
        console.error(`Error parsing CSV:`, error);
      }
    });
  };

  useEffect(() => {
    loadEPSSData();
  }, []);
  
  useEffect(() => {
    if (epssData.length > 0) {
      console.log("Updated EPSS Data:", epssData);

    } else {
      console.log("EPSS Data is empty.");
    }

    const reportUrls = queryParameters.getAll("reportUrls");
    console.log(`reportUrls`, reportUrls);
    if(reportUrls.length > 0){
      setLoadedReportFiles(reportUrls);
    } else {
      setLoadedData(defaultData);
    }
  }, [epssData]);

  useEffect(() => {
    console.log(`loadedReportFiles ${loadedReportFiles}`);
    if(loadedReportFiles.length > 0){
      Promise.all(loadedReportFiles.map(fetchJsonData)).then(results => {
        const newData = results.map(data => ({ ...data }));
        setLoadedData(newData);
    });
    }
  }, [loadedReportFiles]);

  useEffect(() => {
    console.log(`loadedData.length ${loadedData.length}`);
    setVulnerabilities(getVulnerabilities(loadedData, epssData, knownExploitedVulnerabilities));
    setSecrets(getSecrets(loadedData));
    setLicenses(getLicenses(loadedData));
    setMisconfigurations(getMisconfigurations(loadedData));
    setMisconfigurationSummary(getMisconfigurationSummary(loadedData));
    setK8sClusterSummaryInfraAssessment(getK8sClusterSummaryForInfraAssessment(loadedData));
    setK8sClusterSummaryRBACAssessment(getK8sClusterSummaryForRBACAssessment(loadedData));
    setSupplyChainSBOM(getSupplyChainSBOM(loadedData));
  }, [loadedData]);

  useEffect(() => {
    setMenuItems([
      { key: "vulnerabilities", icon: <BugOutlined />, label: `Vulnerabilities (${vulnerabilities.length})` },
      { key: "secrets", icon: <LockOutlined />, label: `Secrets (${secrets.length})` },
      { key: "licenses", icon: <FileProtectOutlined />, label: `Licenses (${licenses.length})` },
      { key: "misconfigurationSummary", icon: <ExclamationCircleOutlined />, label: `Misconfiguration Summary (${misconfigurationSummary.length})` },
      { key: "misconfigurations", icon: <SettingOutlined />, label: `Misconfigurations (${misconfigurations.length})` },
      { key: "k8sClusterSummary", icon: <ClusterOutlined />, label: `K8s Cluster Summary (${k8sClusterSummaryInfraAssessment.length} / ${k8sClusterSummaryRBACAssessment.length})` },
      { key: "supplyChainSBOM", icon: <ProfileOutlined />, label: `Supply Chain SBOM(spdx) (${supplyChainSBOM.length})`  },
      { key: "loadAReport", icon: <UploadOutlined />, label: "Load a report" }
    ]);
  }, [vulnerabilities, misconfigurationSummary, secrets, misconfigurations, k8sClusterSummaryInfraAssessment, k8sClusterSummaryRBACAssessment, supplyChainSBOM]);

  useEffect(() => {
    let tempResults: string[] = [];
    if (vulnerabilities.length > 0){
      tempResults.push("vulnerabilities");
    }

    if (secrets.length > 0){
      tempResults.push("secrets");
    }

    if (licenses.length > 0){
      tempResults.push("licenses");
    }

    if (misconfigurations.length > 0){
      tempResults.push("misconfigurations");
    }

    if (misconfigurationSummary.length > 0){
      tempResults.push("misconfigurationSummary");
    }

    if (k8sClusterSummaryInfraAssessment.length > 0  || k8sClusterSummaryRBACAssessment.length > 0){
      tempResults.push("k8sClusterSummary");
    }

    if (supplyChainSBOM.length > 0){
      tempResults.push("supplyChainSBOM");
    }

    setFilledResultsPerCategory(tempResults);

  }, [menuItems]);

  useEffect(() => {
    if(filledResultsPerCategory.length > 0) {
      setSelectedMenu(filledResultsPerCategory[0]);
    }
    if(filledResultsPerCategory.length === 1) { // Collapse the menu
      setCollapsed(true);
    }

  }, [filledResultsPerCategory]);

  useEffect(() => {
    if (menuItems.length > 0){
      const selectedMenuLabel = menuItems.filter((item) => item?.key == selectedMenu);
      setReportTitle(`${defaultResultMetaData[0].REPORT_TITLE} - ${selectedMenuLabel[0]?.label}`);
    }
    
  }, [selectedMenu, menuItems]);

  const onReportUpload = (info: UploadInfo) => {
    console.log(info);
    const file = info.file as Blob;

    if (!(file instanceof Blob)) {
      console.error("Uploaded file is not a Blob.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const content = event.target.result as string;
        try {
          const jsonObject = JSON.parse(content);
          console.log("Parsed JSON object:", jsonObject);
          const newData = { ...jsonObject };
          setLoadedData([newData]);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }

        console.log(info.file);
        setManuallyLoadedReportFile(info.file.name);
        notification.success({
          message: "File Uploaded",
          description: `${manuallyLoadedReportFile} uploaded successfully.`,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <ConfigProvider
      theme={getThemeConfig(theme === "dark")}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
        }}
      >
        <div id="menu">
          <Switch checked={theme === "dark"} onChange={onThemeChanged} checkedChildren="Dark" unCheckedChildren="Light" />
          <Button type="primary" onClick={onToggleCollapsed} style={{ margin: 16 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <Menu defaultSelectedKeys={["vulnerabilities"]} selectedKeys={[selectedMenu]} mode="inline" theme={theme} inlineCollapsed={collapsed} items={menuItems} onClick={onMenuSelected} />
        </div>
        <div
          id="content"
          style={{
            flexGrow: 1,
            marginLeft: 20,
          }}
        >
          <TableTitle title={reportTitle} />
          <TrivyReport
            vulnerabilities={vulnerabilities}
            secrets={secrets}
            licenses={licenses}
            misconfigurations={misconfigurations}
            misconfigurationSummary={misconfigurationSummary}
            k8sClusterSummaryInfraAssessment={k8sClusterSummaryInfraAssessment}
            k8sClusterSummaryRBACAssessment={k8sClusterSummaryRBACAssessment}
            selectedMenu={selectedMenu}
            supplyChainSBOM={supplyChainSBOM}
            onReportUpload={onReportUpload}
            loadedReportFiles={loadedReportFiles}
            manuallyLoadedReportFile={manuallyLoadedReportFile}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
