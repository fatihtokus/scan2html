import { SearchOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Button, Input, Space, Table } from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { useRef, useState } from "react";
import SeverityTag from "../shared/SeverityTag";
import { severityFilters } from "../../constants";
import { NormalizedResultForDataTable } from "../../types";
import Highlighter from "react-highlight-words";

type DataIndex = keyof NormalizedResultForDataTable;

interface MisconfigurationsProps {
  result: NormalizedResultForDataTable[];
}

const Misconfigurations: React.FC<MisconfigurationsProps> = ({ result }) => {
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
      record
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

  const columns: ColumnsType<NormalizedResultForDataTable> = [
    {
      title: "Target",
      dataIndex: "Target",
      key: "Target",
      width: "8%",
      ...getColumnSearchProps("Target"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Target.localeCompare(b.Target),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      width: "7%",
      ...getColumnSearchProps("ID"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.ID && b.ID ? a.ID.localeCompare(b.ID) : 0,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      width: "15%",
      ...getColumnSearchProps("Title"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Title && b.Title ? a.Title.localeCompare(b.Title) : 0,
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
      defaultSortOrder: 'descend',
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Severity && b.Severity ? a.Severity.length - b.Severity.length : 0,//this is wrong
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
      width: "10%",
      ...getColumnSearchProps("Type"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Type.localeCompare(b.Type),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Message",
      dataIndex: "Message",
      key: "Message",
      width: "15%",
      ...getColumnSearchProps("Message"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Message && b.Message ? a.Message.localeCompare(b.Message) : 0,
      sortDirections: ["descend", "ascend"],
    }
  ];

  return (
    <>
      <Table columns={columns} dataSource={result} pagination={{ pageSize: 20}} size="small"/>
    </>
  );
};

export default Misconfigurations;
