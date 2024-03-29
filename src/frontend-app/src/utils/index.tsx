
import { NormalizedResultForDataTable } from "../types";
import { CommonResult, Holder } from "../types/external/defaultResult";

export function getVulnerabilities(
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

  return []; 
}

export function vulnerabilitiesForK8s(
    vulnerabilityHolders: Holder[]
  ): NormalizedResultForDataTable[] {
    let formattedResultJson: NormalizedResultForDataTable[] = [];
    vulnerabilityHolders.forEach((vulnerabilityHolder) => {
    formattedResultJson = formattedResultJson.concat(mapVulnerabilityResults(vulnerabilityHolder.Results));
  });

  return formattedResultJson;

}

export function mapVulnerabilityResults(
  results: CommonResult[]
): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];

  results.forEach(result => {
    const target = result.Target;

    if (result.Vulnerabilities) {
      result.Vulnerabilities.forEach(vulnerability => {
        formattedResultJson.push({
          Target: target,
          ID: vulnerability.VulnerabilityID,
          Library: vulnerability.PkgName,
          Vulnerability: vulnerability.VulnerabilityID,
          Severity: vulnerability.Severity,
          InstalledVersion: vulnerability.InstalledVersion,
          FixedVersion: vulnerability.FixedVersion,
          Title: vulnerability.Title,
          Type: "",
          Message: "",
          IsVulnerability: true
        });
      });
    }
  });

  return formattedResultJson;
}

export function getMisconfigurations(
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

  return [];
}

function misconfigurationsForK8s(
  misconfigurationHolders: Holder[]
): NormalizedResultForDataTable[] {
  
  let formattedResultJson: NormalizedResultForDataTable[] = [];
  misconfigurationHolders.forEach((holder) => {
    formattedResultJson = formattedResultJson.concat(mapMisconfigurationResults(holder.Results));
  });
  
  return formattedResultJson;
}

function mapMisconfigurationResults(
  results: CommonResult[]
): NormalizedResultForDataTable[] {
  const formattedResultJson: NormalizedResultForDataTable[] = [];
  if (results) {
      results.forEach((result) => {
          const target = result.Target;
          if (result.Misconfigurations) {
              result.Misconfigurations.forEach((misconfiguration) => {
                formattedResultJson.push({
                  Target: target,
                  ID: misconfiguration.ID,
                  Library: "",
                  Vulnerability: "",
                  Severity: misconfiguration.Severity,
                  InstalledVersion: "",
                  FixedVersion: "",
                  Title: misconfiguration.Title,
                  Type: misconfiguration.Type,
                  Message: misconfiguration.Message,
                  IsVulnerability: false
                });
              });
          }
      });
  }

  return formattedResultJson;

}