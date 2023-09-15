var auditingSectionSelector = "._auditingSection";

function auditingSection() {
    return document.querySelector(auditingSectionSelector);
}

function resetVisibilityOfAuditingSection(auditingEnabled) {
    auditingSection().style.display =  auditingEnabled === '1' ? '' : 'none';
}