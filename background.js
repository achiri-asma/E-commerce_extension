chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'productSearched') {
      const { searchTerm } = message;
      
      console.log('searchTerm',searchTerm);
      chrome.storage.local.get({ 'lastSearchTerm': searchTerm }, function() {
        console.log(`Last search term saved: ${searchTerm}`);
    });
      
  }
});
