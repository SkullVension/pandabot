const { db } = require("../config/firebase.js");

function createDocument(collection, documentId, data) {
  return db.collection(collection).doc(documentId).set(data);
}

function deleteDocument(collection, documentId) {
  return db.collection(collection).doc(documentId).delete();
}

async function getDocument(collection, documentId) {
  const docSnap = await db.collection(collection).doc(documentId).get();

  if (!docSnap.exists) return null;

  return docSnap.data();
}

function updateDocument(collection, documentId, data) {
  return db.collection(collection).doc(documentId).update(data);
}

module.exports = {
  createDocument,
  deleteDocument,
  getDocument,
  updateDocument,
};
