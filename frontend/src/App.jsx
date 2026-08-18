import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const OBJECTS = [
  "Account",
  "Opportunity",
  "Lead",
  "Contact",
  "Case",
];

const PAGE_SIZE = 20;

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [selectedObject, setSelectedObject] = useState("");
  const [fields, setFields] = useState([]);
  const [records, setRecords] = useState([]);

  const [totalSize, setTotalSize] = useState(0);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loadingForm, setLoadingForm] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  const [showViewForm, setShowViewForm] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editRecordId, setEditRecordId] = useState("");
  const [editFields, setEditFields] = useState([]);
  const [editData, setEditData] = useState({});
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [updatingRecord, setUpdatingRecord] = useState(false);

  const [deletingRecordId, setDeletingRecordId] = useState("");

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.innerHeight + window.scrollY;

      const pageHeight =
        document.documentElement.scrollHeight;

      const nearBottom = pageHeight - scrollPosition < 250;

      if (
        nearBottom &&
        selectedObject &&
        !loadingRecords &&
        !loadingMore &&
        records.length < totalSize
      ) {
        loadMoreRecords();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    selectedObject,
    loadingRecords,
    loadingMore,
    records.length,
    totalSize,
  ]);

  const checkAuthentication = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/status`,
        {
          withCredentials: true,
        }
      );

      setAuthenticated(response.data.authenticated);
    } catch (error) {
      console.error(
        "Authentication check failed:",
        error
      );

      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSalesforceLogin = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const loadRecords = async (objectName) => {
    try {
      setLoadingRecords(true);
      setLoadingMore(false);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/records/${objectName}`,
        {
          params: {
            limit: PAGE_SIZE,
            offset: 0,
          },
          withCredentials: true,
        }
      );

      setFields(response.data.fields || []);
      setRecords(response.data.records || []);
      setTotalSize(response.data.totalSize || 0);
    } catch (error) {
      console.error(
        "Failed to load records:",
        error
      );

      setError(
        error.response?.data?.details ||
          error.response?.data?.error ||
          "Failed to load Salesforce records."
      );
    } finally {
      setLoadingRecords(false);
    }
  };

  const loadMoreRecords = useCallback(async () => {
    if (
      !selectedObject ||
      loadingMore ||
      loadingRecords ||
      records.length >= totalSize
    ) {
      return;
    }

    try {
      setLoadingMore(true);

      const response = await axios.get(
        `${API_URL}/api/records/${selectedObject}`,
        {
          params: {
            limit: PAGE_SIZE,
            offset: records.length,
          },
          withCredentials: true,
        }
      );

      const newRecords = response.data.records || [];

      setRecords((previousRecords) => [
        ...previousRecords,
        ...newRecords,
      ]);

      setTotalSize(response.data.totalSize || totalSize);
    } catch (error) {
      console.error(
        "Failed to load more records:",
        error
      );

      setError(
        error.response?.data?.details ||
          error.response?.data?.error ||
          "Failed to load more records."
      );
    } finally {
      setLoadingMore(false);
    }
  }, [
    selectedObject,
    loadingMore,
    loadingRecords,
    records.length,
    totalSize,
  ]);

  const handleObjectChange = async (event) => {
    const objectName = event.target.value;

    setSelectedObject(objectName);
    setFields([]);
    setRecords([]);
    setTotalSize(0);
    setError("");

    if (!objectName) {
      return;
    }

    await loadRecords(objectName);
  };

  if (checkingAuth) {
    return (
      <div className="loading-screen">
        Checking Salesforce authentication...
      </div>
    );
  }

  const openCreateForm = async () => {
  if (!selectedObject) {
    return;
  }

  try {
    setLoadingForm(true);
    setError("");

    const response = await axios.get(
      `${API_URL}/api/records/metadata/${selectedObject}`,
      {
        withCredentials: true,
      }
    );

    const configuredFieldNames = fields;

    const editableFields = response.data.fields.filter(
      (field) =>
        configuredFieldNames.includes(field.name) &&
        field.createable
    );

    setFormFields(editableFields);

    const initialData = {};

    editableFields.forEach((field) => {
      initialData[field.name] = "";
    });

    setFormData(initialData);
    setShowCreateForm(true);
  } catch (error) {
    console.error("Failed to load create form:", error);

    setError(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to load create form."
    );
  } finally {
    setLoadingForm(false);
  }
};

const handleFormChange = (fieldName, value) => {
  setFormData((previousData) => ({
    ...previousData,
    [fieldName]: value,
  }));
};

const handleCreateRecord = async (event) => {
  event.preventDefault();

  try {
    setSavingRecord(true);
    setError("");

    const payload = {};

    formFields.forEach((field) => {
      const value = formData[field.name];

      if (value !== "" && value !== null && value !== undefined) {
        payload[field.name] = value;
      }
    });

    await axios.post(
      `${API_URL}/api/records/${selectedObject}`,
      payload,
      {
        withCredentials: true,
      }
    );

    setShowCreateForm(false);
    setFormData({});

    await loadRecords(selectedObject);
  } catch (error) {
    console.error("Create record failed:", error);

    setError(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to create record."
    );
  } finally {
    setSavingRecord(false);
  }
};

const handleViewRecord = async (recordId) => {
  try {
    setLoadingView(true);
    setError("");

    const response = await axios.get(
      `${API_URL}/api/records/${selectedObject}/${recordId}`,
      {
        withCredentials: true,
      }
    );

    setViewRecord(response.data);
    setShowViewForm(true);
  } catch (error) {
    console.error("View record failed:", error);

    setError(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to load record."
    );
  } finally {
    setLoadingView(false);
  }
};

const handleEditRecord = async (recordId) => {
  try {
    setLoadingEdit(true);
    setError("");

    const [recordResponse, metadataResponse] = await Promise.all([
      axios.get(
        `${API_URL}/api/records/${selectedObject}/${recordId}`,
        {
          withCredentials: true,
        }
      ),

      axios.get(
        `${API_URL}/api/records/metadata/${selectedObject}`,
        {
          withCredentials: true,
        }
      ),
    ]);

    const configuredFieldNames = fields;

    const editableFields = metadataResponse.data.fields.filter(
      (field) =>
        configuredFieldNames.includes(field.name) &&
        field.updateable
    );

    setEditRecordId(recordId);
    setEditFields(editableFields);

    const initialData = {};

    editableFields.forEach((field) => {
      initialData[field.name] =
        recordResponse.data[field.name] ?? "";
    });

    setEditData(initialData);
    setShowEditForm(true);
  } catch (error) {
    console.error("Edit record failed:", error);

    setError(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to load record for editing."
    );
  } finally {
    setLoadingEdit(false);
  }
};

const handleEditChange = (fieldName, value) => {
  setEditData((previousData) => ({
    ...previousData,
    [fieldName]: value,
  }));
};

const handleUpdateRecord = async (event) => {
  event.preventDefault();

  try {
    setUpdatingRecord(true);
    setError("");

    const payload = {};

    editFields.forEach((field) => {
      const value = editData[field.name];

      if (
        value !== "" &&
        value !== null &&
        value !== undefined
      ) {
        payload[field.name] = value;
      }
    });

    await axios.put(
      `${API_URL}/api/records/${selectedObject}/${editRecordId}`,
      payload,
      {
        withCredentials: true,
      }
    );

    setShowEditForm(false);
    setEditData({});
    setEditRecordId("");

    await loadRecords(selectedObject);
  } catch (error) {
    console.error("Update record failed:", error);

    setError(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to update record."
    );
  } finally {
    setUpdatingRecord(false);
  }
};

const handleDeleteRecord = async (recordId, recordName) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${recordName}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingRecordId(recordId);
    setError("");

    await axios.delete(
      `${API_URL}/api/records/${selectedObject}/${recordId}`,
      {
        withCredentials: true,
      }
    );

    await loadRecords(selectedObject);
  } catch (error) {
    console.error("Delete record failed:", error);

    setError(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to delete record."
    );
  } finally {
    setDeletingRecordId("");
  }
};

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>CloudVandana Salesforce CRUD</h1>
          <p>Salesforce Standard Object Management</p>
        </div>

        {!authenticated && (
          <button
            className="login-button"
            onClick={handleSalesforceLogin}
          >
            Login with Salesforce
          </button>
        )}
      </header>

      <main className="main-content">
        {!authenticated ? (
          <section className="welcome-card">
            <h2>Welcome</h2>

            <p>
              Login with Salesforce to manage Account,
              Opportunity, Lead, Contact, and Case records.
            </p>

            <button
              className="login-button large"
              onClick={handleSalesforceLogin}
            >
              Login with Salesforce
            </button>
          </section>
        ) : (
          <section className="dashboard-card">
            <div className="dashboard-header">
              <div>
                <h2>Salesforce Records</h2>
                <p>
                  Select a Salesforce object to manage its records.
                </p>
              </div>

              <span className="logged-in">
                <svg
                  className="salesforce-logo"
                  viewBox="0 0 640 512"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M537.6 226.6C528.1 117.8 437.1 32 325.8 32c-83.5 0-155.2 50.5-186.3 122.6C64.7 160.8 0 229.7 0 312c0 88.4 71.6 160 160 160h352c70.7 0 128-57.3 128-128 0-59.8-41-110-96.4-117.4z"
                  />
                </svg>

                <span>Salesforce Connected</span>
              </span>
            </div>

            <div className="object-selector">
              <label htmlFor="salesforce-object">
                Salesforce Object
              </label>

              <select
                id="salesforce-object"
                value={selectedObject}
                onChange={handleObjectChange}
              >
                <option value="" disabled>
                  Select an object
                </option>

                {OBJECTS.map((objectName) => (
                  <option
                    key={objectName}
                    value={objectName}
                  >
                    {objectName}
                  </option>
                ))}
              </select>
            </div>

            {loadingRecords && (
              <div className="loading-message">
                Loading {selectedObject} records...
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {!loadingRecords &&
              !error &&
              selectedObject && (
                <div className="records-section">
                  <div className="records-header">
                    <div>
                      <h3>{selectedObject} Records</h3>

                      <p>
                        Showing {records.length} of{" "}
                        {totalSize} records
                      </p>
                    </div>

                      <button
                        className="create-button"
                        onClick={openCreateForm}
                        disabled={loadingForm}
                      >
                        {loadingForm ? "Loading..." : "+ Create Record"}
                      </button>
                  </div>

                  {records.length === 0 ? (
                    <div className="empty-message">
                      No {selectedObject} records found.
                    </div>
                  ) : (
                    <>
                      <div className="table-container">
                        <table className="records-table">
                          <thead>
                            <tr>
                              <th className="serial-column">
                                #
                              </th>

                              {fields.map((field) => (
                                <th key={field}>
                                  {field}
                                </th>
                              ))}

                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {records.map(
                              (record, index) => (
                                <tr key={record.Id}>
                                  <td className="serial-column">
                                    {index + 1}
                                  </td>

                                  {fields.map(
                                    (field) => (
                                      <td
                                        key={`${record.Id}-${field}`}
                                      >
                                        {record[field] ?? "-"}
                                      </td>
                                    )
                                  )}

                                  <td>
                                    <div className="action-buttons">
                                      <button
                                      className="view-button"
                                      onClick={() => handleViewRecord(record.Id)}
                                      disabled={loadingView}
                                    >
                                      View
                                    </button>

                                    <button
                                      className="edit-button"
                                      onClick={() => handleEditRecord(record.Id)}
                                      disabled={loadingEdit}
                                    >
                                      Edit
                                    </button>

                                    <button
                                      className="delete-button"
                                      onClick={() =>
                                        handleDeleteRecord(
                                          record.Id,
                                          record.Name || record.Subject || record.Id
                                        )
                                      }
                                      disabled={deletingRecordId === record.Id}
                                    >
                                      {deletingRecordId === record.Id ? "Deleting..." : "Delete"}
                                    </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>

                      {loadingMore && (
                        <div className="loading-more">
                          Loading next 20 records...
                        </div>
                      )}

                      {!loadingMore &&
                        records.length < totalSize && (
                          <div className="scroll-hint">
                            Scroll down to load the next 20
                            records.
                          </div>
                        )}

                      {!loadingMore &&
                        records.length >= totalSize && (
                          <div className="end-message">
                            All {totalSize} records loaded.
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}

              {showCreateForm && (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <div>
          <h3>Create {selectedObject}</h3>
          <p>Enter the record details below.</p>
        </div>

        <button
          className="modal-close"
          type="button"
          onClick={() => setShowCreateForm(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleCreateRecord}>
        <div className="form-grid">
          {formFields.map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={`create-${field.name}`}>
                {field.label}
                {!field.nillable && (
                  <span className="required-mark"> *</span>
                )}
              </label>

              {field.type === "picklist" ? (
                <select
                  id={`create-${field.name}`}
                  value={formData[field.name] || ""}
                  onChange={(event) =>
                    handleFormChange(
                      field.name,
                      event.target.value
                    )
                  }
                  required={!field.nillable}
                >
                  <option value="">Select...</option>

                  {field.picklistValues?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`create-${field.name}`}
                  type={
                    field.type === "date"
                      ? "date"
                      : field.type === "datetime"
                      ? "datetime-local"
                      : field.type === "double" ||
                        field.type === "currency" ||
                        field.type === "percent"
                      ? "number"
                      : "text"
                  }
                  value={formData[field.name] || ""}
                  onChange={(event) =>
                    handleFormChange(
                      field.name,
                      event.target.value
                    )
                  }
                  required={!field.nillable}
                  maxLength={
                    field.length > 0 ? field.length : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowCreateForm(false)}
            disabled={savingRecord}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={savingRecord}
          >
            {savingRecord ? "Saving..." : "Create Record"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showViewForm && viewRecord && (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <div>
          <h3>View {selectedObject}</h3>
          <p>Record details</p>
        </div>

        <button
          className="modal-close"
          type="button"
          onClick={() => {
            setShowViewForm(false);
            setViewRecord(null);
          }}
        >
          ×
        </button>
      </div>

      <div className="view-grid">
        {fields.map((field) => (
          <div className="view-group" key={field}>
            <label>{field}</label>

            <div className="view-value">
              {viewRecord[field] ?? "-"}
            </div>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={() => {
            setShowViewForm(false);
            setViewRecord(null);
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{showEditForm && (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <div>
          <h3>Edit {selectedObject}</h3>
          <p>Update the record details below.</p>
        </div>

        <button
          className="modal-close"
          type="button"
          onClick={() => setShowEditForm(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleUpdateRecord}>
        <div className="form-grid">
          {editFields.map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={`edit-${field.name}`}>
                {field.label}
                {!field.nillable && (
                  <span className="required-mark"> *</span>
                )}
              </label>

              {field.type === "picklist" ? (
                <select
                  id={`edit-${field.name}`}
                  value={editData[field.name] || ""}
                  onChange={(event) =>
                    handleEditChange(
                      field.name,
                      event.target.value
                    )
                  }
                  required={!field.nillable}
                >
                  <option value="">Select...</option>

                  {field.picklistValues?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`edit-${field.name}`}
                  type={
                    field.type === "date"
                      ? "date"
                      : field.type === "datetime"
                      ? "datetime-local"
                      : field.type === "double" ||
                        field.type === "currency" ||
                        field.type === "percent"
                      ? "number"
                      : "text"
                  }
                  value={editData[field.name] || ""}
                  onChange={(event) =>
                    handleEditChange(
                      field.name,
                      event.target.value
                    )
                  }
                  required={!field.nillable}
                  maxLength={
                    field.length > 0
                      ? field.length
                      : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowEditForm(false)}
            disabled={updatingRecord}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={updatingRecord}
          >
            {updatingRecord
              ? "Updating..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

          </section>
        )}
      </main>
    </div>
  );
}

export default App;






// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
