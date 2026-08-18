const express = require("express");
const {
    getRecords,
    getRecordCount,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    getObjectMetadata
} = require("../services/salesforceService");

const router = express.Router();

const ALLOWED_OBJECTS = [
    "Account",
    "Opportunity",
    "Lead",
    "Contact",
    "Case"
];

function validateObject(objectName) {
    return ALLOWED_OBJECTS.includes(objectName);
}

router.get("/metadata/:object", async (req, res) => {
    try {
        const { object } = req.params;

        if (!validateObject(object)) {
            return res.status(400).json({
                error: "Invalid Salesforce object"
            });
        }

        const metadata = await getObjectMetadata(
            req.session,
            object
        );

        const fields = metadata.fields
            .filter(field => !field.deprecatedAndHidden)
            .map(field => ({
                name: field.name,
                label: field.label,
                type: field.type,
                createable: field.createable,
                updateable: field.updateable,
                nillable: field.nillable,
                length: field.length,
                picklistValues: field.picklistValues
                    ?.filter(value => value.active)
                    .map(value => ({
                        label: value.label,
                        value: value.value
                    })) || []
            }));

        res.json({
            object: metadata.name,
            label: metadata.label,
            fields
        });

    } catch (error) {
        console.error(
            "Metadata error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to fetch object metadata",
            details: error.response?.data || error.message
        });
    }
});

// GET records with real total count
router.get("/:object", async (req, res) => {
    try {
        const { object } = req.params;

        if (!validateObject(object)) {
            return res.status(400).json({
                error: "Invalid Salesforce object"
            });
        }

        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 20, 1),
            20
        );

        const offset = Math.max(
            parseInt(req.query.offset) || 0,
            0
        );

        const [data, totalSize] = await Promise.all([
            getRecords(
                req.session,
                object,
                limit,
                offset
            ),
            getRecordCount(
                req.session,
                object
            )
        ]);

        const loadedCount = offset + data.records.length;

        res.json({
            object: data.object,
            fields: data.fields,
            records: data.records,
            totalSize: totalSize,
            offset: offset,
            limit: limit,
            hasMore: loadedCount < totalSize,
            done: loadedCount >= totalSize
        });

    } catch (error) {
        console.error(
            "GET records error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to fetch records",
            details: error.response?.data || error.message
        });
    }
});

// GET single record
router.get("/:object/:id", async (req, res) => {
    try {
        const { object, id } = req.params;

        if (!validateObject(object)) {
            return res.status(400).json({
                error: "Invalid Salesforce object"
            });
        }

        const data = await getRecord(
            req.session,
            object,
            id
        );

        res.json(data);

    } catch (error) {
        console.error(
            "GET single record error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to fetch record",
            details: error.response?.data || error.message
        });
    }
});

// CREATE record
router.post("/:object", async (req, res) => {
    try {
        const { object } = req.params;

        if (!validateObject(object)) {
            return res.status(400).json({
                error: "Invalid Salesforce object"
            });
        }

        const data = await createRecord(
            req.session,
            object,
            req.body
        );

        res.status(201).json(data);

    } catch (error) {
        console.error(
            "CREATE record error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to create record",
            details: error.response?.data || error.message
        });
    }
});

// UPDATE record
router.put("/:object/:id", async (req, res) => {
    try {
        const { object, id } = req.params;

        if (!validateObject(object)) {
            return res.status(400).json({
                error: "Invalid Salesforce object"
            });
        }

        const data = await updateRecord(
            req.session,
            object,
            id,
            req.body
        );

        res.json(data);

    } catch (error) {
        console.error(
            "UPDATE record error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to update record",
            details: error.response?.data || error.message
        });
    }
});

// DELETE record
router.delete("/:object/:id", async (req, res) => {
    try {
        const { object, id } = req.params;

        if (!validateObject(object)) {
            return res.status(400).json({
                error: "Invalid Salesforce object"
            });
        }

        const data = await deleteRecord(
            req.session,
            object,
            id
        );

        res.json(data);

    } catch (error) {
        console.error(
            "DELETE record error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to delete record",
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;