document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    let globalResultIndex = 0;
    
    const searchResultElement = document.getElementById('searchResult');
    if (searchResultElement) {
        searchResultElement.textContent = searchTerm ? ` ${searchTerm}` : 'No search term found.';
    }

    var prodLink = document.querySelector('#prod ');
    var prodsDiv = document.getElementById('prods');

    prodLink.addEventListener('click', function (event) {
        event.preventDefault();
        prodsDiv.style.display = 'inline';
        searchMultiplePlatforms(searchTerm);
    });


    function searchMultiplePlatforms(term) {
        const currentPlatform = window.location.hostname;
        const platforms = [

            { name: 'Amazon', url: `https://www.amazon.fr/s?k=${term}` },
            { name: 'Amazon', url: `https://www.amazon.com/s?k=${term}` },
            { name: 'Cdiscount', url: `https://www.cdiscount.com/search/10/${term}.html` },
            { name: 'eBay', url: `https://www.ebay.com/sch/i.html?_nkw=${term}` },
            { name: 'Walmart', url: `https://www.walmart.com/search/?query=${term}` },
            { name: 'AliExpress', url: `https://fr.aliexpress.com/w/wholesale-${term}.html` },

        ];

        platforms
            .filter(platform => platform.hostname !== currentPlatform) 
            .forEach(platform => {
                fetch(platform.url, { mode: 'no-cors' })
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const results = extractResults(doc, platform.name);
                        displayResults(results, platform.name);
                    })
                    .catch(error => {
                        console.error(`Erreur lors de la recherche sur ${platform.name}:`, error);
                        document.getElementById('results').innerHTML += `<p>Erreur lors de la recherche sur ${platform.name}</p>`;
                    });
            });
    }

    function extractResults(doc, platform) {
        const results = [];
        switch (platform.toLowerCase()) {
            case 'amazon':
                doc.querySelectorAll('[data-component-type="s-search-result"]').forEach(item => {
                    const title = item.querySelector('h2 a span')?.textContent?.trim();
                    const price = item.querySelector('.a-price-whole')?.textContent?.trim();
                    const image = item.querySelector('.s-image')?.src;
                    const link = 'https://www.amazon.fr' + item.querySelector('h2 a')?.getAttribute('href');
                    if (title && price) {
                        results.push({ title, price, image, link });
                    }
                });
                break;

            case 'cdiscount':
                const items2 = Array.from(doc.querySelectorAll('.jsPrdBlocContainer'));
                items2.forEach((item2, index) => {
                    const title = item2.querySelector('.u-line-clamp--2, [class*="title"]')?.textContent?.trim();

                    const priceElement = item2.querySelector('.hideFromPro.priceColor.price, [class*="price"]');
                    const price = priceElement?.textContent?.trim().replace(/[^\d,]/g, '').replace(',', '.');

                    const image = item2.querySelector('img[data-src]')?.getAttribute('data-src') ||
                        item2.querySelector('img[src]')?.src;

                    const linkElement = item2.querySelector('.jsPrdtBILA, .prdtBILA, a[href]');
                    const link = linkElement ? new URL(linkElement.href, 'https://www.cdiscount.com').href : null;

                    if (title && price) {
                        results.push({
                            title,
                            price,
                            image,
                            link
                        });
                    }
                });

                console.log(`Nombre de produits trouvés sur Cdiscount : ${results.length}`);
                break;

            case 'ebay':
                doc.querySelectorAll('.s-item').forEach(item => {
                    const title = item.querySelector('.s-item__title')?.textContent?.trim();
                    const price = item.querySelector('.s-item__price')?.textContent?.trim();
                    let image;

                    const possibleImageSelectors = [
                        '.s-item__image-wrapper img',
                        '.s-item__image-img',
                        'img.s-item__image-img',
                        '.image-treatment img',
                        '.s-item__image .slashui-image-cntr img'
                    ];

                    for (let selector of possibleImageSelectors) {
                        const imgElement = item.querySelector(selector);
                        if (imgElement) {
                            image = imgElement.src || imgElement.getAttribute('data-src') || imgElement.getAttribute('srcset')?.split(' ')[0];
                            if (image) break;
                        }
                    }

                    if (!image) {
                        console.log('Aucune image trouvée pour:', title);
                        image = 'chemin/vers/image/par/defaut.jpg';
                    }

                    const link = item.querySelector('.s-item__link')?.href;
                    if (title && price) {
                        results.push({ title, price, image, link });
                    }
                });
                break;

            case 'walmart':
                const items = Array.from(doc.querySelectorAll('div[data-item-id]'));
                items.forEach((item, index) => {
                    const title = item.querySelector('span[data-automation-id="product-title"]')?.textContent?.trim();
                    const price = item.querySelector('div[data-automation-id="product-price"]')?.textContent?.trim();

                    // Récupérer l'URL de l'image
                    const imgElement = item.querySelector('img[data-testid="productTileImage"]');
                    const image = imgElement?.src || imgElement?.getAttribute('srcset')?.split(' ')[0];

                    // Récupérer le lien du produit
                    const linkElement = item.querySelector('a[link-identifier]');
                    const link = linkElement ? new URL(linkElement.href, 'https://www.walmart.com').href : null;

                    if (title && price) {
                        results.push({
                            title,
                            price,
                            image,
                            link
                        });
                    }
                });
                break;
            case 'aliexpress':
                console.log("Début de la recherche sur AliExpress");
                const itemms = Array.from(doc.querySelectorAll('.multi--outWrapper--SeJ8lrF, .card--out-wrapper'));
                console.log(`Nombre d'éléments trouvés : ${itemms.length}`);

                itemms.forEach((item, index) => {
                    const title = item.querySelector('.multi--title--G7dOCj3, [class*="title"]')?.textContent?.trim();
                    const price = item.querySelector('.multi--price-sale--U-S0jtj, [class*="price"]')?.textContent?.trim();

                    const imgElement = item.querySelector('.images--imageWindow--1Z-J9gn .images--item--3XZa6xf');
                    const image = imgElement ? 'https://' + imgElement.src.split('//').pop() : null;
                    console.log(imgElement);
                    console.log(image);
                    const linkElement = item.querySelector('a.multi--container--1UZxxHY.cards--card--3PJxwBm');
                    const link = linkElement ? new URL(linkElement.getAttribute('href'), 'https://fr.aliexpress.com').href : null;
                    console.log(`Élément ${index + 1}:`, { title, price, image, link });

                    if (title && price) {
                        results.push({
                            title,
                            price,
                            image,
                            link
                        });
                    } else {
                        console.log(`Élément ${index + 1} incomplet, ignoré`);
                    }
                });

                console.log(`Nombre de produits trouvés sur AliExpress : ${results.length}`);

                break;
            default:
                console.log(`Plateforme non prise en charge : ${platform}`);
        }
        return results;
    }
    function displayResults(results, platform) {
        let html = '';
        if (results.length !== 0) {
            results.forEach((item, index) => {
                globalResultIndex++;
                const shortTitle = item.title.length > 50 ? item.title.substring(0, 17) + '...' : item.title;
                html += `
                        <div class="bod">
                            <div class="e" style="margin-right:110px;">${globalResultIndex}</div>
                            <div class="e c"style="margin-right:110px;" >${platform}</div>
                            <div class="e c hover-zoom"  style="margin-right:150px;" ><img src="${item.image || '#'}" alt="${item.image}" style=" margin-top: -5px;width:32px;height:32px;"></div>
                            <div class="e c" style="width:150px;" title="${item.title}">${shortTitle}</div>
                            <div class="e c" "style="margin-right:180px;">${item.price}</div>
                            <div class="e c"><a  class="a" href="${item.link}">click</a></div>
                        </div>
                        `;
            });
        }
        document.getElementById('results').innerHTML += html;
    }

});