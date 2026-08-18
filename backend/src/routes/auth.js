const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

function base64UrlEncode(buffer) {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// Step 1: Start Salesforce OAuth login
router.get("/login", (req, res) => {
    const state = base64UrlEncode(crypto.randomBytes(32));

    // PKCE code verifier
    const codeVerifier = base64UrlEncode(crypto.randomBytes(64));

    // PKCE code challenge
    const codeChallenge = base64UrlEncode(
        crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest()
    );

    // Save these for the callback
    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SALESFORCE_CLIENT_ID,
        redirect_uri: process.env.SALESFORCE_CALLBACK_URL,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
    });

    const authorizationUrl =
        `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;

    res.redirect(authorizationUrl);
});

router.get("/status", (req, res) => {
    if (req.session.salesforce?.accessToken) {
        return res.json({
            authenticated: true
        });
    }

    res.json({
        authenticated: false
    });
});

// Step 2: Salesforce redirects here after authorization
router.get("/callback", async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).json({
                error: "Authorization code was not received from Salesforce"
            });
        }

        // Verify OAuth state
        if (!state || state !== req.session.oauthState) {
            return res.status(400).json({
                error: "Invalid OAuth state"
            });
        }

        const codeVerifier = req.session.codeVerifier;

        if (!codeVerifier) {
            return res.status(400).json({
                error: "PKCE code verifier is missing"
            });
        }

        // Exchange authorization code for Salesforce tokens
        const tokenResponse = await axios.post(
            `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
            new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                client_id: process.env.SALESFORCE_CLIENT_ID,
                client_secret: process.env.SALESFORCE_CLIENT_SECRET,
                redirect_uri: process.env.SALESFORCE_CALLBACK_URL,
                code_verifier: codeVerifier
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const tokenData = tokenResponse.data;

        // Store tokens in the server-side session
        req.session.salesforce = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            instanceUrl: tokenData.instance_url,
            issuedAt: tokenData.issued_at,
            signature: tokenData.signature
        };

        // Remove temporary OAuth values
        delete req.session.oauthState;
        delete req.session.codeVerifier;

        res.redirect("http://localhost:5173/");

    } catch (error) {
        console.error(
            "Salesforce OAuth callback error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Salesforce OAuth authentication failed",
            details: error.response?.data || error.message
        });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                error: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.redirect("http://localhost:5173/");
    });
});

module.exports = router;