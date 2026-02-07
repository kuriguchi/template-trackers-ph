import { grantAccess } from "@/lib/grantAccess";

export async function POST(request) {
  try {
    const { buyerEmail, templateFolderId, folderName, destinationFolderId } =
      await request.json();

    const result = await grantAccess({
      buyerEmail,
      templateFolderId,
      folderName,
      destinationFolderId,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error?.message || "Failed to grant access." },
      { status: 500 }
    );
  }
}
