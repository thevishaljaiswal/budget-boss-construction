# Architecture
- Vendor bank-change screens use in-memory AppContext requests and local File attachments only; Accounts review is a UI demonstration, not an authorization or financial operation.
- Existing procurement sample data and vendor bank fields remain in AppContext; no Cloud calls are made by the frontend bank-change workflow.