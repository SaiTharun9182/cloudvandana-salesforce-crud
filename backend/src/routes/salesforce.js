const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/test", async (req, res) => {
    try {
        const salesforce = req.session.salesforce;

        if (!salesforce || !salesforce.accessToken) {
            return res.status(401).json({
                error: "Not authenticated with Salesforce"
            });
        }

        const response = await axios.get(
            `${salesforce.instanceUrl}/services/data/`,
            {
                headers: {
                    Authorization: `Bearer ${salesforce.accessToken}`
                }
            }
        );

        res.json({
            message: "Salesforce API connection successful",
            apiVersions: response.data
        });

    } catch (error) {
        console.error(
            "Salesforce API error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Salesforce API request failed",
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;