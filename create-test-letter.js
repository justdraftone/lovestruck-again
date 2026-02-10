// Run this in the browser console to create a test letter
// Paste this entire script into the console and press Enter

const testLetter = {
  id: 'TEST01',
  recipientName: 'My Love',
  senderName: 'Your Secret Admirer',
  content: 'This is a test letter with some romantic content. I hope you enjoy reading this beautiful message filled with love and affection. Testing the letter viewing feature!',
  createdAt: Date.now(),
};

// Get existing letters from localStorage
const storageKey = 'valentine-letters';
const existingData = localStorage.getItem(storageKey);
let store;

try {
  store = existingData ? JSON.parse(existingData) : null;
} catch (e) {
  store = null;
}

// Create proper Zustand persist structure
if (!store || !store.state) {
  store = {
    state: {
      letters: {},
      currentLetter: null
    },
    version: 0
  };
}

// Add test letter
store.state.letters['TEST01'] = testLetter;

// Save back to localStorage
localStorage.setItem(storageKey, JSON.stringify(store));

console.log('✅ Test letter created! ID: TEST01');
console.log('📝 Current store:', store);
console.log('🔗 View at: ' + window.location.origin + '/letters/view/TEST01');
console.log('💡 Or navigate to /letters/open and enter code: TEST01');
