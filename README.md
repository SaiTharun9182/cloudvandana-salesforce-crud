# CloudVandana Salesforce CRUD

A full-stack web application that connects to Salesforce using OAuth 2.0 and allows users to perform CRUD operations on Salesforce standard objects through a custom web interface.

## Live Application

**Frontend:**  
https://cloudvandana-salesforce-crud-fe.onrender.com

## GitHub Repository

https://github.com/SaiTharun9182/cloudvandana-salesforce-crud

## Overview

This project was developed as part of the CloudVandana Associate Software Engineer assignment.

The application provides a custom React-based interface for managing Salesforce standard objects without using the native Salesforce interface.

Users can authenticate using Salesforce OAuth 2.0 and perform Create, Read, Update, and Delete operations on the following Salesforce standard objects:

- Account
- Opportunity
- Lead
- Contact
- Case

The application also implements dynamic Salesforce metadata-based forms and pagination with 20 records loaded at a time.

## Features

### Salesforce Authentication

- Login with Salesforce
- OAuth 2.0 authentication
- External Client App integration
- OAuth Authorization Code flow
- PKCE support
- Server-side session management

### Salesforce Objects

- Account
- Opportunity
- Lead
- Contact
- Case

### CRUD Operations

For each supported object:

- Create record
- View record
- Edit record
- Delete record

### Dynamic Fields

The application retrieves Salesforce object metadata and dynamically handles the configured fields.

Supported field types include:

- Text
- Number
- Date
- Date-time
- Picklist
- Required and optional fields

### Pagination

The application loads a maximum of 20 records at a time.

When the user reaches the bottom of the page, the next 20 records are automatically loaded.

Example:
```text
Showing 20 of 31 records
After scrolling to the bottom:
Showing 31 of 31 records

Technology Stack

Frontend
React
Vite
JavaScript
Axios
CSS


Backend
Node.js
Express.js
Axios
Express Session
CORS
Dotenv


Salesforce
Salesforce Developer Org
Salesforce External Client App
OAuth 2.0
PKCE
Salesforce REST API
Salesforce Object Metadata API


Deployment
GitHub
Render



Project Structure


cloudvandana-salesforce-crud/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── records.js
│   │   │   └── salesforce.js
│   │   │
│   │   ├── services/
│   │   │   ├── fieldConfig.js
│   │   │   └── salesforceService.js
│   │   │
│   │   └── server.js
│   │
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── README.md


Prerequisites

Install:
Node.js
npm
Git
Salesforce Developer Org
Salesforce External Client App


Check Node.js:
node -v

Check npm:
npm -v


Salesforce Configuration

Create a Salesforce Developer Org:
https://developer.salesforce.com/signup
Create a Salesforce External Client App and configure OAuth 2.0.


Local OAuth Callback
http://localhost:5000/auth/callback

Production OAuth Callback
https://cloudvandana-salesforce-crud-fe.onrender.com/auth/callback

The callback URL configured in Salesforce must exactly match the callback URL used by the application.

Backend Setup
Open a terminal in the project root:


cd backend

Install dependencies:
npm install

Create:
backend/.env

Add:
SALESFORCE_CLIENT_ID=YOUR_SALESFORCE_CLIENT_ID
SALESFORCE_CLIENT_SECRET=YOUR_SALESFORCE_CLIENT_SECRET
SALESFORCE_CALLBACK_URL=http://localhost:5000/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SESSION_SECRET=YOUR_RANDOM_LONG_SESSION_SECRET
SALESFORCE_API_VERSION=v67.0
FRONTEND_URL=http://localhost:5173

Do not commit .env to GitHub.

Start Backend

Development:
npm run dev

Production:
npm start

Local backend:
http://localhost:5000

Backend Health Check

Open:
http://localhost:5000/

Expected response:

{
  "message": "CloudVandana Salesforce CRUD API is running"
}
Frontend Setup

Open a second terminal:
cd frontend

Install dependencies:
npm install

Create:
frontend/.env

Add:
VITE_API_URL=http://localhost:5000

Do not commit .env to GitHub.

Start Frontend
npm run dev

Local frontend:
http://localhost:5173


Run the Application Locally

Start the backend:
cd backend
npm run dev

In a second terminal, start the frontend:
cd frontend
npm run dev

Open:
http://localhost:5173

Click:
Login with Salesforce
Authorize the application in Salesforce.
After successful authentication, the dashboard displays the Salesforce objects.

Application Flow

React Frontend
      |
      v
Login with Salesforce
      |
      v
Node.js / Express Backend
      |
      v
Salesforce OAuth 2.0
      |
      v
Salesforce Authorization
      |
      v
OAuth Callback
      |
      v
Salesforce Access Token
      |
      v
Server-side Session
      |
      v
Salesforce CRUD Dashboard
Using the Application
Login

Click:
Login with Salesforce
Authorize the application through Salesforce.

The dashboard then displays:
Salesforce Connected
Select Object

Use the Salesforce Object dropdown:
Account
Opportunity
Lead
Contact
Case
View Records

Select an object to load its Salesforce records.

A maximum of 20 records are loaded initially.
Load More Records

Scroll to the bottom of the records section.

The next 20 records are automatically loaded when more records are available.

Create Record


Click:
+ Create Record

Enter the requested information and submit the form.

View Record
Click:
View

to display the selected record details.

Edit Record
Click:
Edit

Modify the required fields and select:

Save Changes

Delete Record
Click:
Delete

Confirm the deletion when prompted.

Supported Salesforce Objects

Account

Configured fields include:

Name
Type
Phone
Website
Industry
Billing City
Billing Country
Opportunity

Configured fields include:

Name
Amount
Stage Name
Close Date
Probability
Type
Lead

The application retrieves the configured Lead fields through Salesforce metadata.

Contact
The application retrieves the configured Contact fields through Salesforce metadata.

Case
The application retrieves the configured Case fields through Salesforce metadata.

API Endpoints
Authentication
GET /auth/login
GET /auth/callback
GET /auth/status
GET /auth/logout
Salesforce
GET /api/salesforce/test
Records
GET    /api/records/:object
GET    /api/records/:object/:id
GET    /api/records/metadata/:object
POST   /api/records/:object
PUT    /api/records/:object/:id
DELETE /api/records/:object/:id
Deployment



The application is deployed using Render.


Frontend
https://cloudvandana-salesforce-crud-fe.onrender.com

The frontend is deployed as a Render Static Site.

Backend
https://cloudvandana-salesforce-crud-lae3.onrender.com

The backend is deployed as a Render Web Service.

The frontend and backend are deployed from the same GitHub repository.

GitHub

Repository:
https://github.com/SaiTharun9182/cloudvandana-salesforce-crud

Main branch:
main

Clone the repository:

git clone https://github.com/SaiTharun9182/cloudvandana-salesforce-crud.git

Then:
cd cloudvandana-salesforce-crud
Security

Sensitive environment variables are intentionally excluded from GitHub.

The following files must not be committed:

backend/.env
frontend/.env

Environment files are ignored using .gitignore.

Salesforce Client ID and Client Secret must be supplied through environment variables.

Salesforce OAuth credentials and the corresponding Salesforce External Client App configuration are required for authentication.

Assignment Requirements Covered

This project implements:

Salesforce Developer Org integration
Salesforce External Client App
OAuth 2.0 authentication
Login with Salesforce
Account management
Opportunity management
Lead management
Contact management
Case management
Central object dropdown
Dynamic Salesforce fields
Create records
View records
Update records
Delete records
20-record pagination
Automatic loading of the next 20 records
Local development
Free online deployment
GitHub repository


Project Links

Live Application
https://cloudvandana-salesforce-crud-fe.onrender.com


GitHub Repository
https://github.com/SaiTharun9182/cloudvandana-salesforce-crud



Author
C Sai Tharun
Hyderabad, India



Email:
saitharunchandypet@gmail.com



Phone:
+91-9182885756

