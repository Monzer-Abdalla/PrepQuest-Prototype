// Run once to seed all 18 checklist items into /checklists/
// Usage: node scripts/seedChecklist.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDDz2psZDl5kU95kEPOz5OXAQyJHYHYewo",
  authDomain: "prepquest-e5780.firebaseapp.com",
  projectId: "prepquest-e5780",
  storageBucket: "prepquest-e5780.firebasestorage.app",
  messagingSenderId: "118493685424",
  appId: "1:118493685424:web:b1a81e24dd78350e863d75"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ITEMS = [
  { id: 'basic_water',       title: '3-day water supply (3L per person/day)', category: 'Basic',  points: 20 },
  { id: 'basic_food',        title: 'Non-perishable food (3-day supply)',      category: 'Basic',  points: 20 },
  { id: 'basic_flashlight',  title: 'Flashlight & extra batteries',            category: 'Basic',  points: 15 },
  { id: 'basic_whistle',     title: 'Emergency whistle',                       category: 'Basic',  points: 10 },
  { id: 'basic_mask',        title: 'Dust mask / N95 respirator',              category: 'Basic',  points: 15 },
  { id: 'basic_fire',        title: 'Waterproof matches or lighter',           category: 'Basic',  points: 10 },
  { id: 'gear_firstaid',     title: 'First aid kit',                           category: 'Gear',   points: 25 },
  { id: 'gear_radio',        title: 'Battery-powered emergency radio',         category: 'Gear',   points: 20 },
  { id: 'gear_blanket',      title: 'Emergency thermal blanket',               category: 'Gear',   points: 15 },
  { id: 'gear_multitool',    title: 'Multi-tool or Swiss army knife',          category: 'Gear',   points: 15 },
  { id: 'gear_docbag',       title: 'Waterproof bag for documents',            category: 'Gear',   points: 10 },
  { id: 'gear_cash',         title: 'Cash reserve (small denominations)',      category: 'Gear',   points: 15 },
  { id: 'health_meds',       title: '7-day prescription medication supply',    category: 'Health', points: 25 },
  { id: 'health_sanitizer',  title: 'Hand sanitizer & disinfectant',          category: 'Health', points: 10 },
  { id: 'health_contacts',   title: 'Written emergency contact list',          category: 'Health', points: 15 },
  { id: 'health_docs',       title: 'Copies of ID, passport & insurance',     category: 'Health', points: 20 },
  { id: 'health_cpr',        title: 'Basic first aid knowledge (CPR)',         category: 'Health', points: 20 },
  { id: 'health_hygiene',    title: 'Personal hygiene emergency kit',          category: 'Health', points: 10 },
];

async function seed() {
  console.log('Seeding', ITEMS.length, 'items to /checklists/...');
  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    await setDoc(doc(db, 'checklists', item.id), {
      title: item.title,
      category: item.category,
      points: item.points,
    });
    console.log('[' + (i + 1) + '/' + ITEMS.length + '] ' + item.id);
  }
  console.log('Done. All', ITEMS.length, 'items seeded.');
  process.exit(0);
}

seed().catch(function(err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
