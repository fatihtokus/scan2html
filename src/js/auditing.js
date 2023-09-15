var auditingFilterSelector = "._auditingFilter";

function auditingFilter() {
    return document.querySelector(auditingFilterSelector);
}

function initAuditingFilter() {
    const filter = auditingFilter();
    resetOptions(filter);

    reportsJson.Pushes
        .sort((a, b) => a.createdTime > b.createdTime ? 1 : -1)// sort descending by createdTime
        .forEach((item) => {
            const createdTime = new Date(item.Id * 1000).toLocaleString();
            filter.options[filter.options.length] = new Option("Scan report - " + createdTime + " - (" + item.Initiator + ")", item.Url);
        });

    if (filter.options.length > 1) {//Select first
        filter.options[1].selected = true;
        aScanSelected();
    }

}

function auditingEnabled() {
    fetchReportsJson(getURLParameter("auditingUrl"));
}

var reportsJson = {};
function fetchReportsJson(auditingUrl) {
    if(!auditingUrl){
        auditingUrl = "/auditing.json";
    }
    //fetch(auditingUrl + "?sha=1123")
    fetch(auditingUrl + "?" + Date.now())
        .then(response => response.json())
        .then(data => {
            reportsJson = data;
            initAuditingFilter();
        })
}

function aScanSelected() {
    const resultsUrl = auditingFilter().selectedOptions[0].value.trim();
    fetchReportDetailsJson(resultsUrl);
}