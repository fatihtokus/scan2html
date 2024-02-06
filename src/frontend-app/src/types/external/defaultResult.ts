export type CommonScanResult = {
  // default scan result
  SchemaVersion: number;
  ArtifactName: string;
  ArtifactType: string;
  Results: CommonResult[];

  // K8s scan result
  ClusterName: string;
  Vulnerabilities: Holder[];
  Misconfigurations: Holder[];
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

export type MisconfSummary = {
  Successes: number;
  Failures: number;
  Exceptions: number;
};

export type Vulnerability = {
  PkgName: string;
  VulnerabilityID: string;
  Severity: string;
  InstalledVersion: string;
  FixedVersion: string;
  Title: string;
  SeveritySource: string;
  PrimaryURL: string;
  Description: string;
  References: string[];
};

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