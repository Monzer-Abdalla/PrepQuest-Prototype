// Removes old auto-ID checklist items from /checklists/ and all user_checklists
// Keeps only the 18 items with explicit IDs (basic_*, gear_*, health_*)
// Usage: node scripts/cleanupChecklist.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDDz2psZDl5kU95kEPOz5OXAQyJHYHYewo",
  authDomain: "prepquest-e5780.firebaseapp.com",
  projectId: "prepquest-e5780",
  storageBucket: "prepquest-e5780.firebasestorage.app",
  messagingSenderId: "118493685424",
  appId: "1:118493685424:web:b1a81e24dd78350e863d75"
};

const VALID_PREFIXES = ['basic_', 'gear_', 'health_'];

function isOldItem(id) {
  for (var i = 0; i < VALID_PREFIXES.length; i++) {
    if (id.indexOf(VALID_PREFIXES[i]) === 0) { return false; }
  }
  return true;
}

async function cleanup() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 1. Find old IDs in /checklists/
  console.log('Reading /checklists/...');
  const masterSnap = await getDocs(collection(db, 'checklists'));
  const oldIds = [];
  masterSnap.docs.forEach(function(d) {
    if (isOldItem(d.id)) { oldIds.push(d.id); }
  });

  if (oldIds.length === 0) {
    console.log('No old items found in /checklists/. Already clean.');
    process.exit(0);
  }

  console.log('Found', oldIds.length, 'old items to remove:', oldIds);

  // 2. Delete old items from /checklists/
  for (var i = 0; i < oldIds.length; i++) {
    await deleteDoc(doc(db, 'checklists', oldIds[i]));
    console.log('Deleted /checklists/' + oldIds[i]);
  }

  // 3. Delete same IDs from every user's user_checklists
  console.log('\nReading /users/...');
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log('Found', usersSnap.docs.length, 'users');

  for (var u = 0; u < usersSnap.docs.length; u++) {
    const uid = usersSnap.docs[u].id;
    var removed = 0;
    for (var j = 0; j < oldIds.length; j++) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'user_checklists', oldIds[j]));
        removed++;
      } catch (e) {
        // item didn't exist for this user, skip
      }
    }
    console.log('User', uid.slice(0, 8) + '...', '— removed', removed, 'old items');
  }

  console.log('\nDone. All users now have 18 clean checklist items.');
  process.exit(0);
}

cleanup().catch(function(err) {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
