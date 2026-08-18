const axios = require("axios");
const { getConfiguredFields } = require("./fieldConfig");

function getSalesforceConfig(session) {
    if (!session?.salesforce?.accessToken) {
        throw new Error("Not authenticated with Salesforce");
    }

    return {
        accessToken: session.salesforce.accessToken,
        instanceUrl: session.salesforce.instanceUrl,
        apiVersion: process.env.SALESFORCE_API_VERSION
    };
}

function getHeaders(accessToken) {
    return {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
}

async function getRecords(session, objectName, limit = 20, offset = 0) {
    const config = getSalesforceConfig(session);

    const fields = getConfiguredFields(objectName);

    if (fields.length < 5 || fields.length > 10) {
        throw new Error(
            `Invalid field configuration for ${objectName}`
        );
    }

    const query = `
        SELECT Id, ${fields.join(", ")}
        FROM ${objectName}
        ORDER BY CreatedDate DESC
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    const url =
        `${config.instanceUrl}/services/data/${config.apiVersion}/query`;

    const response = await axios.get(url, {
        headers: getHeaders(config.accessToken),
        params: {
            q: query
        }
    });

    return {
        object: objectName,
        fields,
        records: response.data.records,
        totalSize: response.data.totalSize,
        done: response.data.done
    };
}

async function getRecordCount(session, objectName) {
    const config = getSalesforceConfig(session);

    const query = `
        SELECT COUNT()
        FROM ${objectName}
    `;

    const url =
        `${config.instanceUrl}/services/data/${config.apiVersion}/query`;

    const response = await axios.get(url, {
        headers: getHeaders(config.accessToken),
        params: {
            q: query
        }
    });

    return response.data.totalSize;
}

async function createRecord(session, objectName, data) {
    const config = getSalesforceConfig(session);

    const url =
        `${config.instanceUrl}/services/data/${config.apiVersion}/sobjects/${objectName}`;

    const response = await axios.post(
        url,
        data,
        {
            headers: getHeaders(config.accessToken)
        }
    );

    return response.data;
}

async function updateRecord(session, objectName, recordId, data) {
    const config = getSalesforceConfig(session);

    const url =
        `${config.instanceUrl}/services/data/${config.apiVersion}/sobjects/${objectName}/${recordId}`;

    await axios.patch(
        url,
        data,
        {
            headers: getHeaders(config.accessToken)
        }
    );

    return {
        success: true,
        id: recordId
    };
}

async function deleteRecord(session, objectName, recordId) {
    const config = getSalesforceConfig(session);

    const url =
        `${config.instanceUrl}/services/data/${config.apiVersion}/sobjects/${objectName}/${recordId}`;

    await axios.delete(url, {
        headers: getHeaders(config.accessToken)
    });

    return {
        success: true,
        id: recordId
    };
}

async function getRecord(session, objectName, recordId) {
    const config = getSalesforceConfig(session);

    const url =
        `${config.instanceUrl}/services/data/${config.apiVersion}/sobjects/${objectName}/${recordId}`;

    const response = await axios.get(url, {
        headers: getHeaders(config.accessToken)
    });

    return response.data;
}

async function getObjectMetadata(session, objectName) {
    const config = getSalesforceConfig(session);

    const url =
        `${config.instanceUrl}/services/data/${config.apiVersion}/sobjects/${objectName}/describe`;

    const response = await axios.get(url, {
        headers: getHeaders(config.accessToken)
    });

    return response.data;
}

module.exports = {
    getRecords,
    getRecordCount,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    getObjectMetadata
};