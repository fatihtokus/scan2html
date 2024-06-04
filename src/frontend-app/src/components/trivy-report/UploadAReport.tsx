import { Button, Upload } from "antd";
import {UploadInfo } from "../../types";
import { UploadOutlined} from "@ant-design/icons";

interface UploadAReportProps {
  onReportUpload: (info: UploadInfo) => void;
  loadedReport: string;
}

const UploadAReport: React.FC<UploadAReportProps> = ({ onReportUpload, loadedReport }) => {

return (
    <>
      <Upload onChange={onReportUpload} accept=".json" showUploadList={false} beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Select a Trivy JSON Report from your local file system</Button> {loadedReport}
      </Upload>
    </>
  );
};

export default UploadAReport;