const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Authentication / user information is automatically added to the request.
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Must be an administrative user to delete a user.",
    );
  }
  try {
    await admin.auth().deleteUser(data.uid);
    return {message: "User deleted successfully"};
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
