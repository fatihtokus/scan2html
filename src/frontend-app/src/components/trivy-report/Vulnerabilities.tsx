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
import { filterResultByKeyword, filterDropdown, localeCompare, severityCompare, numberCompare, removeDuplicateResults } from '../../utils';
import SeverityTag from '../shared/SeverityTag';
import { severityFilters } from '../../constants';
import SeverityToolbar from '../shared/SeverityToolbar';
import Exploits from '../shared/Exploits';
import dayjs from 'dayjs';

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
  const [deduplicationOn, setDeduplicationOn] = useState(true);
  const [deduplicatedResults, setDeduplicatedResults] = useState<NormalizedResultForDataTable[]>(result);

  useEffect(() => {
    updateFilteredData(result);
    updateDeduplicatedResults(result);
  }, [result]);

  useEffect(() => {
    updateFilteredData(result);
    updateDeduplicatedResults(result);
  }, [deduplicationOn]);

  const updateDeduplicatedResults = (result: NormalizedResultForDataTable[]) => {
    setDeduplicatedResults(deduplicationOn ? removeDuplicateResults(result) : result);
  };

  const updateFilteredData = (result: NormalizedResultForDataTable[]) => {
    setFilteredData(deduplicationOn ? removeDuplicateResults(result) : result);
  };

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndexForNormalizedResultForDataTable) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const handleFilterClick = (filterValue: string) => {
    updateFilteredData(filterResultByKeyword(result, filterValue));
  };

  const toggleDeduplication = () => {
    setDeduplicationOn(!deduplicationOn);
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
      title: 'Artifact Name',
      dataIndex: 'ArtifactName',
      key: 'ArtifactName',
      width: '10%',
      ...getColumnSearchProps('ArtifactName'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.ArtifactName, b.ArtifactName),
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
      title: 'EPSS Score %',
      dataIndex: 'EPSS_Score',
      key: 'EPSS_Score',
      width: '5%',
      ...getColumnSearchProps('EPSS_Score'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => numberCompare(a.EPSS_Score, b.EPSS_Score),
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
      title: 'Exploits',
      dataIndex: 'Exploits',
      key: 'Exploits',
      width: '5%',
      ...getColumnSearchProps('Exploits'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Exploits, b.Exploits),
      sortDirections: ['descend', 'ascend'],
      render: (exploits, vulnerability) => exploits == 'CISA' && <Exploits vulnerabilityID={vulnerability.ID? vulnerability.ID : ''}/>,
    }, 
    {
      title: 'Installed Version',
      dataIndex: 'InstalledVersion',
      key: 'InstalledVersion',
      width: '8%',
      ...getColumnSearchProps('InstalledVersion'),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.InstalledVersion, b.InstalledVersion),
      sortDirections: ['descend', 'ascend'],
      render:(InstalledVersion, record)=> (
          <span title={record.PkgPath ? 'Path: ' + record.PkgPath : ''}>{InstalledVersion} </span>
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
      width: '10%',
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

  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => col.key as string));

  // Set default visible columns, with 'ArtifactName' excluded
  useEffect(() => {
    setVisibleColumns(columns.filter(col => col.key !== 'ArtifactName').map(col => col.key as string));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const ColumnVisibilitySelector: React.FC<{
    columns: ColumnsType<NormalizedResultForDataTable>,
    visibleColumns: string[],
    onChange: (cols: string[]) => void
  }> = ({ columns, visibleColumns, onChange }) => (
    <div>
      <span style={{ marginRight: 8 }}>Show columns:</span>
      {columns.map(col => (
        <label key={col.key} style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={visibleColumns.includes(col.key as string)}
            onChange={e => {
              if (e.target.checked) {
                onChange([...visibleColumns, col.key as string]);
              } else {
                onChange(visibleColumns.filter(key => key !== col.key));
              }
            }}
          />
          {typeof col.title === 'function' ? col.title({}) : col.title}
        </label>
      ))}
    </div>
  );

  return (
    <>
      <SeverityToolbar result={deduplicatedResults} onFilterClick={handleFilterClick} onDeduplicationClick={toggleDeduplication} deduplicationOn={deduplicationOn}/>
      <div style={{ marginBottom: 16 }}>
      <ColumnVisibilitySelector
        columns={columns}
        visibleColumns={visibleColumns}
        onChange={setVisibleColumns}
      />
      </div>
      <Table
        columns={columns.filter((col) => visibleColumns.includes(col.key as string))}
        dataSource={filteredData}
        pagination={{ defaultPageSize: 20 }}
        size="small"
        sticky
        expandable={{
          expandedRowRender: (vulnerability) => (
            <div style={{ margin: 0 }}>
              <strong>Description:</strong> {vulnerability.Description} <br />
              <strong>Published Date:</strong> {dayjs(vulnerability.PublishedDate).format('YYYY-MM-DD')}
              <strong> Last Modified Dates:</strong> {dayjs(vulnerability.LastModifiedDate).format('YYYY-MM-DD')}
              <p><strong>References:</strong></p>
              <ul>
                {vulnerability.References?.map((ref, index) => (
                  <Link href={ref} target="_blank" key={index}>
                    <li>{ref}</li>
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
