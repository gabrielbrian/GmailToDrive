// Replace with your Gmail labels and Drive folder IDs
// { label: "{Gmail label name}", driveFolderId: "{Folder ID}}" }

const labelDrivePairs = [
  { label: "Data", driveFolderId: ""},
];

//Main function to export emails to Drive as PDFs
function exportEmailsToDrive() {
  for (const pair of labelDrivePairs) {
    const labelName = pair.label;
    const driveFolderId = pair.driveFolderId;
    
    const label = GmailApp.getUserLabelByName(labelName);
    
    if (!label) {
      Logger.log(`Label not found: ${labelName}`);
      continue;
    }
    
    Logger.log(`Processing label: ${labelName}`);
    
    const threads = label.getThreads(0, 50); // Limit of threads per label (Can be modified but hurts runtime)
    
    let folder;
    try {
      folder = DriveApp.getFolderById(driveFolderId);
    } catch (e) {
      Logger.log(`Invalid Drive folder ID: ${driveFolderId} for label ${labelName}`);
      continue;
    }
    
    // Get list of existing files in the folder to check for duplicates
    const existingFiles = {};
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      existingFiles[file.getName()] = true;
    }
    
    for (const thread of threads) {
      // Only get the last message in the thread (which contains the full chain)
      const messages = thread.getMessages();
      const message = messages[messages.length - 1];
      
      const subject = message.getSubject() || "No Subject";
      const date = message.getDate();
      const dateStr = date.toISOString().split('T')[0];
      const from = escapeHtml(message.getFrom());
      const to = escapeHtml(message.getTo());
      const cc = escapeHtml(message.getCc() || "None");
      const bcc = escapeHtml(message.getBcc() || "None");
      
      const pdfName = `${cleanFilename(subject)} - ${dateStr}.pdf`;
      
      // Check if this email has already been exported
      if (existingFiles[pdfName]) {
        Logger.log(`Skipping duplicate: ${pdfName}`);
        continue;
      }
      
      // Handle inline images by preserving the HTML content
      let htmlBody = message.getBody();
      
      // Create a formatted HTML string with email metadata
      const htmlContent = `
        <p><strong>Date:</strong> ${date.toISOString()}</p>
        <p><strong>From:</strong> ${from}</p>
        <p><strong>To:</strong> ${to}</p>
        <p><strong>CC:</strong> ${cc}</p>
        <p><strong>BCC:</strong> ${bcc}</p>
        <hr>
        <h2 style="text-align: center;">${escapeHtml(subject)}</h2>
        ${htmlBody}
      `;
      
      // Create PDF
      const blob = Utilities.newBlob(htmlContent, "text/html", pdfName);
      const pdfFile = folder.createFile(blob.getAs("application/pdf"));
      
      // Handle attachments
      handleAttachments(message, folder, pdfName);
      
      // Optional: Remove the label after processing to avoid reprocessing
      // Uncomment the next line if you want to remove the label after export
      // thread.removeLabel(label);
      
      Logger.log(`Saved PDF: ${pdfFile.getName()} to folder ID ${driveFolderId}`);
    }
  }
}
//Saving attachments to subfolder with same name as pdf
function handleAttachments(message, parentFolder, pdfName) {
  const attachments = message.getAttachments();
  if (attachments.length === 0) return;
  
  // Create a subfolder named after the email
  const folderName = pdfName.replace(".pdf", " - Attachments");
  const attachmentFolder = parentFolder.createFolder(folderName);
  
  // Save each attachment to the folder
  for (const attachment of attachments) {
    attachmentFolder.createFile(attachment);
    Logger.log(`Saved attachment: ${attachment.getName()} to folder: ${folderName}`);
  }
}
//Helper function to escape HTML characters to ensure proper rendering.
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
//Helper function to clean filenames of invalid characters
function cleanFilename(filename) {
  return escapeHtml(filename)
    .replace(/[\\/:*?"<>|]/g, "_")
    .substring(0, 100); // Limit filename length
}
function createDailyTrigger() {
  // Remove any existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === "exportEmailsToDrive") {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  // Create new trigger
  ScriptApp.newTrigger("exportEmailsToDrive")
    .timeBased()
    .everyDays(1)
    .atHour(1) // Runs at 1 AM; adjust as needed
    .create();
  
  Logger.log("Daily trigger created");
}
//Manual function to run once to test or manually export emails
function manualExport() {
  exportEmailsToDrive();
  Logger.log("Export completed");
}
