# Google Form Registration & Firebase Import Guide

This guide allows you to collect pilgrim registrations via a shareable Google Form (WhatsApp ready) and import that data directly into your Firebase database.

---

## 1. Create Your Google Form
Create a new form at [forms.google.com](https://forms.google.com) with the following **Required** fields in this exact order:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **First Name** | Short Text | |
| **Last Name** | Short Text | |
| **Email Address** | Short Text | Ensure "Email Collection" is enabled in settings |
| **Phone Number** | Short Text | 10-digit mobile number |
| **Aadhar Number** | Short Text | 12 digits |
| **Gender** | Multiple Choice | Male, Female, Other |
| **Date of Birth** | Date | |

### 🔗 How to share via WhatsApp:
1.  Click **Send** at the top right of the form.
2.  Select the **Link** icon.
3.  Check **Shorten URL**.
4.  Copy the link and paste it into your WhatsApp message.

---

## 2. Link to Google Sheets
1.  In your Google Form, go to the **Responses** tab.
2.  Click **Link to Sheets** (green icon).
3.  This will create a Google Sheet in your Drive that updates automatically with every registration.

---

## 3. Loading Data to Firebase
To load the data from your Google Sheet into your production database, I have created a specialized import script.

### Steps to Import:
1.  Open your Google Sheet.
2.  Go to **File** > **Download** > **Comma Separated Values (.csv)**.
3.  Save the file as `registrations.csv` in your project root.
4.  Run the following command in your terminal:
    ```bash
    npm run db:import
    ```

---

## 4. The Import Script
I have created the import script at `shared/src/scripts/import-registrations.cjs`. It handles:
*   **Automatic Account Creation**: Creates a Firebase Auth account for each pilgrim with a default password (`Sacred@123`).
*   **Profile Population**: Fills the Firestore `users` collection with all details (Aadhar, Phone, DOB, etc.).
*   **Duplicate Prevention**: Checks if an email already exists before importing.

> [!TIP]
> After importing, pilgrims can log in using their email and the default password `Sacred@123`. They will be prompted to change it.
