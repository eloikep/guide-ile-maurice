// Module de gestion des données (DataManager)

class DataManager {
  constructor() {
    this.currentType = 'restos'; // 'restos' ou 'activites'
    this.storageKeyRestos = 'maurice_guide_restos';
    this.storageKeyActivites = 'maurice_guide_activites';
    this.items = [];
  }

  // Définir la collection active ('restos' ou 'activites')
  setType(type) {
    this.currentType = type;
  }

  getType() {
    return this.currentType;
  }

  // Charge les données selon le type actif depuis localStorage ou le fichier JSON
  async loadData(type = this.currentType) {
    this.currentType = type;
    const storageKey = this.currentType === 'restos' ? this.storageKeyRestos : this.storageKeyActivites;
    const jsonPath = this.currentType === 'restos' ? './assets/data/restos.json' : './assets/data/activites.json';

    const localData = localStorage.getItem(storageKey);
    if (localData) {
      this.items = JSON.parse(localData);
      return this.items;
    }

    try {
      const response = await fetch(jsonPath);
      const data = await response.json();
      
      this.items = data.map(item => ({
        ...item,
        auteur: item.auteur || "Elo"
      }));

      this.saveToLocalStorage();
      return this.items;
    } catch (error) {
      console.error(`Erreur lors du chargement des données (${this.currentType}) :`, error);
      return [];
    }
  }

  getItems() {
    return this.items;
  }

  // Ajouter un nouvel élément
  addItem(newItem) {
    const id = this.items.length > 0 ? Math.max(...this.items.map(i => i.id)) + 1 : 1;
    
    let itemToAdd = { id, ...newItem, auteur: newItem.auteur || "Invité" };

    this.items.push(itemToAdd);
    this.saveToLocalStorage();
    return itemToAdd;
  }

  // Mettre à jour un élément existant (par ID)
  updateItem(id, updatedFields) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updatedFields };
      this.saveToLocalStorage();
      return this.items[index];
    }
    return null;
  }

  // Sauvegarder dans localStorage
  saveToLocalStorage() {
    const storageKey = this.currentType === 'restos' ? this.storageKeyRestos : this.storageKeyActivites;
    localStorage.setItem(storageKey, JSON.stringify(this.items));
  }

  // Exporter la collection courante en JSON
  exportJSON() {
    const fileName = `${this.currentType}_maurice_updated.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

window.dataManager = new DataManager();