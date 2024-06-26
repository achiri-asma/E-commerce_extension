// Créer un observer pour surveiller les mutations du DOM
const observer = new MutationObserver(function(mutationsList) {
    mutationsList.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.target.matches('input[type="text"], textarea')) {
            const searchTerm = mutation.target.value.trim();
            if (searchTerm.length > 0) {
                console.log(`Product searched: ${searchTerm}`);
                saveSearchTerm(searchTerm);
            }
        }
    });
});

// Options de l'observer (surveiller les modifications d'attributs et de sous-arborescences)
const observerConfig = { attributes: true, subtree: true };

// Démarrer l'observation du DOM
observer.observe(document.body, observerConfig);

// Fonction pour sauvegarder le terme de recherche
function saveSearchTerm(searchTerm) {
    chrome.storage.local.set({ 'lastSearchTerm': searchTerm }, function() {
        console.log(`Last search term saved: ${searchTerm}`);
    });
}
