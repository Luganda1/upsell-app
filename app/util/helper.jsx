// THIS IS FILE FOR ALL THE HELPER FUNCTION 

// Function to save state to Local Storage   userSettings
export function saveToLocalStorage(preferences, filename) {
    localStorage.setItem(`${filename}`, JSON.stringify(preferences));
    }
    
    //Retrieve saved state
export function loadFromLocalStorage(filename) {
        if (typeof window !== 'undefined') {
        const savedPreferences = localStorage.getItem(filename);
        return savedPreferences ? JSON.parse(savedPreferences) : null;
        } else return null
    }
    
// Extract product ID numbers from graphql id 
export function extractProductId(productId) {
    const match = productId.match(/(\d+)$/);
    return match ? match[1] : "";
  }
