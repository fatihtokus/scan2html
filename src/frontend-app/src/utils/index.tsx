import { NormalizedResultForDataTable } from "../types";
import { CisaExploit } from "../types/external/cisaExploit";
import { isASeverity } from '../components/shared/SeverityTag';
import { CommonScanResult, CommonResult, Holder } from "../types/external/defaultResult";

export function removeDuplicateResults(results: NormalizedResultForDataTable[])
: NormalizedResultForDataTable[] {
  const uniqueResults = results.filter((result, index, self) =>
    index === self.findIndex((v) => (
      v.ID === result.ID
    ))
  );
  return uniqueResults;
};

export function getVulnerabilities(results: any[] //CommonScanResult[]
  , epssData: any[], knownExloitedVulnerabilitiesData: CisaExploit[]
): NormalizedResultForDataTable[] {
  if (results === undefined) {
    return [];
  }

  let formattedResultJson: NormalizedResultForDataTable[] = [];
  results.forEach((result) => {
    let tempResult = getVulnerabilitiesFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  if (epssData.length > 0) {
    formattedResultJson = enrichWithEPSSCores(formattedResultJson, epssData);
  }

  if (knownExloitedVulnerabilitiesData.length > 0 && knownExloitedVulnerabilitiesData[0].count > 0) {  
    formattedResultJson = enrichWithExploits(formattedResultJson, knownExloitedVulnerabilitiesData[0]);
  }
    
  return formattedResultJson;
}

function enrichWithEPSSCores(vulnerabilities: NormalizedResultForDataTable[], epssData: any[]
): NormalizedResultForDataTable[] {
  vulnerabilities.forEach(vulnerability => {
    let EPSS_Score = epssData.filter(epssPerVulnerability =>  epssPerVulnerability.cve === vulnerability.ID)[0];
    if (EPSS_Score) {
      vulnerability.EPSS_Score = parseFloat((EPSS_Score.epss * 100).toFixed(2));
    }
  });

  return vulnerabilities;
}

function enrichWithExploits(vulnerabilities: NormalizedResultForDataTable[], knownExloitedVulnerabilitiesData: CisaExploit
): NormalizedResultForDataTable[] {
  vulnerabilities.forEach(vulnerability => {
    let isExploited = knownExloitedVulnerabilitiesData.vulnerabilities.filter(exploitPerVulnerability =>  exploitPerVulnerability.cveID === vulnerability.ID)[0];
    if (isExploited) {
      vulnerability.Exploits = "CISA";
    }
  });

  return vulnerabilities;
}

function getVulnerabilitiesFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Results) {
     var formattedResultJson =  mapVulnerabilityResults(results.Results);
      formattedResultJson.forEach((result) => {
        result.ArtifactName =  results.ArtifactName;   
      });
      return formattedResultJson;
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

export function getLicenses(results: any[] //CommonScanResult[]
): NormalizedResultForDataTable[] {
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    let tempResult = getLicensesFromAReport(result);
    if (tempResult.length > 0) {
      formattedResultJson = formattedResultJson.concat(tempResult);
    }      
  });

  return formattedResultJson;
}

function getLicensesFromAReport(
  results: any //CommonScanResult
): NormalizedResultForDataTable[] {
  if (results.Results) {
    return mapLicenseResults(results.Results);
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

export function filterResultByKeyword(results: NormalizedResultForDataTable[], keyword: string): NormalizedResultForDataTable[] {
  console.info("Filtering by keyword: " + keyword);

  if (keyword === 'negligible' || keyword === 'unknown') {
    return results.filter(item => item.Severity?.toLowerCase() === 'negligible' || item.Severity?.toLowerCase() === 'unknown');
  }

  if (isASeverity(keyword)) {
    console.info("Filtering by severity keyword ");
    return results.filter(item => item.Severity?.toLowerCase() === keyword);
  }

  if (keyword === 'hasExploit') {
    return results.filter(item => item.Exploits);
  }

  if (keyword === 'hasFix') {
    return results.filter(item => item.FixedVersion);
  }

  if (keyword === 'hasNoFix') {
    return results.filter(item => !item.FixedVersion);
  }

  // keyword = all
  return results;
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
      result.Secrets.forEach((secret) => {
        formattedResultJson.push({
          key: Math.random(),
          Target: result.Target,
          ID: secret.RuleID,
          Title: secret.Title,
          Category: secret.Category,
          Severity: secret.Severity,
          StartLine: "" + secret.StartLine,
          EndLine: "" + secret.EndLine,
          Code: secret.Code,
        } as NormalizedResultForDataTable);
      });
    }
  });

  return formattedResultJson;
}

function mapLicenseResults(results: CommonResult[]): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results === undefined) {
    return formattedResultJson;
  }

  results.forEach((result) => {
    if (result.Licenses) {
      result.Licenses.forEach((license) => {
        formattedResultJson.push({
          key: Math.random(),
          ID: "" + Math.random(), // There is no unique ID for licenses
          Target: result.Target,
          Category: license.Category,
          Severity: license.Severity,
          PkgName: license.PkgName,
          FilePath: license.FilePath,
          Name: license.Name,
          Text: license.Text,
          Confidence: "" + license.Confidence,
          Link: license.Link,
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
       
        let NVD_V2Score = undefined;
        let NVD_V3Score = undefined;

        if (vulnerability?.CVSS) {
          for (const [_, data] of Object.entries(vulnerability.CVSS)) {
            if (typeof data?.V2Score === 'number') {
              const v2Score = parseFloat(data.V2Score.toString());
              if (NVD_V2Score === undefined || v2Score > NVD_V2Score) {
                NVD_V2Score = v2Score;
              }
            }

            if (typeof data?.V3Score === 'number') {
              const v3Score = parseFloat(data.V3Score.toString());
              if (NVD_V3Score === undefined || v3Score > NVD_V3Score) {
                NVD_V3Score = v3Score;
              }
            }
          }
        }

        formattedResultJson.push({
          key: Math.random(),
          Target: result.Target,
          ID: vulnerability.VulnerabilityID,
          Library: vulnerability.PkgName,
          Vulnerability: vulnerability.VulnerabilityID,
          NVD_V2Score: NVD_V2Score,
          NVD_V3Score: NVD_V3Score,
          Severity: vulnerability.Severity,
          InstalledVersion: vulnerability.InstalledVersion,
          PkgPath: vulnerability.PkgPath,
          FixedVersion: vulnerability.FixedVersion,
          Title: vulnerability.Title,
          References: vulnerability.References,
          PublishedDate: vulnerability.PublishedDate,
          LastModifiedDate: vulnerability.LastModifiedDate,
          Description: vulnerability.Description,
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
        key: Math.random(),
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
        target = new NormalizedResultForDataTable(Math.random(), result.Target, result.Type, resultsHolder.Kind, resultsHolder.Namespace);
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
            key: Math.random(),
            Target: result.Target,
            ID: misconfiguration.ID,
            Severity: misconfiguration.Severity,
            Title: misconfiguration.Title,
            Type: misconfiguration.Type,
            Message: misconfiguration.Message,
            References: misconfiguration.References,
            Description: misconfiguration.Description,
            Resource: misconfiguration.CauseMetadata.Resource,
            Code: misconfiguration.CauseMetadata.Code,
            StartLine: "" + misconfiguration.CauseMetadata.StartLine,
            EndLine: "" + misconfiguration.CauseMetadata.EndLine
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
          key: Math.random(),
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
