import { useEffect, useState } from "react";
import { Button, notification, Menu, Switch, MenuTheme } from "antd";
import TrivyReport from "./components/trivy-report/TrivyReport";
import TableTitle from "./components/shared/TableTitle";
import defaultData from "./data/data.json";
import { NormalizedResultForDataTable, UploadInfo } from "./types";
import { getSecrets, getMisconfigurationSummary, getK8sClusterSummaryForInfraAssessment, getK8sClusterSummaryForRBACAssessment, getMisconfigurations, getVulnerabilities, getSupplyChainSBOM } from "./utils/index";
import { UploadOutlined, ContainerOutlined, SettingOutlined, AlertOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BugOutlined } from "@ant-design/icons";
import "./App.css";
import type { MenuProps } from "antd";



type MenuItem = {
  key: string;
  icon: any;
  label: string;
};


function App() {
  const [vulnerabilities, setVulnerabilities] = useState<NormalizedResultForDataTable[]>([]);
  const [secrets, setSecrets] = useState<NormalizedResultForDataTable[]>([]);
  const [misconfigurations, setMisconfigurations] = useState<NormalizedResultForDataTable[]>([]);
  const [misconfigurationSummary, setMisconfigurationSummary] = useState<NormalizedResultForDataTable[]>([]);
  const [k8sClusterSummaryInfraAssessment, setK8sClusterSummaryInfraAssessment] = useState<NormalizedResultForDataTable[]>([]);
  const [k8sClusterSummaryRBACAssessment, setK8sClusterSummaryRBACAssessment] = useState<NormalizedResultForDataTable[]>([]);
  const [supplyChainSBOM, setSupplyChainSBOM] = useState<NormalizedResultForDataTable[]>([]);
  const [selectedMenu, setSelectedMenu] = useState("vulnerabilities");
  const [loadedReport, setLoadedReport] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<MenuTheme>('light');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reportTitle, setReportTitle] = useState('Trivy Report');
  const [filledResultsPerCategory, setFilledResultsPerCategory] = useState<string[]>([]);

  const onThemeChanged = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const onToggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onMenuSelected: MenuProps['onClick'] = (e) => {
    setSelectedMenu(e.key);
  };

  useEffect(() => {
    let tempResults: string[] = [];
    if (vulnerabilities.length > 0){
      tempResults.push("vulnerabilities");
    }

    if (secrets.length > 0){
      tempResults.push("secrets");
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
    setMenuItems([
      { key: "vulnerabilities", icon: <BugOutlined />, label: `Vulnerabilities (${vulnerabilities.length})` },
      { key: "secrets", icon: <BugOutlined />, label: `Secrets (${secrets.length})` },
      { key: "misconfigurationSummary", icon: <SettingOutlined />, label: `Misconfiguration Summary (${misconfigurationSummary.length})` },
      { key: "misconfigurations", icon: <SettingOutlined />, label: `Misconfigurations (${misconfigurations.length})` },
      { key: "k8sClusterSummary", icon: <AlertOutlined />, label: `K8s Cluster Summary (${k8sClusterSummaryInfraAssessment.length} / ${k8sClusterSummaryRBACAssessment.length})` },
      { key: "supplyChainSBOM", icon: <ContainerOutlined />, label: `Supply Chain SBOM(spdx) (${supplyChainSBOM.length})`  },
      { key: "loadAReport", icon: <UploadOutlined />, label: "Load a report" }
    ]);
  }, [vulnerabilities, misconfigurationSummary, misconfigurations, k8sClusterSummaryInfraAssessment, k8sClusterSummaryRBACAssessment, supplyChainSBOM]);

  useEffect(() => {
    setVulnerabilities(getVulnerabilities(defaultData));
    setSecrets(getSecrets(defaultData));
    setMisconfigurations(getMisconfigurations(defaultData));
    setMisconfigurationSummary(getMisconfigurationSummary(defaultData));
    setK8sClusterSummaryInfraAssessment(getK8sClusterSummaryForInfraAssessment(defaultData));
    setK8sClusterSummaryRBACAssessment(getK8sClusterSummaryForRBACAssessment(defaultData));
    setSupplyChainSBOM(getSupplyChainSBOM(defaultData));
  }, []);

  useEffect(() => {
    if (menuItems.length > 0){
      const label = menuItems.filter((item) => item?.key == selectedMenu);
      setReportTitle(`Trivy Report - ${label[0]?.label}`);
    }
    
  }, [selectedMenu]);

  useEffect(() => {
    setSelectedMenu(filledResultsPerCategory[0]);
    if(filledResultsPerCategory.length === 1) { // Collapse the menu
      setCollapsed(true);
    }
    
  }, [filledResultsPerCategory]);

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
          setVulnerabilities(getVulnerabilities(jsonObject));
          setSecrets(getSecrets(defaultData));
          setMisconfigurations(getMisconfigurations(jsonObject));
          setMisconfigurationSummary(getMisconfigurationSummary(jsonObject));
          setK8sClusterSummaryInfraAssessment(getK8sClusterSummaryForInfraAssessment(jsonObject));
          setK8sClusterSummaryRBACAssessment(getK8sClusterSummaryForRBACAssessment(jsonObject));
          setSupplyChainSBOM(getSupplyChainSBOM(jsonObject));
          
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }

        console.log(info.file);
        setLoadedReport(info.file.name);
        notification.success({
          message: "File Uploaded",
          description: `${loadedReport} uploaded successfully.`,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div id="menu">
        <Switch
          checked={theme === 'dark'}
          onChange={onThemeChanged}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
        <Button type="primary" onClick={onToggleCollapsed} style={{ margin: 16 }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Menu
          defaultSelectedKeys={["vulnerabilities"]}
          selectedKeys={[selectedMenu]}
          mode="inline"
          theme={theme}
          inlineCollapsed={collapsed}
          items={menuItems}
          onClick={onMenuSelected}
        />
      </div>
      <div id="content" style={{ flexGrow: 1, marginLeft: 20 }}>
        <TableTitle title={reportTitle}/>  
        <TrivyReport
          vulnerabilities={vulnerabilities}
          secrets={secrets}
          misconfigurations={misconfigurations}
          misconfigurationSummary={misconfigurationSummary}
          k8sClusterSummaryInfraAssessment={k8sClusterSummaryInfraAssessment}
          k8sClusterSummaryRBACAssessment={k8sClusterSummaryRBACAssessment}
          selectedMenu={selectedMenu}
          supplyChainSBOM={supplyChainSBOM}
          onReportUpload={onReportUpload}
          loadedReport={loadedReport}
        />
      </div>
    </div>
  );
}

export default App;
