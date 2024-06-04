import { SearchOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Button, Input, Space, Table } from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { useRef, useState } from "react";
import { NormalizedResultForDataTable, DataIndexForNormalizedResultForDataTable } from "../../types";
import { filterDropdown, localeCompare, severityCompare } from "../../utils";

import SeverityTag from "../shared/SeverityTag";
import { severityFilters } from "../../constants";
import Highlighter from "react-highlight-words";

interface SecretsProps {
  result: NormalizedResultForDataTable[];
}

const Secrets: React.FC<SecretsProps> = ({ result }) => {
  console.log("Secrets:", result);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndexForNormalizedResultForDataTable) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
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
      width: "15%",
      ...getColumnSearchProps("Target"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Target, b.Target),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      width: "15%",
      ...getColumnSearchProps("ID"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.ID, b.ID),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Category",
      dataIndex: "Category",
      key: "Category",
      width: "15%",
      ...getColumnSearchProps("Category"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Category, b.Category),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Severity",
      dataIndex: "Severity",
      key: "Severity",
      width: "10%",
      filters: severityFilters,
      onFilter: (value, record) => record.Severity === value,
      render: (_, { Severity }) => <SeverityTag severity={Severity ? Severity : ""} />,
      defaultSortOrder: "descend",
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => severityCompare(a.Severity, b.Severity), //This is wrong
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      width: "26%",
      ...getColumnSearchProps("Title"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Title, b.Title),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Start Line",
      dataIndex: "StartLine",
      key: "StartLine",
      width: "10%",
      ...getColumnSearchProps("StartLine"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.StartLine, b.StartLine),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "End Line",
      dataIndex: "EndLine",
      key: "EndLine",
      width: "10%",
      ...getColumnSearchProps("EndLine"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.EndLine, b.EndLine),
      sortDirections: ["descend", "ascend"],
    }
  ];

  return (
    <>
      <Table columns={columns} dataSource={result} pagination={{ defaultPageSize: 20 }} size="small" sticky />
    </>
  );
};

export default Secrets;
