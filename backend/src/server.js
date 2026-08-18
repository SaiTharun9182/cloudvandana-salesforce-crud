const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const salesforceRoutes = require("./routes/salesforce");
const recordsRoutes = require("./routes/records");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
    }
}));

app.get("/", (req, res) => {
    res.json({
        message: "CloudVandana Salesforce CRUD API is running"
    });
});

app.use("/auth", authRoutes);
app.use("/api/salesforce", salesforceRoutes);
app.use("/api/records", recordsRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});