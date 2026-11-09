// Controller Principal

document.addEventListener("DOMContentLoaded", async () => {
  const dataManager = window.dataManager;
  const filterManager = new window.FilterManager(updateUI);
  const zoneMapManager = new window.ZoneMapManager(onZoneSelected);

  let currentCollection = 'restos';
  let items = await dataManager.loadData(currentCollection);
  filterManager.setSourceItems(items);

  // Bascule Restos / Activités
  const tabRestos = document.getElementById("tab-restos");
  const tabActivites = document.getElementById("tab-activites");

  if (tabRestos && tabActivites) {
    tabRestos.addEventListener("click", () => switchTab('restos'));
    tabActivites.addEventListener("click", () => switchTab('activites'));
  }

  async function switchTab(type) {
    currentCollection = type;
    dataManager.setType(type);
    
    // MAJ de la feuille de filtre HTML (affiche les bons menus déroulants)
    toggleFilterControls(type);
    
    // 🔥 ON GÈRE LES FILTRE DE MANIÈRE INTELLIGENTE :
    // On garde la zone active et la recherche, mais on remet à plat les sous-filtres 
    // (type, budget, catégorie d'activité) pour éviter le blocage entre les deux jeux de données.
    const currentZone = filterManager.currentFilters.zone;
    const currentSearch = filterManager.currentFilters.search;
    
    filterManager.resetFilters(); // Remet tout à zéro
    
    if (currentZone) {
      filterManager.currentFilters.zone = currentZone; // On conserve la zone
    }
    if (currentSearch) {
      filterManager.currentFilters.search = currentSearch; // On conserve la recherche textuelle
    }

    // Synchronisation visuelle des <select> de la page
    const filterType = document.getElementById("filter-type");
    if (filterType) filterType.value = filterManager.currentFilters.type;

    const filterBudget = document.getElementById("filter-budget");
    if (filterBudget) filterBudget.value = filterManager.currentFilters.budget;

    const filterActivitesCat = document.getElementById("filter-activites-cat");
    if (filterActivitesCat) filterActivitesCat.value = filterManager.currentFilters.categorie;

    // Style des boutons d'onglets
    if (type === 'restos') {
      tabRestos.className = "px-4 py-2 text-sm font-bold rounded-xl bg-sky-500 text-white shadow-sm transition";
      tabActivites.className = "px-4 py-2 text-sm font-bold rounded-xl bg-white text-slate-600 hover:bg-slate-100 transition";
    } else {
      tabActivites.className = "px-4 py-2 text-sm font-bold rounded-xl bg-sky-500 text-white shadow-sm transition";
      tabRestos.className = "px-4 py-2 text-sm font-bold rounded-xl bg-white text-slate-600 hover:bg-slate-100 transition";
    }

    // On recharge les données et met à jour l'UI
    items = await dataManager.loadData(type);
    filterManager.setSourceItems(items);
    updateUI(filterManager.getFilteredItems());
  }

  // Écouteurs filtres
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterManager.setFilter("search", e.target.value);
    });
  }

  setupFilterListeners(filterManager);
  setupAddForm(dataManager, filterManager);

  const exportBtn = document.getElementById("export-json-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => dataManager.exportJSON());
  }

  function onZoneSelected(zoneName) {
    filterManager.setFilter("zone", zoneName);
  }

  function updateUI(filteredItems) {
    // 1. On affiche la liste des cartes avec tous les filtres stricts (y compris la zone sélectionnée)
    renderCards(filteredItems, currentCollection, dataManager, filterManager);
    
    // 2. Pour les compteurs de la carte des zones, on prend les items sans le filtre de zone
    // Ainsi, les chiffres restent visibles sur toutes les régions !
    const itemsForZoneCounts = filterManager.getItemsWithoutZoneFilter();
    zoneMapManager.renderZones("zones-container", itemsForZoneCounts);
  }

  updateUI(items);
});

function toggleFilterControls(type) {
  const restosFilters = document.getElementById("restos-filters");
  const activitesFilters = document.getElementById("activites-filters");
  const formRestosFields = document.getElementById("form-restos-fields");
  const formActivitesFields = document.getElementById("form-activites-fields");

  if (type === 'restos') {
    if (restosFilters) restosFilters.classList.remove("hidden");
    if (activitesFilters) activitesFilters.classList.add("hidden");
    if (formRestosFields) formRestosFields.classList.remove("hidden");
    if (formActivitesFields) formActivitesFields.classList.add("hidden");
  } else {
    if (restosFilters) restosFilters.classList.add("hidden");
    if (activitesFilters) activitesFilters.classList.remove("hidden");
    if (formRestosFields) formRestosFields.classList.add("hidden");
    if (formActivitesFields) formActivitesFields.classList.remove("hidden");
  }
}

function renderCards(items, collectionType, dataManager, filterManager) {
  const container = document.getElementById("items-container");
  if (!container) return;

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100 p-8">
        <p class="text-lg font-medium">Aucun résultat dans cette catégorie.</p>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between";
    const stars = "★".repeat(item.note) + "☆".repeat(5 - item.note);

    let specificTagsHtml = '';
    if (collectionType === 'restos') {
      specificTagsHtml = `
        <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">${item.type || 'Commun'}</span>
        <span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">${item.cadre || 'Standard'}</span>
        <span class="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">${item.budget || 'Normal'}</span>
      `;
    } else {
      specificTagsHtml = `
        ${item.Difficulté ? `<span class="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium">Diff: ${item.Difficulté}</span>` : ''}
        ${item.Durée ? `<span class="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">⏱️ ${item.Durée}</span>` : ''}
      `;
    }

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start gap-2 mb-2">
          <span class="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-600 rounded-full">${item.zone} • ${item.ville}</span>
          <span class="text-xs font-bold text-amber-500 tracking-wider">${stars}</span>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">${item.nom}</h3>
        <p class="text-xs text-slate-500 font-medium mb-3">Ajouté par : <span class="text-slate-700">${item.auteur || 'Elo'}</span></p>
        <p class="text-slate-600 text-sm mb-4 leading-relaxed">${item.description || ''}</p>
        
        <div class="flex flex-wrap gap-1.5 mb-4">
          ${specificTagsHtml}
        </div>

        ${item.Détails ? `<div class="bg-sky-50/60 border-l-2 border-sky-400 p-2.5 rounded-r-lg text-xs text-slate-700 mb-3">ℹ️ ${item.Détails}</div>` : ''}
        ${item.commentaire ? `<div class="bg-amber-50/60 border-l-2 border-amber-400 p-2.5 rounded-r-lg text-xs text-slate-700 mb-4">💡 ${item.commentaire}</div>` : ''}
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
        <div class="flex items-center gap-2">
          ${item.lien_maps ? `<a href="${item.lien_maps}" target="_blank" class="text-sky-600 font-semibold hover:underline flex items-center gap-1">📍 Google Maps</a>` : '<span class="text-slate-400">Pas de lien maps</span>'}
          <button class="edit-maps-btn text-slate-400 hover:text-sky-600 text-[11px] underline" data-id="${item.id}">✏️ Modifier lien</button>
        </div>
        <span class="text-slate-400 italic">${item.categorie || item.famille}</span>
      </div>
    `;

    container.appendChild(card);
  });

  // Ajouter écouteurs pour la modification rapide de lien Maps (Numéro 2)
  document.querySelectorAll(".edit-maps-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.getAttribute("data-id"));
      const currentItem = items.find(i => i.id === id);
      const newUrl = prompt(`Entrez le nouveau lien Google Maps pour "${currentItem.nom}" :`, currentItem.lien_maps || "");
      if (newUrl !== null) {
        dataManager.updateItem(id, { lien_maps: newUrl.trim() });
        filterManager.setSourceItems(dataManager.getItems());
        renderCards(filterManager.getFilteredItems(), collectionType, dataManager, filterManager);
      }
    });
  });
}

function setupFilterListeners(filterManager) {
  const typeFilter = document.getElementById("filter-type");
  if (typeFilter) typeFilter.addEventListener("change", (e) => filterManager.setFilter("type", e.target.value));

  const budgetFilter = document.getElementById("filter-budget");
  if (budgetFilter) budgetFilter.addEventListener("change", (e) => filterManager.setFilter("budget", e.target.value));

  const catActivitesFilter = document.getElementById("filter-activites-cat");
  if (catActivitesFilter) catActivitesFilter.addEventListener("change", (e) => filterManager.setFilter("categorie", e.target.value));
}

function setupAddForm(dataManager, filterManager) {
  const form = document.getElementById("add-place-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const typeCollection = dataManager.getType();

    const newItem = {
      nom: document.getElementById("new-nom").value,
      zone: document.getElementById("new-zone").value,
      ville: document.getElementById("new-ville").value,
      note: Number(document.getElementById("new-note").value),
      description: document.getElementById("new-description").value,
      commentaire: document.getElementById("new-commentaire").value,
      lien_maps: document.getElementById("new-maps").value,
      auteur: document.getElementById("new-auteur").value || "Invité"
    };

    if (typeCollection === 'restos') {
      newItem.famille = "Restos / Bars";
      newItem.categorie = document.getElementById("new-categorie-resto").value;
      newItem.type = document.getElementById("new-type").value;
      newItem.cadre = document.getElementById("new-cadre").value;
      newItem.budget = document.getElementById("new-budget").value;
    } else {
      newItem.famille = "Activité";
      newItem.categorie = document.getElementById("new-categorie-activite").value;
      newItem.Difficulté = document.getElementById("new-difficulte").value;
      newItem.Durée = document.getElementById("new-duree").value;
      newItem.Détails = document.getElementById("new-details").value;
    }

    dataManager.addItem(newItem);
    form.reset();
    filterManager.setSourceItems(dataManager.getItems());
    alert("✨ Élément ajouté avec succès !");
  });
}