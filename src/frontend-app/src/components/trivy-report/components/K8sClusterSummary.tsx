import { Table } from "antd";
const { Column, ColumnGroup } = Table;
import { NormalizedResultForDataTable } from "../../../types";
import { localeCompare } from "../../../utils";

interface K8sClusterSummaryProps {
  k8sClusterSummaryInfraAssessment: NormalizedResultForDataTable[];
  k8sClusterSummaryRBACAssessment: NormalizedResultForDataTable[];
}

const K8sClusterSummary: React.FC<K8sClusterSummaryProps> = ({ k8sClusterSummaryInfraAssessment, k8sClusterSummaryRBACAssessment }) => {
  console.log("K8sClusterSummary-k8sSummaryInfraAssessment:", k8sClusterSummaryInfraAssessment);
  console.log("K8sClusterSummary-k8sSummaryRBACAssessment:", k8sClusterSummaryRBACAssessment);

  return (
    <>
      <Table dataSource={k8sClusterSummaryInfraAssessment} size="small" bordered title={() => "Infra Assessment"} footer={() => "CRITICAL=C HIGH= H, MEDIUM=M LOW=L UNDEFINED=U"}>
        <Column title="Namespace" dataIndex="Namespace" key="Namespace" sorter={(a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Namespace, b.Namespace)} />
        <Column
          title="Resource"
          dataIndex="Target"
          key="Resource"
          defaultSortOrder="descend"
          sorter={(a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Target, b.Target)}
        />
        <ColumnGroup title="Vulnerabilities">
          <Column
            title="C"
            key="c"
            render={(record: NormalizedResultForDataTable) => (record.VulnerabilitiesSummary?.Critical === 0 ? "" : record.VulnerabilitiesSummary?.Critical)}
            sorter={(a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) =>
              a.VulnerabilitiesSummary && b.VulnerabilitiesSummary ? a.VulnerabilitiesSummary.Critical - b.VulnerabilitiesSummary.Critical : 0
            }
          />
          <Column title="H" key="h" render={(record: NormalizedResultForDataTable) => (record.VulnerabilitiesSummary?.High === 0 ? "" : record.VulnerabilitiesSummary?.High)} />
          <Column title="M" key="m" render={(record: NormalizedResultForDataTable) => (record.VulnerabilitiesSummary?.Medium === 0 ? "" : record.VulnerabilitiesSummary?.Medium)} />
          <Column title="L" key="l" render={(record: NormalizedResultForDataTable) => (record.VulnerabilitiesSummary?.Low === 0 ? "" : record.VulnerabilitiesSummary?.Low)} />
          <Column title="U" key="u" render={(record: NormalizedResultForDataTable) => (record.VulnerabilitiesSummary?.Undefined === 0 ? "" : record.VulnerabilitiesSummary?.Undefined)} />
        </ColumnGroup>
        <ColumnGroup title="Misconfigurations">
          <Column title="C" key="c" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Critical === 0 ? "" : record.MisconfigurationsSummary?.Critical)} />
          <Column title="H" key="h" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.High === 0 ? "" : record.MisconfigurationsSummary?.High)} />
          <Column title="M" key="m" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Medium === 0 ? "" : record.MisconfigurationsSummary?.Medium)} />
          <Column title="L" key="l" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Low === 0 ? "" : record.MisconfigurationsSummary?.Low)} />
          <Column title="U" key="u" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Undefined === 0 ? "" : record.MisconfigurationsSummary?.Undefined)} />
        </ColumnGroup>
        <ColumnGroup title="Secrets">
          <Column title="C" key="c" render={(record: NormalizedResultForDataTable) => (record.SecretsSummary?.Critical === 0 ? "" : record.SecretsSummary?.Critical)} />
          <Column title="H" key="h" render={(record: NormalizedResultForDataTable) => (record.SecretsSummary?.High === 0 ? "" : record.SecretsSummary?.High)} />
          <Column title="M" key="m" render={(record: NormalizedResultForDataTable) => (record.SecretsSummary?.Medium === 0 ? "" : record.SecretsSummary?.Medium)} />
          <Column title="L" key="l" render={(record: NormalizedResultForDataTable) => (record.SecretsSummary?.Low === 0 ? "" : record.SecretsSummary?.Low)} />
          <Column title="U" key="u" render={(record: NormalizedResultForDataTable) => (record.SecretsSummary?.Undefined === 0 ? "" : record.SecretsSummary?.Undefined)} />
        </ColumnGroup>
      </Table>

      <Table dataSource={k8sClusterSummaryRBACAssessment} size="small" title={() => "RBAC Assessment"} bordered>
        <Column title="Namespace" dataIndex="Namespace" key="Namespace" sorter={(a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Namespace, b.Namespace)} />
        <Column
          title="Resource"
          dataIndex="Target"
          key="Resource"
          defaultSortOrder="descend"
          sorter={(a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => localeCompare(a.Target, b.Target)}
        />
        <ColumnGroup title="RBAC Assessment">
          <Column
            title="C"
            key="c"
            render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Critical === 0 ? "" : record.MisconfigurationsSummary?.Critical)}
            sorter={(a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) =>
              a.MisconfigurationsSummary && b.MisconfigurationsSummary ? a.MisconfigurationsSummary.Critical - b.MisconfigurationsSummary.Critical : 0
            }
          />
          <Column title="H" key="h" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.High === 0 ? "" : record.MisconfigurationsSummary?.High)} />
          <Column title="M" key="m" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Medium === 0 ? "" : record.MisconfigurationsSummary?.Medium)} />
          <Column title="L" key="l" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Low === 0 ? "" : record.MisconfigurationsSummary?.Low)} />
          <Column title="U" key="u" render={(record: NormalizedResultForDataTable) => (record.MisconfigurationsSummary?.Undefined === 0 ? "" : record.MisconfigurationsSummary?.Undefined)} />
        </ColumnGroup>
      </Table>
    </>
  );
};

export default K8sClusterSummary;
