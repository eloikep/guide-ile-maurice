// Module de gestion des filtres et de la recherche

class FilterManager {
  constructor(onFilterChange) {
    this.currentFilters = {
      search: "",
      zone: null,
      categorie: "Tous",
      type: "Tous",
      budget: "Tous",
      difficultes: "Tous"
    };
    this.onFilterChange = onFilterChange;
  }

  setFilter(key, value) {
    this.currentFilters[key] = value;
    if (this.onFilterChange) {
      this.onFilterChange(this.getFilteredItems());
    }
  }

  resetFilters() {
    this.currentFilters = {
      search: "",
      zone: null,
      categorie: "Tous",
      type: "Tous",
      budget: "Tous",
      difficultes: "Tous"
    };
  }

  filter(items) {
    return items.filter(item => {
      // 1. Recherche textuelle
      if (this.currentFilters.search) {
        const query = this.currentFilters.search.toLowerCase();
        const matchName = item.nom && item.nom.toLowerCase().includes(query);
        const matchCity = item.ville && item.ville.toLowerCase().includes(query);
        const matchDesc = item.description && item.description.toLowerCase().includes(query);
        if (!matchName && !matchCity && !matchDesc) return false;
      }

      // 2. Zone géographique
      if (this.currentFilters.zone && item.zone !== this.currentFilters.zone) {
        return false;
      }

      // 3. Catégorie / Sous-catégorie
      if (this.currentFilters.categorie !== "Tous") {
        if (!item.categorie || item.categorie !== this.currentFilters.categorie) {
          return false;
        }
      }

      // 4. Type (Restos)
      if (this.currentFilters.type !== "Tous" && item.type !== this.currentFilters.type) {
        return false;
      }

      // 5. Budget (Restos)
      if (this.currentFilters.budget !== "Tous" && item.budget !== this.currentFilters.budget) {
        return false;
      }

      return true;
    });
  }

  setSourceItems(items) {
    this.sourceItems = items;
  }

  getFilteredItems() {
    if (!this.sourceItems) return [];
    return this.filter(this.sourceItems);
  }
}

window.FilterManager = FilterManager;