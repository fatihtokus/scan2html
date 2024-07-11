export class NormalizedResultForDataTable {
  Target: string = "";
  ID?: string;
  Library?: string;
  Vulnerability?: string;
  NVD_V2Score?: number;
  NVD_V3Score?: number;
  Severity?: string;
  InstalledVersion?: string;
  FixedVersion?: string;
  Title?: string;
  Type: string = "";
  Message?: string;
  IsVulnerability?: boolean;

  // Secrets
  Category?: string;
  StartLine?: string;
  EndLine?: string;

  // K8s Misconfiguration Summary
  Successes?: number;
  Failures?: number;
  Exceptions?: number;
  Class?: string;

  // K8s Cluster Summary
  Kind?: string;
  Namespace?: string;
  VulnerabilitiesSummary?: SummaryByCriticalities;
  MisconfigurationsSummary?: SummaryByCriticalities;
  SecretsSummary?: SummaryByCriticalities;

  // SBOM
  // Master
  DocSPDXID?: string;
  DataLicense?: string;
  DocumentNamespace?: string;
  DocName?: string;
  Created?: string;
  SpdxVersion?: string;
  Creators?: string[];
  //Rows
  SPDXID?: string;
  FilesAnalyzed?: string;
  LicenseConcluded?: string;
  LicenseDeclared?: string;
  Name?: string;
  VersionInfo?: string;

  constructor(Target: string, Type: string, Kind: string, Namespace: string) {
    this.Target = Target;
    this.Type = Type;
    this.Kind = Kind;
    this.Namespace = Namespace;
    this.VulnerabilitiesSummary = new SummaryByCriticalities();
    this.MisconfigurationsSummary = new SummaryByCriticalities();
    this.SecretsSummary = new SummaryByCriticalities();
  }

  isNotEmptyForK8sSummary() {
    return !this.isEmptyForK8sSummary();
  }

  isEmptyForK8sSummary() {
    return this.VulnerabilitiesSummary?.isEmpty() && this.MisconfigurationsSummary?.isEmpty() && this.SecretsSummary?.isEmpty();
  }

  isRBACAssessment() {
    return this.Kind === "Role" || this.Kind === "RoleBinding" || this.Kind === "ClusterRole" || this.Kind === "ClusterRoleBinding" || this.Kind === "ServiceAccount";
  }

  isNotRBACAssessment() {
    return !this.isRBACAssessment();
  }
}

export type DataIndexForNormalizedResultForDataTable = keyof NormalizedResultForDataTable;

export class SummaryByCriticalities {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
  Undefined: number;
  constructor() {
    this.Critical = 0;
    this.High = 0;
    this.Medium = 0;
    this.Low = 0;
    this.Undefined = 0;
  }

  addSeverity(Severity: string) {
    if (Severity === "CRITICAL") {
      this.Critical += 1;
    }
    if (Severity === "HIGH") {
      this.High += 1;
    }
    if (Severity === "MEDIUM") {
      this.Medium += 1;
    }
    if (Severity === "LOW") {
      this.Low += 1;
    }
    if (Severity === "UNDEFINED") {
      this.Undefined += 1;
    }
  }

  isNotEmpty() {
    return !this.isEmpty();
  }

  isEmpty() {
    return this.Critical === 0 && this.High === 0 && this.Medium === 0 && this.Low === 0 && this.Undefined === 0;
  }
}

export interface UploadInfo {
  file: UploadFile | File;
  fileList: UploadFile[];
  event?: {
    percent: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface UploadFile {
  uid: string;
  name: string;
  status?: string;
  response?: string | object;
  url?: string;
  originFileObj?: File;
  [key: string]: any;
}