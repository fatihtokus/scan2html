export type Car = {
  brand: string;
  model: string;
};

export type VulnerabilityResult = {
  Target: string;
  Vulnerabilities: Vulnerability[];
};

export type Vulnerability = {
  PkgName: string;
  VulnerabilityID: string;
  Severity: string;
  InstalledVersion: string;
  FixedVersion: string;
  Title: string;
};

export type FormattedResult = {
  Target: string;
  Library: string;
  Vulnerability: string;
  Severity: string;
  InstalledVersion: string;
  FixedVersion: string;
  Title: string;
};
