// function mapVulnerabilityResults(results) {
//   var formattedResultJson = [];
//   results.forEach(result => {
//     var target = result.Target;
//     if (result.Vulnerabilities) {
//       result.Vulnerabilities.forEach(vulnerability => {
//         formattedResultJson.push({
//           Target: target,
//           Library: vulnerability.PkgName,
//           Vulnerability: vulnerability.VulnerabilityID,
//           Severity: vulnerability.Severity,
//           InstalledVersion: vulnerability.InstalledVersion,
//           FixedVersion: vulnerability.FixedVersion,
//           Title: vulnerability.Title,
//         });
//       });
//     }
//   });

//   return formattedResultJson;
// }

interface VulnerabilityResult {
  Target: string;
  Vulnerabilities: Vulnerability[];
}

interface Vulnerability {
  PkgName: string;
  VulnerabilityID: string;
  Severity: string;
  InstalledVersion: string;
  FixedVersion: string;
  Title: string;
}

interface FormattedResult {
  Target: string;
  Library: string;
  Vulnerability: string;
  Severity: string;
  InstalledVersion: string;
  FixedVersion: string;
  Title: string;
}

export function mapVulnerabilityResults(
  results: VulnerabilityResult[]
): FormattedResult[] {
  const formattedResultJson: FormattedResult[] = [];

  results.forEach(result => {
    const target = result.Target;

    if (result.Vulnerabilities) {
      result.Vulnerabilities.forEach(vulnerability => {
        formattedResultJson.push({
          Target: target,
          Library: vulnerability.PkgName,
          Vulnerability: vulnerability.VulnerabilityID,
          Severity: vulnerability.Severity,
          InstalledVersion: vulnerability.InstalledVersion,
          FixedVersion: vulnerability.FixedVersion,
          Title: vulnerability.Title,
        });
      });
    }
  });

  return formattedResultJson;
}
