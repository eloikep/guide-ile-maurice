// Module de gestion de la carte interactive (les 5 zones et leurs compteurs)

class ZoneMapManager {
  constructor(onZoneSelect) {
    this.zones = ["Nord", "Sud", "Est", "Ouest", "Centre"];
    this.selectedZone = null;
    this.onZoneSelect = onZoneSelect; // Callback lorsqu'on clique sur une zone
  }

  // Initialise et dessine les blocs de zones dans le conteneur HTML
  renderZones(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    // Bouton "Toutes les zones" par défaut
    const totalCount = items.length;
    const allBtn = document.createElement('div');
    allBtn.className = `zone-card p-4 rounded-xl border ${this.selectedZone === null ? 'bg-sky-500 text-white border-sky-600 shadow-md' : 'bg-white text-slate-700 border-slate-200'} flex justify-between items-center cursor-pointer transition`;
    allBtn.innerHTML = `
      <span class="font-semibold">Toute l'île</span>
      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${this.selectedZone === null ? 'bg-white text-sky-600' : 'bg-slate-100 text-slate-600'}">${totalCount}</span>
    `;
    allBtn.addEventListener('click', () => {
      this.selectedZone = null;
      if (this.onZoneSelect) this.onZoneSelect(null);
    });
    container.appendChild(allBtn);

    // Création d'une carte pour chaque zone avec son compteur dynamique
    this.zones.forEach(zone => {
      // Compte combien d'éléments appartiennent à cette zone
      const count = items.filter(item => item.zone === zone).length;
      const isSelected = this.selectedZone === zone;

      const zoneCard = document.createElement('div');
      zoneCard.className = `zone-card p-4 rounded-xl border ${isSelected ? 'bg-sky-500 text-white border-sky-600 shadow-md' : 'bg-white text-slate-700 border-slate-200'} flex justify-between items-center cursor-pointer transition`;
      
      zoneCard.innerHTML = `
        <span class="font-semibold">${zone}</span>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${isSelected ? 'bg-white text-sky-600' : 'bg-slate-100 text-slate-600'}">${count}</span>
      `;

      zoneCard.addEventListener('click', () => {
        this.selectedZone = isSelected ? null : zone; // Toggle selection
        if (this.onZoneSelect) this.onZoneSelect(this.selectedZone);
      });

      container.appendChild(zoneCard);
    });
  }
}

// Exportation globale
window.ZoneMapManager = ZoneMapManager;
