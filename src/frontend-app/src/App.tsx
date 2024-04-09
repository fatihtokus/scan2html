import { useEffect, useState } from "react";
import { Divider, Upload, Button, notification} from "antd";
import Title from "antd/es/typography/Title";

import TrivyReport from "./components/trivy-report/TrivyReport";
import defaultData from "./data/data.json";
import { NormalizedResultForDataTable } from "./types";
import { getMisconfigurationSummary, getMisconfigurations, getVulnerabilities } from "./utils/index";
import { UploadOutlined } from '@ant-design/icons';
import "./App.css";

interface UploadInfo {
  file: UploadFile | File;
  fileList: UploadFile[];
  event?: {
    percent: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface UploadFile {
  uid: string;
  name: string;
  status?: string;
  response?: string | object;
  url?: string;
  originFileObj?: File;
  [key: string]: any;
}

function App() {
  const [vulnerabilities, setVulnerabilities] = useState<NormalizedResultForDataTable[]>([]);
  const [misconfigurations, setMisconfigurations] = useState<NormalizedResultForDataTable[]>([]);
  const [misconfigurationSummary, setMisconfigurationSummary] = useState<NormalizedResultForDataTable[]>([]);
  const [vulnerabilitiesOrMisconfigurations, setVulnerabilitiesOrMisconfigurations] = useState("vulnerabilities");
  const [loadedFile, setLoadedFile] = useState("");

  const handleUpload = (info: UploadInfo) => {
    console.log(info);
    const file = info.file as Blob;

    if (!(file instanceof Blob)) {
      console.error('Uploaded file is not a Blob.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const content = event.target.result as string;
        try {
          const jsonObject = JSON.parse(content);
          console.log('Parsed JSON object:', jsonObject);
          setVulnerabilities(getVulnerabilities(jsonObject));
          setMisconfigurations(getMisconfigurations(jsonObject));
          setMisconfigurationSummary(getMisconfigurationSummary(jsonObject));
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
        
        console.log(info.file);
        setLoadedFile(info.file.name);
        notification.success({
          message: 'File Uploaded',
          description: `${loadedFile} uploaded successfully.`,
        });
      }
    };
    reader.readAsText(file);
  };
 
  useEffect(() => {
    setVulnerabilities(getVulnerabilities(defaultData));
    setMisconfigurations(getMisconfigurations(defaultData));
    setMisconfigurationSummary(getMisconfigurationSummary(defaultData));
  }, []);

  return (
    <>
      <Title level={3}>Trivy Report via scan2html</Title>
      <Upload
        onChange={handleUpload}
        accept='.json'
        showUploadList={false}
        beforeUpload={() => false}
      >
        <Button icon={<UploadOutlined/>}>Select a Trivy JSON Report from your local file system</Button> {loadedFile}
      </Upload>
      <Divider/>
      <TrivyReport 
          vulnerabilities={vulnerabilities}
          misconfigurations={misconfigurations}
          misconfigurationSummary={misconfigurationSummary}
          vulnerabilitiesOrMisconfigurations={vulnerabilitiesOrMisconfigurations} 
          setVulnerabilitiesOrMisconfigurations={setVulnerabilitiesOrMisconfigurations}
        />
    </>
  );
}

export default App;
