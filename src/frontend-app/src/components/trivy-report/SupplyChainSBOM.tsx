import { SearchOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Button, Input, Space, Table } from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { useRef, useState } from "react";
import { NormalizedResultForDataTable } from "../../types";
import Highlighter from "react-highlight-words";
import { localeCompare } from "../../utils";

type DataIndex = keyof NormalizedResultForDataTable;

interface SupplyChainSBOMProps {
  result: NormalizedResultForDataTable[];
}

const SupplyChainSBOM: React.FC<SupplyChainSBOMProps> = ({ result }) => {
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

  const generateTableHeader = (result : NormalizedResultForDataTable[]) => {
    return result.length == 0 ? "" : (result[0].SpdxVersion + '  |  ' + result[0].DataLicense + '  |  ' + result[0].DocSPDXID + '  |  ' + result[0].DocName + '  |  ' + result[0].DocumentNamespace + '  |  ' + result[0].Creators + '  |  ' + result[0].Created);
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
      title: "Package Name",
      dataIndex: "Name",
      key: "Name",
      width: "7%",
      ...getColumnSearchProps("Name"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Name, b.Name),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "SPDXID",
      dataIndex: "SPDXID",
      key: "SPDXID",
      width: "13%",
      ...getColumnSearchProps("SPDXID"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.SPDXID, b.SPDXID),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Package Version",
      dataIndex: "VersionInfo",
      key: "VersionInfo",
      width: "5%",
      ...getColumnSearchProps("VersionInfo"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.VersionInfo, b.VersionInfo),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Files Analyzed",
      dataIndex: "FilesAnalyzed",
      key: "FilesAnalyzed",
      width: "4%",
      ...getColumnSearchProps("FilesAnalyzed"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.FilesAnalyzed, b.FilesAnalyzed),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Package License Concluded",
      dataIndex: "LicenseConcluded",
      key: "LicenseConcluded",
      width: "12%",
      ...getColumnSearchProps("LicenseConcluded"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.LicenseConcluded, b.LicenseConcluded),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Package License Declared",
      dataIndex: "LicenseDeclared",
      key: "LicenseDeclared",
      width: "12%",
      ...getColumnSearchProps("LicenseDeclared"),
      sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.LicenseDeclared, b.LicenseDeclared),
      sortDirections: ["descend", "ascend"],
    }
  ];

  return (
    <>
      <Table columns={columns} dataSource={result} pagination={{ pageSize: 20}} size="small" bordered title={() => generateTableHeader(result)} sticky/>
    </>
  );
};

export default SupplyChainSBOM;
