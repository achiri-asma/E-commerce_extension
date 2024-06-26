document.addEventListener('DOMContentLoaded', function() {
    //Get searchTerm
    chrome.storage.local.get('lastSearchTerm', function(data) {
        const lastSearchTerm = data.lastSearchTerm || 'No recent searches';
        console.log(lastSearchTerm);

        const lastSearchElement = document.getElementById('lastSearch');
        if (lastSearchElement) {
            lastSearchElement.textContent = lastSearchTerm;
        }
    });
    // Gestion du clic sur le bouton
    const checkStatusButton = document.getElementById('checkStatus');
    if (checkStatusButton) {
        checkStatusButton.addEventListener('click', function() {
            chrome.storage.local.get('lastSearchTerm', function(data) {
                const lastSearchTerm = data.lastSearchTerm || 'vide';
                const encodedSearchTerm = encodeURIComponent(lastSearchTerm);
                const newUrl = chrome.runtime.getURL(`listofproducts.html?search=${encodedSearchTerm}`);
                
                // Ouvrir une nouvelle onglet avec l'URL
                chrome.tabs.create({ url: newUrl });
            });
        });
    }

   
});
