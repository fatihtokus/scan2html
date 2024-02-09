import { SearchOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Button, Input, Space, Table } from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { useRef, useState } from "react";
import { NormalizedResultForDataTable } from "../../types";
import SeverityTag from "../shared/SeverityTag";
import { severityFilters } from "../../constants";
import Highlighter from "react-highlight-words";

type DataIndex = keyof NormalizedResultForDataTable;

interface VulnerabilitiesProps {
  result: NormalizedResultForDataTable[];
}

const Vulnerabilities: React.FC<VulnerabilitiesProps> = ({ result }) => {
  console.log("Vulnerabilities:", result);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<NormalizedResultForDataTable> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
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
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<NormalizedResultForDataTable>= [
    {
      title: "Target",
      dataIndex: "Target",
      key: "Target",
      width: "10%",
      ...getColumnSearchProps("Target"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Target.length - b.Target.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Library/Package",
      dataIndex: "Library",
      key: "Library",
      width: "10%",
      ...getColumnSearchProps("Library"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Library.length - b.Library.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Vulnerability",
      dataIndex: "Vulnerability",
      key: "Vulnerability",
      width: "10%",
      ...getColumnSearchProps("Vulnerability"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Vulnerability.length - b.Vulnerability.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Severity",
      dataIndex: "Severity",
      key: "Severity",
      width: "5%",
      filters: severityFilters,
      onFilter: (value, record) => record.Severity === value,
      render: (_, {Severity}) => <SeverityTag severity={Severity} />,
      defaultSortOrder: 'descend',
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Severity.length - b.Severity.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Installed Version",
      dataIndex: "InstalledVersion",
      key: "InstalledVersion",
      width: "10%",
      ...getColumnSearchProps("InstalledVersion"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.InstalledVersion.length - b.InstalledVersion.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Fixed Version",
      dataIndex: "FixedVersion",
      key: "FixedVersion",
      width: "10%",
      ...getColumnSearchProps("FixedVersion"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.FixedVersion.length - b.FixedVersion.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      width: "15%",
      ...getColumnSearchProps("Title"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Title.localeCompare(b.Title),
      sortDirections: ["descend", "ascend"],
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={result} size="small"/>
    </>
  );
};

export default Vulnerabilities;
