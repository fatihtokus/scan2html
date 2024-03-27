import { useEffect, useState } from "react";
import { Divider, Upload, Button, notification } from "antd";
import Title from "antd/es/typography/Title";

import TrivyReport from "./components/trivy-report/TrivyReport";
import defaultData from "./data/data.json";
import { NormalizedResultForDataTable } from "./types";
import { getMisconfigurations, getVulnerabilities } from "./utils/index";
import { UploadOutlined } from '@ant-design/icons';

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
  const [vulnerabilitiesOrMisconfigurations, setVulnerabilitiesOrMisconfigurations] = useState("vulnerabilities");

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
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
        
        console.log(info.file);
        notification.success({
          message: 'File Uploaded',
          description: `${info.file.name} uploaded successfully.`,
        });
      }
    };
    reader.readAsText(file);
  };
 
  useEffect(() => {
    setVulnerabilities(getVulnerabilities(defaultData));
    setMisconfigurations(getMisconfigurations(defaultData));
  }, []);

  return (
    <>
      <Title level={3}>Trivy Report</Title>
      <Upload
        onChange={handleUpload}
        showUploadList={false}
        beforeUpload={() => false}
      >
        <Button icon={<UploadOutlined/>}>Choose JSON file</Button>
      </Upload>

    <Divider />

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
