var selectedReportTableSelector = '._vulnerabilityTable';

function selectedTableChanged(tableSelector) {
    selectedReportTableSelector = tableSelector;
    initTheReportDetails();
}

function selectedReportTable() {
    return selectedReportTableSelector;
}

function isVulnerabilityTableSelected() {
    return selectedReportTable() == '._vulnerabilityTable';
}

function noSelectedReportTable() {
    return isVulnerabilityTableSelected() ? '._misconfigTable' : '._vulnerabilityTable';
}


function tbody() {
    return document.querySelector(selectedReportTable() + ' tbody');
}

function thead() {
    return document.querySelector(selectedReportTable() + ' thead');
}

function initTheReportDetails() {
    initializeReportTitle();
    createTableRows();
    if (isVulnerabilityTableSelected()) {
        initializeVulnerabilityTableFilters();
    } else {
        initializeMisconfigurationTableFilters();
    }

    initSearch();
    initSort();
}

function initializeReportTitle() {

    document.title = "Trivy Report";
    if (scanner) {
        const scannerTitle = document.querySelector("._scanner");
        scannerTitle.innerHTML = " - " + scanner;
        document.title += " - " + scanner;
    }
    if (createdAt) {
        const createdTime = new Date(createdAt * 1000).toLocaleString();
        const reportTime = document.querySelector("._reportTime");
        reportTime.innerHTML = " - " + createdTime;
        document.title += " - " + createdTime;
    }

    document.querySelector("#vulnerabilityTableRadio").innerHTML = "Vulnerabilities(" + vulnerabilities().length + ")";
    document.querySelector("#misconfigTableRadio").innerHTML = "Misconfigurations(" + misconfigurations().length + ")";

}

function initializeVulnerabilityTableFilters() {
    createFilterOptions('Target');
    createFilterOptions('Library');
    createFilterOptions('Vulnerability');
    createFilterOptions('Severity');

}

function initializeMisconfigurationTableFilters() {
    createFilterOptions('Target');
    createFilterOptions('ID');
    createFilterOptions('Severity');
}

function resetTableRows(tbody) {
    while (tbody.rows.length > 0) {
        tbody.removeChild(tbody.rows[0]);
    }
}

function createTableRows() {
    document.querySelector(noSelectedReportTable()).style.display = 'none';
    document.querySelector(selectedReportTable()).style.display = '';
    resetTableRows(tbody());
    vulnerabilitiesOrMisconfigurations().forEach((result) => {
        const values = Object.values(result);
        const row = document.createElement("tr");
        row.className = 'result';

        for (const value of values) {
            const cell = document.createElement("td");
            const cellText = document.createTextNode(value);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }

        tbody().appendChild(row);
    });
}

function vulnerabilitiesOrMisconfigurations() {
    return isVulnerabilityTableSelected() ? vulnerabilities() : misconfigurations();
}

function vulnerabilities() {
    if (resultJson.Results) {
        return mapVulnerabilityResults(resultJson.Results);
    }

    // k8s format
    return vulnerabilitiesForK8s();
}

function vulnerabilitiesForK8s() {
    var formattedResultJson = [];
    resultJson.Vulnerabilities.forEach((topVulnerability) => {
        formattedResultJson = formattedResultJson.concat(mapVulnerabilityResults(topVulnerability.Results));
    });

    return formattedResultJson;

}

function mapVulnerabilityResults(results) {
    var formattedResultJson = [];
    results.forEach((result) => {
        var target = result.Target;
        if (result.Vulnerabilities) {
            result.Vulnerabilities.forEach((vulnerability) => {
                formattedResultJson.push(
                    {
                        "Target": target,
                        "Library": vulnerability.PkgName,
                        "Vulnerability": vulnerability.VulnerabilityID,
                        "Severity": vulnerability.Severity,
                        "InstalledVersion": vulnerability.InstalledVersion,
                        "FixedVersion": vulnerability.FixedVersion,
                        "Title": vulnerability.Title
                    }
                );
            });
        }
    });

    return formattedResultJson;

}

function misconfigurations() {
    if (resultJson.Results) {
        return mapMisconfigurationResults(resultJson.Results);
    }

    // k8s format
    return misconfigurationsForK8s();

}

function misconfigurationsForK8s() {
    var formattedResultJson = [];
    resultJson.Misconfigurations.forEach((topMisconfiguration) => {
        formattedResultJson = formattedResultJson.concat(mapMisconfigurationResults(topMisconfiguration.Results));
    });

    return formattedResultJson;
}

function mapMisconfigurationResults(results) {
    var formattedResultJson = [];
    if (results) {
        results.forEach((result) => {
            var target = result.Target;
            if (result.Misconfigurations) {
                result.Misconfigurations.forEach((misconfiguration) => {
                    formattedResultJson.push(
                        {
                            "Target": target,
                            "ID": misconfiguration.ID,
                            "Title": misconfiguration.Title,
                            "Severity": misconfiguration.Severity,
                            "Type": misconfiguration.Type,
                            "Message": misconfiguration.Message
                        }
                    );
                });
            }
        });
    }

    return formattedResultJson;

}

// Filter CREATION

function filterId(field) {
    return "._".concat(field.toLowerCase(), "Filter");
}

function filterDropdown(field) {
    return document.querySelector(selectedReportTable() + " " + filterId(field));;
}


function createFilterOptions(field) {
    const filter = filterDropdown(field);
    resetOptions(filter);
    var distinctValues = [...new Set(vulnerabilitiesOrMisconfigurations().map((item) => item[field]))]
    console.log(field, distinctValues);
    distinctValues.forEach((value) => {
        filter.options[filter.options.length] = new Option(value, value);
    });
}

function rowIncludesCriterias(row, criterias) {
    let result = true;
    criterias.forEach((criteria) => {
        if (row.toUpperCase().indexOf(criteria.toUpperCase().trim()) == -1) {
            result = false;
        }
    });

    return result;
}

function search(criterias) {
    let j = 0;
    results().forEach((data) => {
        thead().style.opacity = '1'
        if (rowIncludesCriterias(data.innerText, criterias)) {
            data.style.display = '';
        } else {
            data.style.display = 'none';
            j++;
            if (j === results().length) {
                thead().style.opacity = '0.2'
            }
        }
    });
}

function selectedOption(field) {
    const filter = filterDropdown(field);
    const criteria = filter.selectedOptions[0].value.trim();
    console.log(field, criteria);
    return criteria;
}

function selectedOptionsForVulnerabilities() {
    const filterTarget = selectedOption('Target');
    const filterLibrary = selectedOption('Library');
    const filterVulnerability = selectedOption('Vulnerability');
    const filterSeverity = selectedOption('Severity');


    var selectedOptions = [];
    if (filterTarget) {
        selectedOptions[selectedOptions.length] = filterTarget;
    }
    if (filterLibrary) {
        selectedOptions[selectedOptions.length] = filterLibrary;
    }

    if (filterVulnerability) {
        selectedOptions[selectedOptions.length] = filterVulnerability;
    }

    if (filterSeverity) {
        selectedOptions[selectedOptions.length] = filterSeverity;
    }
    console.log("selectedOptions: ", selectedOptions);
    return selectedOptions;
}

function selectedOptionsForMisconfigurations() {
    const filterTarget = selectedOption('Target');
    const filterId = selectedOption('ID');
    const filterSeverity = selectedOption('Severity');


    var selectedOptions = [];
    if (filterTarget) {
        selectedOptions[selectedOptions.length] = filterTarget;
    }
    if (filterId) {
        selectedOptions[selectedOptions.length] = filterId;
    }
    if (filterSeverity) {
        selectedOptions[selectedOptions.length] = filterSeverity;
    }
    console.log("selectedOptionsForMisconfigurations: ", selectedOptions);
    return selectedOptions;
}

function selectedOptions() {
    return isVulnerabilityTableSelected() ? selectedOptionsForVulnerabilities() : selectedOptionsForMisconfigurations();
}

function filterResults() {
    const criterias = selectedOptions();
    console.log("filterResults: ", criterias);
    search(criterias);
}

function results() {
    return document.querySelectorAll(selectedReportTable() + " .result");
}


function initSearch() {
    // Search
    let filterInput = document.querySelector('.filter-input');
    filterInput.addEventListener('keyup', () => {
        search([filterInput.value]);
    });
}


function initSort() {
    // SORT
    let sortDirection;
    const sorterColumns = document.querySelectorAll(selectedReportTable() + " ._sorters th");
    sorterColumns.forEach((col, idx) => {
        col.addEventListener('click', () => {
            sortDirection = !sortDirection;
            const rowsArrFromNodeList = Array.from(results());
            const filteredRows = rowsArrFromNodeList.filter(item => item.style.display != 'none');

            filteredRows.sort((a, b) => {
                return a.childNodes[idx].innerHTML.localeCompare(b.childNodes[idx].innerHTML, 'en', { numeric: true, sensitivity: 'base' });
            }).forEach((row) => {
                sortDirection ? tbody().insertBefore(row, tbody().childNodes[tbody().length]) : tbody().insertBefore(row, tbody().childNodes[0]);
            });

        });
    });
}

function auditingNotEnabled() {
    fetchReportDetailsJson(getURLParameter("resultsUrl"));
}

function fetchReportDetailsJson(resultsUrl) {
    //fetch("resultsUrl?sha=1123")
    fetch(resultsUrl + "?" + Date.now())
        .then(response => response.json())
        .then(data => {
            resultJson = data;
            initTheReportDetails();
        })
}

