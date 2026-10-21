# Architecture
- Vendor bank changes use private Cloud storage and authenticated database requests; only the Accounts-role review function may atomically update the bank master, preserving the approval boundary.
- Existing procurement sample data remains in AppContext; persisted bank masters overlay vendor bank fields after sign-in without migrating unrelated workflows.