import React, { useRef, useState, useEffect } from 'react';
import { Typography } from "antd";;
const { Link } = Typography;
import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import type { InputRef } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { NormalizedResultForDataTable, DataIndexForNormalizedResultForDataTable } from '../../types';
import { filterDropdown, localeCompare, severityCompare, numberCompare } from '../../utils';
import SeverityTag from '../shared/SeverityTag';
import { severityFilters } from '../../constants';
import SeverityToolbar from '../shared/SeverityToolbar';

interface VulnerabilitiesProps {
  result: NormalizedResultForDataTable[];
}

const Vulnerabilities: React.FC<VulnerabilitiesProps> = ({ result }) => {
  console.log('Vulnerabilities:', result);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredData, setFilteredData] = useState<NormalizedResultForDataTable[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    setFilteredData(result);
  }, [result]);

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndexForNormalizedResultForDataTable) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const handleSeverityClick = (severity: string) => {
    const filtered = result.filter(item => severity === 'all' || item.Severity?.toLowerCase() === severity); //doesn't work for negligible
    setFilteredData(filtered);
  };

  const getColumnSearchProps = (dataIndex: DataIndexForNormalizedResultForDataTable): ColumnType<NormalizedResultForDataTable> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button type="primary" onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (searchValue, record) => filterDropdown(record[dataIndex], searchValue),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<NormalizedResultForDataTable> = [
    {
      title: 'Target',
      dataIndex: 'Target',
      key: 'Target',
      width: '10%',
      ...getColumnSearchProps('Target'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Target, b.Target),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Library/Package',
      dataIndex: 'Library',
      key: 'Library',
      width: '10%',
      ...getColumnSearchProps('Library'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Library, b.Library),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Vulnerability',
      dataIndex: 'Vulnerability',
      key: 'Vulnerability',
      width: '6%',
      ...getColumnSearchProps('Vulnerability'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Vulnerability, b.Vulnerability),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'NVD V2Score',
      dataIndex: 'NVD_V2Score',
      key: 'NVD_V2Score',
      width: '4%',
      ...getColumnSearchProps('NVD_V2Score'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => numberCompare(a.NVD_V2Score, b.NVD_V2Score),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'NVD V3Score',
      dataIndex: 'NVD_V3Score',
      key: 'NVD_V3Score',
      width: '4%',
      ...getColumnSearchProps('NVD_V3Score'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => numberCompare(a.NVD_V3Score, b.NVD_V3Score),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Severity',
      dataIndex: 'Severity',
      key: 'Severity',
      width: '5%',
      filters: severityFilters,
      onFilter: (value, record) => record.Severity === value,
      render: (_, { Severity }) => <SeverityTag severity={Severity ? Severity : ''} />,
      defaultSortOrder: 'descend',
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => severityCompare(a.Severity, b.Severity),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Installed Version',
      dataIndex: 'InstalledVersion',
      key: 'InstalledVersion',
      width: '8%',
      ...getColumnSearchProps('InstalledVersion'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.InstalledVersion, b.InstalledVersion),
      sortDirections: ['descend', 'ascend'],
      render:(text, record)=> (
          <span title={record.PkgPath ? 'Path: ' + record.PkgPath : ''}>{text} </span>
      ),
    },
    {
      title: 'Fixed Version',
      dataIndex: 'FixedVersion',
      key: 'FixedVersion',
      width: '8%',
      ...getColumnSearchProps('FixedVersion'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.FixedVersion, b.FixedVersion),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Title',
      dataIndex: 'Title',
      key: 'Title',
      width: '15%',
      ...getColumnSearchProps('Title'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Title, b.Title),
      sortDirections: ['descend', 'ascend'],
    },
  ];

  const handleExpand = (expanded: boolean, record: NormalizedResultForDataTable) => {
    if (expanded) {
      setExpandedRowKeys((prevKeys) => [...prevKeys, record.key]);
    } else {
      setExpandedRowKeys((prevKeys) => prevKeys.filter((key) => key !== record.key));
    }
  };

  return (
    <>
      <SeverityToolbar result={result} onSeverityClick={handleSeverityClick} />
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ defaultPageSize: 20 }}
        size="small"
        sticky
        expandable={{
          expandedRowRender: (vulnerability) => (
            <div style={{ margin: 0 }}>
              <p><strong>References:</strong></p>
              <ul>
                {vulnerability.References?.map((ref, index) => (
                <Link href={ref} target="_blank">
                    <li key={index}>{ref}</li>
                </Link>
                ))}
              </ul>
            </div>
          ),
          expandedRowKeys: expandedRowKeys,
          onExpand: handleExpand,
          columnWidth: '2%', // Set this to a narrow column
        }}
      />
    </>
  );
};

export default Vulnerabilities;
