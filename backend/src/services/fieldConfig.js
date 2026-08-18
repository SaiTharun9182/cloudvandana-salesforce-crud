const FIELD_CONFIG = {
    Account: [
        "Name",
        "Type",
        "Phone",
        "Website",
        "Industry",
        "BillingCity",
        "BillingCountry"
    ],

    Opportunity: [
        "Name",
        "Amount",
        "StageName",
        "CloseDate",
        "Probability",
        "Type"
    ],

    Lead: [
        "FirstName",
        "LastName",
        "Company",
        "Email",
        "Phone",
        "Status",
        "LeadSource"
    ],

    Contact: [
        "FirstName",
        "LastName",
        "Email",
        "Phone",
        "Title",
        "Department"
    ],

    Case: [
        "Subject",
        "Status",
        "Priority",
        "Origin",
        "Type",
        "Description"
    ]
};

function getConfiguredFields(objectName) {
    return FIELD_CONFIG[objectName] || [];
}

module.exports = {
    FIELD_CONFIG,
    getConfiguredFields
};