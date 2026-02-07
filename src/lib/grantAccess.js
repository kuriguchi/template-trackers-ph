import { google } from "googleapis";

function getGoogleAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google OAuth credentials. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN."
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

async function copyFolderContents({ drive, sourceFolderId, destinationFolderId }) {
  let pageToken = undefined;
  const copiedItems = [];

  do {
    const listResponse = await drive.files.list({
      q: `'${sourceFolderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id,name,mimeType,shortcutDetails)",
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const item of listResponse.data.files || []) {
      if (item.mimeType === "application/vnd.google-apps.shortcut") {
        const targetId = item.shortcutDetails?.targetId;
        const targetMimeType = item.shortcutDetails?.targetMimeType;

        if (!targetId) {
          continue;
        }

        if (targetMimeType === "application/vnd.google-apps.folder") {
          const newFolder = await drive.files.create({
            requestBody: {
              name: item.name,
              mimeType: "application/vnd.google-apps.folder",
              parents: [destinationFolderId],
            },
            fields: "id,name,webViewLink",
            supportsAllDrives: true,
          });

          copiedItems.push({
            id: newFolder.data.id,
            name: newFolder.data.name,
            webViewLink: newFolder.data.webViewLink,
            mimeType: "application/vnd.google-apps.folder",
          });

          const nested = await copyFolderContents({
            drive,
            sourceFolderId: targetId,
            destinationFolderId: newFolder.data.id,
          });

          copiedItems.push(...nested);
        } else {
          const copied = await drive.files.copy({
            fileId: targetId,
            requestBody: {
              name: item.name,
              parents: [destinationFolderId],
            },
            fields: "id,name,webViewLink,mimeType",
            supportsAllDrives: true,
          });

          copiedItems.push(copied.data);
        }

        continue;
      }

      if (item.mimeType === "application/vnd.google-apps.folder") {
        const newFolder = await drive.files.create({
          requestBody: {
            name: item.name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [destinationFolderId],
          },
          fields: "id,name,webViewLink",
          supportsAllDrives: true,
        });

        copiedItems.push({
          id: newFolder.data.id,
          name: newFolder.data.name,
          webViewLink: newFolder.data.webViewLink,
          mimeType: "application/vnd.google-apps.folder",
        });

        const nested = await copyFolderContents({
          drive,
          sourceFolderId: item.id,
          destinationFolderId: newFolder.data.id,
        });

        copiedItems.push(...nested);
      } else {
        const copied = await drive.files.copy({
          fileId: item.id,
          requestBody: {
            name: item.name,
            parents: [destinationFolderId],
          },
          fields: "id,name,webViewLink,mimeType",
          supportsAllDrives: true,
        });

        copiedItems.push(copied.data);
      }
    }

    pageToken = listResponse.data.nextPageToken;
  } while (pageToken);

  return copiedItems;
}

async function isDescendant({ drive, childId, ancestorId }) {
  if (!childId || !ancestorId || childId === ancestorId) {
    return false;
  }

  const queue = [childId];
  const seen = new Set();

  while (queue.length) {
    const currentId = queue.shift();
    if (!currentId || seen.has(currentId)) {
      continue;
    }

    seen.add(currentId);

    const meta = await drive.files.get({
      fileId: currentId,
      fields: "id,parents",
      supportsAllDrives: true,
    });

    const parents = meta.data.parents || [];
    if (parents.includes(ancestorId)) {
      return true;
    }

    for (const parentId of parents) {
      if (!seen.has(parentId)) {
        queue.push(parentId);
      }
    }
  }

  return false;
}

export async function grantAccess({
  buyerEmail,
  templateFolderId,
  folderName,
  destinationFolderId,
}) {
  const resolvedTemplateFolderId =
    templateFolderId || process.env.GOOGLE_TEMPLATE_FOLDER_ID;

  if (!buyerEmail || !resolvedTemplateFolderId) {
    throw new Error("buyerEmail and templateFolderId are required.");
  }

  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  const targetParentId =
    destinationFolderId ||
    process.env.GOOGLE_ORDERS_FOLDER_ID ||
    resolvedTemplateFolderId;

  const parentMeta = await drive.files.get({
    fileId: targetParentId,
    fields: "id,name,driveId,teamDriveId,parents,mimeType,shortcutDetails",
    supportsAllDrives: true,
  });

  let resolvedParentId = targetParentId;
  let resolvedMeta = parentMeta.data;

  if (
    resolvedMeta.mimeType === "application/vnd.google-apps.shortcut" &&
    resolvedMeta.shortcutDetails?.targetId
  ) {
    resolvedParentId = resolvedMeta.shortcutDetails.targetId;
    const shortcutTargetMeta = await drive.files.get({
      fileId: resolvedParentId,
      fields: "id,name,driveId,teamDriveId,parents,mimeType",
      supportsAllDrives: true,
    });
    resolvedMeta = shortcutTargetMeta.data;
  }

  if (resolvedParentId === resolvedTemplateFolderId) {
    throw new Error(
      "Orders folder cannot be the same as the template folder. Choose a separate Orders folder ID."
    );
  }

  const ordersInsideTemplate = await isDescendant({
    drive,
    childId: resolvedParentId,
    ancestorId: resolvedTemplateFolderId,
  });

  if (ordersInsideTemplate) {
    throw new Error(
      "Your Orders folder is inside the template folder. Move Orders outside the template to avoid infinite nesting, then use the new Orders folder ID."
    );
  }

  const templateInsideOrders = await isDescendant({
    drive,
    childId: resolvedTemplateFolderId,
    ancestorId: resolvedParentId,
  });

  if (templateInsideOrders) {
    throw new Error(
      "Your template folder is inside the Orders folder. Move the template outside Orders to avoid infinite nesting, then use the updated template folder ID."
    );
  }

  const newFolder = await drive.files.create({
    requestBody: {
      name: folderName || `Order - ${buyerEmail}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [resolvedParentId],
    },
    fields: "id,name,webViewLink",
    supportsAllDrives: true,
  });

  const buyerFolderId = newFolder.data.id;

  await drive.permissions.create({
    fileId: buyerFolderId,
    requestBody: {
      type: "user",
      role: "reader",
      emailAddress: buyerEmail,
    },
    sendNotificationEmail: false,
  });

  const copiedFiles = await copyFolderContents({
    drive,
    sourceFolderId: resolvedTemplateFolderId,
    destinationFolderId: buyerFolderId,
  });

  return {
    folderId: buyerFolderId,
    name: newFolder.data.name,
    webViewLink: newFolder.data.webViewLink,
    files: copiedFiles,
  };
}
