import { SearchOutlined } from "@ant-design/icons";
  import { Typography } from "antd";
  import type { InputRef } from "antd";
  const { Link } = Typography;
import { Button, Input, Space, Table } from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { useRef, useState, useEffect} from "react";
import SeverityTag from "../shared/SeverityTag";
import { severityFilters } from "../../constants";
import { NormalizedResultForDataTable, DataIndexForNormalizedResultForDataTable } from "../../types";
import Highlighter from "react-highlight-words";
import { filterResultByKeyword, filterDropdown, localeCompare, severityCompare, removeDuplicateResults } from "../../utils";
import SeverityToolbar from '../shared/SeverityToolbar.tsx';
import CodeDisplay from '../shared/CodeDisplay.tsx';

interface MisconfigurationsProps {
  result: NormalizedResultForDataTable[];
}

const Misconfigurations: React.FC<MisconfigurationsProps> = ({ result }) => {
  console.log("Vulnerabilities:", result);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [filteredData, setFilteredData] = useState<NormalizedResultForDataTable[]>([]);
  const searchInput = useRef<InputRef>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
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

  const handleFilterClick = (filterValue: string) => {
    updateFilteredData(filterResultByKeyword(result, filterValue));
  };

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
    setSearchText("");
  };

  const handleExpand = (expanded: boolean, record: NormalizedResultForDataTable) => {
    if (expanded) {
      setExpandedRowKeys((prevKeys) => [...prevKeys, record.key]);
    } else {
      setExpandedRowKeys((prevKeys) => prevKeys.filter((key) => key !== record.key));
    }
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
          style={{ marginBottom: 8, display: "block" }}
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
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (searchValue, record) => filterDropdown(record[dataIndex], searchValue),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<NormalizedResultForDataTable> = [
    {
      title: "Target",
      dataIndex: "Target",
      key: "Target",
      width: "8%",
      ...getColumnSearchProps("Target"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Target, b.Target),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      width: "7%",
      ...getColumnSearchProps("ID"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.ID, b.ID),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      width: "15%",
      ...getColumnSearchProps("Title"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Title, b.Title),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Severity",
      dataIndex: "Severity",
      key: "Severity",
      width: "5%",
      filters: severityFilters,
      onFilter: (value, record) => record.Severity === value,
      render: (_, { Severity }) => <SeverityTag severity={Severity ? Severity : ""} />,
      defaultSortOrder: "descend",
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => severityCompare(a.Severity, b.Severity),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
      width: "10%",
      ...getColumnSearchProps("Type"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Type, b.Type),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Message",
      dataIndex: "Message",
      key: "Message",
      width: "15%",
      ...getColumnSearchProps("Message"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Message, b.Message),
      sortDirections: ["descend", "ascend"],
    },
  ];

  return (
    <>
    <SeverityToolbar result={deduplicatedResults} onFilterClick={handleFilterClick} onDeduplicationClick={toggleDeduplication} deduplicationOn={deduplicationOn}/>
    <Table columns={columns} dataSource={filteredData} pagination={{ defaultPageSize: 20 }} size="small" sticky 
      expandable={{
        expandedRowRender: (misconfiguration) => (
          <div style={{ margin: 0 }}>
            <strong>Description:</strong> {misconfiguration.Description}
            <CodeDisplay lines={misconfiguration.Code?.Lines || []} />
            <p><strong>References:</strong></p>
            <ul>
              {misconfiguration.References?.map((ref, index) => (
                <li key={index}>
                <Link href={ref} target="_blank">
                  {ref}
                </Link>
                </li>
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

export default Misconfigurations;
