import { SearchOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import type { InputRef } from "antd";
import { Button, Input, Space, Table, Tag } from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { Divider, Radio } from "antd";
import Title from "antd/es/typography/Title";

import { FormattedResult } from "../../types";

interface Vulnerability {
  VulnerabilityID: string;
  PkgID: string;
  PkgName: string;
  InstalledVersion: string;
  FixedVersion: string;
  Layer: object;
  SeveritySource: string;
  PrimaryURL: string;
  DataSource: {
    ID: string;
    Name: string;
    URL: string;
  };
  Title: string;
  Description: string;
  Severity: string;
  CVSS: {
    ghsa: {
      V3Vector: string;
      V3Score: number;
    };
  };
  References: string[];
}

interface DataType {
  Target: string;
  Class: string;
  Type: string;
  MisconfSummary: {
    Successes: number;
    Failures: number;
    Exceptions: number;
  };
  Vulnerability: Vulnerability;
  Misconfigurations: [
    {
      Type: string;
      ID: "DS002";
      AVDID: string;
      Title: string;
      Description: string;
      Message: string;
      Namespace: string;
      Query: string;
      Resolution: string;
      Severity: string;
      PrimaryURL: string;
      References: string[];
      Status: string;
      Layer: object;
      CauseMetadata: {
        Provider: string;
        Service: string;
        Code: {
          Lines: null;
        };
      };
    },
    {
      Type: string;
      ID: string;
      AVDID: string;
      Title: string;
      Description: string;
      Message: string;
      Namespace: string;
      Query: string;
      Resolution: string;
      Severity: string;
      PrimaryURL: string;
      References: string[];
      Status: string;
      Layer: object;
      CauseMetadata: {
        Provider: string;
        Service: string;
        Code: {
          Lines: null;
        };
      };
    }
  ];
}

type DataIndex = keyof FormattedResult;

interface TrivyReportProps {
  result: FormattedResult[];
}

const TrivyReport: React.FC<TrivyReportProps> = ({ result }) => {
  console.log("TrivyReport-result:", result);

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
  ): ColumnType<FormattedResult> => ({
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

  const columns: ColumnsType<FormattedResult> = [
    // {
    //   title: "Name",
    //   dataIndex: "name",
    //   key: "name",
    //   width: "30%",
    //   ...getColumnSearchProps("name"),
    // },
    // {
    //   title: "Age",
    //   dataIndex: "age",
    //   key: "age",
    //   width: "20%",
    //   ...getColumnSearchProps("age"),
    // },
    // {
    //   title: "Address",
    //   dataIndex: "address",
    //   key: "address",
    //   ...getColumnSearchProps("address"),
    //   sorter: (a, b) => a.address.length - b.address.length,
    //   sortDirections: ["descend", "ascend"],
    // },
    {
      title: "Target",
      dataIndex: "Target",
      key: "Target",
      width: "10%",
      ...getColumnSearchProps("Target"),
      sorter: (a, b) => a.Target.length - b.Target.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Library/Package",
      dataIndex: "Library",
      key: "Library",
      width: "10%",
      ...getColumnSearchProps("Library"),
      sorter: (a, b) => a.Target.length - b.Target.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Vulnerability",
      dataIndex: "Vulnerability",
      key: "Vulnerability",
      width: "10%",
      ...getColumnSearchProps("Vulnerability"),
      sorter: (a, b) => a.Target.length - b.Target.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Severity",
      dataIndex: "Severity",
      key: "Severity",
      width: "10%",
      ...getColumnSearchProps("Severity"),
      sorter: (a, b) => a.Target.length - b.Target.length,
      sortDirections: ["descend", "ascend"],
      //   render: (_, { tags }) => (
      //     <>
      //       {tags.map(tag => {
      //         let color = tag.length > 5 ? "geekblue" : "green";
      //         if (tag === "loser") {
      //           color = "volcano";
      //         }
      //         return (
      //           <Tag color={color} key={tag}>
      //             {tag.toUpperCase()}
      //           </Tag>
      //         );
      //       })}
      //     </>
      //   ),
      // render: (_, { Misconfigurations }) => (
      //   <>
      //     {Misconfigurations.map(tag => {
      //       return (
      //         <Tag color="volcano" key={tag.ID}>
      //           {tag.Severity}
      //         </Tag>
      //       );
      //     })}
      //   </>
      // ),
    },
    {
      title: "Installed Version",
      dataIndex: "InstalledVersion",
      key: "InstalledVersion",
      width: "10%",
      ...getColumnSearchProps("InstalledVersion"),
      sorter: (a, b) => a.InstalledVersion.length - b.InstalledVersion.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Fixed Version",
      dataIndex: "FixedVersion",
      key: "FixedVersion",
      width: "10%",
      ...getColumnSearchProps("FixedVersion"),
      sorter: (a, b) => a.FixedVersion.length - b.FixedVersion.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      width: "10%",
      ...getColumnSearchProps("Title"),
      sorter: (a, b) => a.Title.length - b.Title.length,
      sortDirections: ["descend", "ascend"],
    },
  ];

  return (
    <>
      <Title level={3}>Trivy Report</Title>
      <Radio.Group
      // onChange={({ target: { value } }) => {
      //   setSelectionType(value);
      // }}
      // value={selectionType}
      >
        <Radio value="checkbox">Checkbox</Radio>
        <Radio value="radio">radio</Radio>
      </Radio.Group>

      <Divider />

      <Table columns={columns} dataSource={result} />
    </>
  );
};

export default TrivyReport;
