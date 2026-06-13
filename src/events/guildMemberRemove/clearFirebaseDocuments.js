import { deleteDocument } from "../../utils/firestore.js";

export default async (client, member) => {
  try {
    await deleteDocument("warns", member.id);
    await deleteDocument("suspensions", member.id);
  } catch (error) {
    console.error(
      `Error clearing Firestore documents on member leave for ${member.user.tag}:`,
      error,
    );
  }
};
