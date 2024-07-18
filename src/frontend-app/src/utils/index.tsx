import { NormalizedResultForDataTable } from "../types";
import { CommonScanResult, CommonResult, Holder } from "../types/external/defaultResult";

export function getVulnerabilities(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getVulnerabilitiesFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getVulnerabilitiesFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Results) {
    return mapVulnerabilityResults(results.Results);
  }

  if (results.Vulnerabilities) {
    // k8s default format
    return vulnerabilitiesForK8s(results.Vulnerabilities);
  }

  if (results.Resources) {
    // k8s cluster format
    return vulnerabilitiesForK8s(results.Resources);
  }

  if (results.Findings) {
    // k8s cluster summary format
    return vulnerabilitiesForK8s(results.Findings);
  }

  return [];
}

export function getSecrets(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getSecretsFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getSecretsFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Results) {
    return mapSecretResults(results.Results);
  }

  return [];
}

export function filterDropdown(rowValue: any, searchValue: any) {
  if (rowValue === undefined) {
    return false;
  }

  return rowValue
    .toString()
    .toLowerCase()
    .includes((searchValue as string).toLowerCase());
}

export function localeCompare(argument1: any, argument2: any) {
  return argument1 && argument2 ? argument1.localeCompare(argument2) : 0;
}

export function numberCompare(argument1: any, argument2: any) {
  if (argument1 > argument2) {
      return 1;
  } 
  return argument1 < argument2 ? -1 : 0;
}

function mapSeverityToNumber(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return 5;
    case "high":
      return 4;
    case "medium":
      return 3;
    case "low":
      return 2;
    default:
      return 1;
  }
}

export function severityCompare(severity1: any, severity2: any) {
  return severity1 && severity2 ? mapSeverityToNumber(severity1) - mapSeverityToNumber(severity2) : 0;
}

function vulnerabilitiesForK8s(vulnerabilityHolders: Holder[]): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (vulnerabilityHolders === undefined) {
    return formattedResultJson;
  }

  vulnerabilityHolders.forEach((vulnerabilityHolder) => {
    formattedResultJson = formattedResultJson.concat(mapVulnerabilityResults(vulnerabilityHolder.Results));
  });

  return formattedResultJson;
}

function mapSecretResults(results: CommonResult[]): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    if (result.Secrets) {
      result.Secrets.forEach((vulnerability) => {
        formattedResultJson.push({
          Target: result.Target,
          ID: vulnerability.RuleID,
          Title: vulnerability.Title,
          Category: vulnerability.Category,
          Severity: vulnerability.Severity,
          StartLine: "" + vulnerability.StartLine,
          EndLine: "" + vulnerability.EndLine
        } as NormalizedResultForDataTable);
      });
    }
  });

  return formattedResultJson;
}

function mapVulnerabilityResults(results: CommonResult[]): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];

  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    if (result.Vulnerabilities) {
      result.Vulnerabilities.forEach((vulnerability) => {
        let NVD_V2Score;
        let NVD_V3Score;
        if (vulnerability.CVSS) {
          const CVSS = vulnerability.CVSS;
          if (CVSS.nvd) {
            NVD_V2Score = CVSS.nvd.V2Score ? CVSS.nvd.V2Score : '';
            NVD_V3Score = CVSS.nvd.V3Score ? CVSS.nvd.V3Score : '';
          }
        }

        formattedResultJson.push({
          Target: result.Target,
          ID: vulnerability.VulnerabilityID,
          Library: vulnerability.PkgName,
          Vulnerability: vulnerability.VulnerabilityID,
          NVD_V2Score: NVD_V2Score,
          NVD_V3Score: NVD_V3Score,
          Severity: vulnerability.Severity,
          InstalledVersion: vulnerability.InstalledVersion,
          FixedVersion: vulnerability.FixedVersion,
          Title: vulnerability.Title,
          IsVulnerability: true,
        } as NormalizedResultForDataTable);
      });
    }
  });

  return formattedResultJson;
}

export function getSupplyChainSBOM(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getSupplyChainSBOMForaReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getSupplyChainSBOMForaReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.packages) {
    return mapSBOMResults(results);
  }

  return [];
}

function mapSBOMResults(results: CommonScanResult): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results.packages) {
    results.packages.forEach((result) => {
      formattedResultJson.push({
        DocSPDXID: results.SPDXID,
        DataLicense: results.dataLicense,
        DocumentNamespace: results.documentNamespace,
        DocName: results.name,
        Created: results.creationInfo.created,
        Creators: results.creationInfo.creators,
        SpdxVersion: results.spdxVersion,
        SPDXID: result.SPDXID,
        FilesAnalyzed: result.filesAnalyzed ? "true" : "false",
        LicenseConcluded: result.licenseConcluded,
        LicenseDeclared: result.licenseDeclared,
        Name: result.name,
        VersionInfo: result.versionInfo,
      } as NormalizedResultForDataTable);
    });
  }

  return formattedResultJson;
}

export function getMisconfigurationSummary(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getMisconfigurationSummaryFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getMisconfigurationSummaryFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Resources) {
    // k8s cluster format
    return misconfigurationSummaryForK8s(results.Resources);
  }

  if (results.Findings) {
    // k8s cluster summary format
    return misconfigurationSummaryForK8s(results.Findings);
  }

  return [];
}

export function getMisconfigurations(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getMisconfigurationsFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getMisconfigurationsFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Results) {
    return mapMisconfigurationResults(results.Results);
  }

  if (results.Misconfigurations) {
    // k8s default format
    return misconfigurationsForK8s(results.Misconfigurations);
  }

  if (results.Resources) {
    // k8s cluster format
    return misconfigurationsForK8s(results.Resources);
  }

  if (results.Findings) {
    // k8s cluster summary format
    return misconfigurationsForK8s(results.Findings);
  }

  return [];
}

export function getK8sClusterSummaryForInfraAssessment(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getK8sClusterSummaryForInfraAssessmentFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getK8sClusterSummaryForInfraAssessmentFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Resources) {
    // k8s cluster format
    return k8sClusterSummary(results.Resources).filter((row) => row.isNotRBACAssessment());
  }

  if (results.Findings) {
    // k8s cluster summary format
    return k8sClusterSummary(results.Findings).filter((row) => row.isNotRBACAssessment());
  }

  return [];
}

export function getK8sClusterSummaryForRBACAssessment(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getK8sClusterSummaryForRBACAssessmentFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getK8sClusterSummaryForRBACAssessmentFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Resources) {
    // k8s cluster format
    return k8sClusterSummary(results.Resources).filter((row) => row.isRBACAssessment());
  }

  if (results.Findings) {
    // k8s cluster summary format
    return k8sClusterSummary(results.Findings).filter((row) => row.isRBACAssessment());
  }

  return [];
}

function k8sClusterSummary(findingsOrResources: Holder[]): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (findingsOrResources) {
    findingsOrResources.forEach((holder) => (formattedResultJson = formattedResultJson.concat(mapK8sClusterFindings(holder))));
  }
  return formattedResultJson;
}

function mapK8sClusterFindings(resultsHolder: Holder): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];
  const targets = new Map();

  if (resultsHolder.Results) {
    resultsHolder.Results.forEach((result) => {
      var target = targets.get(result.Target);
      if (!target) {
        target = new NormalizedResultForDataTable(result.Target, result.Type, resultsHolder.Kind, resultsHolder.Namespace);
      }

      if (result.Vulnerabilities) {
        result.Vulnerabilities.forEach((vulnerability) => {
          target.VulnerabilitiesSummary.addSeverity(vulnerability.Severity);
        });
      }

      if (result.Misconfigurations) {
        result.Misconfigurations.forEach((misconfiguration) => {
          target.MisconfigurationsSummary.addSeverity(misconfiguration.Severity);
        });
      }

      if (result.Secrets) {
        result.Secrets.forEach((secret) => {
          target.SecretsSummary.addSeverity(secret.Severity);
        });
      }

      targets.set(result.Target, target);
    });

    targets.forEach((target) => {
      if (target.isNotEmptyForK8sSummary()) {
        formattedResultJson.push(target);
      }
    });
  }

  return formattedResultJson;
}

function misconfigurationSummaryForK8s(misconfigurationHolders: Holder[]): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (misconfigurationHolders === undefined) {
    return formattedResultJson;
  }

  misconfigurationHolders.forEach((holder) => {
    formattedResultJson = formattedResultJson.concat(mapMisconfigurationSummaryResults(holder.Results));
  });

  return formattedResultJson;
}

function misconfigurationsForK8s(misconfigurationHolders: Holder[]): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (misconfigurationHolders === undefined) {
    return formattedResultJson;
  }

  misconfigurationHolders.forEach((holder) => {
    formattedResultJson = formattedResultJson.concat(mapMisconfigurationResults(holder.Results));
  });

  return formattedResultJson;
}

function mapMisconfigurationResults(results: CommonResult[]): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results) {
    results.forEach((result) => {
      if (result.Misconfigurations) {
        result.Misconfigurations.forEach((misconfiguration) => {
          formattedResultJson.push({
            Target: result.Target,
            ID: misconfiguration.ID,
            Severity: misconfiguration.Severity,
            Title: misconfiguration.Title,
            Type: misconfiguration.Type,
            Message: misconfiguration.Message,
          } as NormalizedResultForDataTable);
        });
      }
    });
  }

  return formattedResultJson;
}

function mapMisconfigurationSummaryResults(results: CommonResult[]): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results) {
    results.forEach((result) => {
      if (result.MisconfSummary) {
        formattedResultJson.push({
          Target: result.Target,
          Type: result.Type,
          Class: result.Class,
          Successes: result.MisconfSummary.Successes,
          Failures: result.MisconfSummary.Failures,
          Exceptions: result.MisconfSummary.Exceptions,
        } as NormalizedResultForDataTable);
      }
    });
  }

  return formattedResultJson;
}
