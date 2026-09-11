# Ambady Tours and Travels — Test Account Credentials

Use these credentials to verify the application functionality across different roles.

## 🔑 Shared Password
All test accounts use the same password for convenience:
**`Password123`**

---

## 🛡️ Administrative Access
These accounts can access the `/admin` dashboard to manage tours and view all registrations.

| Name | Email | Role |
| :--- | :--- | :--- |
| System Admin | `admin@ambady.com` | **Admin** |

---

## 👤 Customer Access
These accounts are for testing the customer booking flow and profile reuse.

| Name | Email | Role |
| :--- | :--- | :--- |
| John Doe | `user1@example.com` | User |
| Jane Smith | `user2@example.com` | User |
| Alice Brown | `user3@example.com` | User |
| Bob White | `user4@example.com` | User |
| Charlie Green | `user5@example.com` | User |

---

## 🧪 Testing Instructions

### 1. Test Profile Reuse
- Login with `user1@example.com`.
- Go to **Account Details** and fill in the profile info.
- Register for a Tour.
- Note that when you register for a *second* tour, your details are pulled automatically from your profile.

### 2. Test Admin Panel
- Login with `admin@ambady.com`.
- Navigate to `/admin`.
- Verify you can see the **Dashboard stats**.
- Go to **Tours** to create/edit tours.
- Go to **Registrations** and click **"Export to Excel"** to verify the data download.

### 3. Test Security
- Login with `user1@example.com`.
- Try to manually navigate to `/admin`.
- Verify that the application redirects you back to the login or home page (Access Denied).
