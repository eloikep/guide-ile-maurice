// Module de gestion des données (DataManager)

class DataManager {
  constructor() {
    this.storageKey = 'maurice_guide_restos';
    this.items = [];
  }

  // Charge les données depuis localStorage ou depuis restos.json
  async loadData() {
    const localData = localStorage.getItem(this.storageKey);
    if (localData) {
      this.items = JSON.parse(localData);
      return this.items;
    }

    try {
      const response = await fetch('./assets/data/restos.json');
      const data = await response.json();
      
      // S'assurer que chaque item a un auteur (par défaut "Elo" pour la base initiale)
      this.items = data.map(item => ({
        ...item,
        auteur: item.auteur || "Elo"
      }));

      this.saveToLocalStorage();
      return this.items;
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      return [];
    }
  }

  // Obtenir tous les éléments
  getItems() {
    return this.items;
  }

  // Ajouter un nouveau lieu (créé par un utilisateur)
  addItem(newItem) {
    const id = this.items.length > 0 ? Math.max(...this.items.map(i => i.id)) + 1 : 1;
    const itemToAdd = {
      id,
      famille: newItem.famille || "Restos / Bars",
      categorie: newItem.categorie || "Restaurant",
      nom: newItem.nom,
      description: newItem.description || "",
      note: Number(newItem.note) || 4,
      zone: newItem.zone || "Nord",
      ville: newItem.ville || "",
      type: newItem.type || "Commun",
      cadre: newItem.cadre || "Non précisé",
      budget: newItem.budget || "Normal",
      commentaire: newItem.commentaire || "",
      lien_maps: newItem.lien_maps || "",
      telephone: newItem.telephone || "",
      auteur: newItem.auteur || "Invité"
    };

    this.items.push(itemToAdd);
    this.saveToLocalStorage();
    return itemToAdd;
  }

  // Sauvegarder dans le navigateur
  saveToLocalStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  // Exporter en JSON
  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "restos_maurice_updated.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

// Exportation de l'instance pour les autres modules
window.dataManager = new DataManager();
