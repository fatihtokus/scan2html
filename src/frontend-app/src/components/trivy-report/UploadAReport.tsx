import React from 'react';
import { Button, Upload, Table } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadInfo } from '../../types';

interface UploadAReportProps {
  onReportUpload: (info: UploadInfo) => void;
  loadedReportFiles: string[];
  manuallyLoadedReportFile: string;
}

const UploadAReport: React.FC<UploadAReportProps> = ({
  onReportUpload,
  loadedReportFiles,
  manuallyLoadedReportFile,
}) => {
  const columns = [
    {
      title: 'Loaded Report Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
  ];

  // Create a new array including manuallyLoadedReportFile if it is not an empty string
  const reportFiles = manuallyLoadedReportFile 
    ? [...loadedReportFiles, manuallyLoadedReportFile]
    : loadedReportFiles;

  const dataSource = reportFiles.map((fileName, index) => ({
    key: index,
    index: index + 1,
    fileName: fileName,
  }));

  return (
    <div>
      <Upload
        onChange={onReportUpload}
        accept=".json"
        showUploadList={false}
        beforeUpload={() => false}
      >
        <Button icon={<UploadOutlined />}>
          Select a Trivy JSON Report from your local file system
        </Button>
      </Upload>
      <div>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          style={{ marginTop: 20 }}
        />
      </div>
    </div>
  );
};

export default UploadAReport;
