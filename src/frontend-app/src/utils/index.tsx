import { NormalizedResultForDataTable } from '../types';
import { CommonScanResult, CommonResult, Holder } from '../types/external/defaultResult';

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

    if (results.Findings) {
        // k8s cluster summary format
        return vulnerabilitiesForK8s(results.Findings);
    }

    return [];
}

export function localeCompare(argument1: any, argument2: any) {
    return argument1 && argument2 ? argument1.localeCompare(argument2) : 0;
}

export function vulnerabilitiesForK8s(vulnerabilityHolders: Holder[]): NormalizedResultForDataTable[] {
    let formattedResultJson: NormalizedResultForDataTable[] = [];
    vulnerabilityHolders.forEach((vulnerabilityHolder) => {
        formattedResultJson = formattedResultJson.concat(mapVulnerabilityResults(vulnerabilityHolder.Results));
    });

    return formattedResultJson;
}

export function mapVulnerabilityResults(results: CommonResult[]): NormalizedResultForDataTable[] {
    const formattedResultJson: NormalizedResultForDataTable[] = [];

    results.forEach((result) => {
        if (result.Vulnerabilities) {
            result.Vulnerabilities.forEach((vulnerability) => {
                formattedResultJson.push({
                    Target: result.Target,
                    ID: vulnerability.VulnerabilityID,
                    Library: vulnerability.PkgName,
                    Vulnerability: vulnerability.VulnerabilityID,
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

export function getSupplyChainSBOM(
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
                FilesAnalyzed: result.filesAnalyzed ? 'true' : 'false',
                LicenseConcluded: result.licenseConcluded,
                LicenseDeclared: result.licenseDeclared,
                Name: result.name,
                VersionInfo: result.versionInfo,
            } as NormalizedResultForDataTable);
        });
    }

    return formattedResultJson;
}

export function getMisconfigurationSummary(
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

    if (results.Findings) {
        // k8s cluster summary format
        return misconfigurationsForK8s(results.Findings);
    }

    return [];
}

export function getK8sClusterSummaryForInfraAssessment(
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

export function getK8sClusterSummaryForRBACAssessment(
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
    misconfigurationHolders.forEach((holder) => {
        formattedResultJson = formattedResultJson.concat(mapMisconfigurationSummaryResults(holder.Results));
    });

    return formattedResultJson;
}

function misconfigurationsForK8s(misconfigurationHolders: Holder[]): NormalizedResultForDataTable[] {
    let formattedResultJson: NormalizedResultForDataTable[] = [];
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
