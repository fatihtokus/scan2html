export type CommonScanResult = {
  // default scan result
  SchemaVersion: number;
  ArtifactName: string;
  ArtifactType: string;
  Results: CommonResult[];

  // K8s scan result
  ClusterName: string;
  // default
  Vulnerabilities: Holder[];
  Misconfigurations: Holder[];
  // K8s scan result for cluster
  // command trivy k8s --format json -o results.json cluster
  Resources: Holder[];

  // K8s scan result for cluster
  // command: trivy k8s --report=all all -n default --format json -o results_k8s_all.json
  Findings: Holder[];

  // SBOM
  packages: SBOM[];
  SPDXID: string;
  dataLicense: string;
  documentNamespace: string;
  name: string;
  spdxVersion: string;
  creationInfo: CreationInfo;
};

export type Holder = {
  Namespace: string;
  Kind: string;
  Name: string;
  Results: CommonResult[];
};

export type CommonResult = {
  // common for both default scan and k8s result
  Target: string;
  Class: string;
  Type: string;
  Vulnerabilities: Vulnerability[];
  MisconfSummary: MisconfSummary;
  Misconfigurations: Misconfiguration[];

  // specific to default scan result
  Secrets: Secret[];
};

export type CreationInfo = {
  created: string;
  creators: string[];
};

export type SBOM = {
  SPDXID: string;
  filesAnalyzed: boolean;
  licenseConcluded: string;
  licenseDeclared: string;
  name: string;
  versionInfo: string;
};

export type MisconfSummary = {
  Successes: number;
  Failures: number;
  Exceptions: number;
};

export type Vulnerability = {
  VulnerabilityID: string;
  Severity: string;
  InstalledVersion: string;
  PkgName: string;
  PkgPath: string;
  FixedVersion: string;
  Title: string;
  SeveritySource: string;
  PrimaryURL: string;
  Description: string;
  References: string[];
  CVSS: CVSS;
  PublishedDate: string;
  LastModifiedDate: string;
};

type CVSS = {
  nvd?: {
      V2Score?: number;
      V3Score?: number;
  };
}

export type Misconfiguration = {
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
};

export type Secret = {
  RuleID: string;
  Category: string;
  Severity: string;
  Title: string;
  Match: string;
  StartLine: number;
  EndLine: number;
  Code: Code;
};

export type Code = {
  Lines: Line[];
};

export type Line = {
  Number: number;
  Content: string;
  IsCause: boolean;
  Annotation: string;
  Truncated: boolean;
  Highlighted: string;
};
