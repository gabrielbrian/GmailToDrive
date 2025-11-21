### Gmail to Drive as PDF

This Google Apps Script automatically exports emails with a specific Gmail Label to a designated Google Drive folder as PDF files. 
*It also saves any attachments into a dedicated subfolder.*

* **Auto-PDF Conversion:** Converts the email body to a PDF named `[Subject] - [Date].pdf`.
* **Attachment Handling:** Downloads email attachments to a subfolder named `[Subject] - Attachments`.
* **Duplicate Prevention:** Checks the Drive folder to ensure the same email isn't exported twice.
* **Daily Automation:** Includes a trigger to run automatically every day at 1 AM.

### Setup Instructions

#### Create the Script

1. Go to [script.google.com](https://script.google.com).
2. Click "New Project".
3. Paste the script code into the editor.

#### Get your Folder ID

1. Open the Google Drive folder where you want to save files.
2. Look at the URL in your browser address bar.
3. Copy the string of text after `folders/`.
4.  **Example:** `drive.google.com/drive/folders/12345abcde...` → ID is `12345abcde...`

#### Configure the Code

* At the very top of the script, find `labelDrivePairs`.
* Enter your Gmail Label name and the Drive Folder ID you copied.

```javascript
const labelDrivePairs = [
  { label: "Data", driveFolderId: "YOUR_COPIED_ID_HERE"},
];
```
>*Add as many label-folder pairs as needed*

### 4. Activate

* Select the function `createDailyTrigger` from the dropdown menu in the toolbar.
* Click **Run**.
* Grant the necessary permissions when prompted:
  1. Select your account
  2. Click **Advanced**
  3. Click **Go to Project (Unsafe)**
  4. Click **Allow**

## Usage

In Gmail, apply the label you configured to any email you want to save and wait till the trigger runs or, to run it immediately: Select the function `manualExport` and click **Run**.
