export type NormalizedResultForDataTable = {
  Target: string;
  ID: string;
  Library: string;
  Vulnerability: string;
  Severity: string;
  InstalledVersion: string;
  FixedVersion: string;
  Title: string;
  Type: string;
  Message: string;
  IsVulnerability: boolean;

  // K8s Misconfiguration Summary
  Successes: number;
  Failures: number;
  Exceptions: number;
  Class: string;
};
