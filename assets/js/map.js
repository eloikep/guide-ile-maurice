// Module de gestion de la carte SVG interactive de l'Île Maurice

// Module de gestion de la carte SVG interactive de l'Île Maurice
class ZoneMapManager {
  constructor(onZoneSelect) {
    this.selectedZone = null;
    this.onZoneSelect = onZoneSelect;
    
    // Coordonnées pré-projetées dans l'espace 1000x1000 (nord en haut).
    this.zones = [
    {
        id: 'Nord', label: 'Nord', color: '#38bdf8',
        path: 'M 414,330 L 430,312 L 444,282 L 460,246 L 472,216 L 486,188 L 502,169 L 518,160 L 532,167 L 550,188 L 574,212 L 598,232 L 622,248 L 646,268 L 666,288 L 640,284 L 604,282 L 568,280 L 566,300 L 558,326 L 538,338 L 520,348 L 496,359 L 460,359 L 422,352 Z',
        cx: 508, cy: 270
    },
    {
        id: 'Est', label: 'Est', color: '#10b981',
        path: 'M 666,288 L 682,306 L 695,340 L 706,378 L 710,420 L 700,456 L 683,479 L 640,482 L 604,480 L 580,476 L 586,450 L 585,408 L 571,360 L 558,326 L 566,300 L 568,280 L 604,282 L 640,284 Z',
        cx: 634, cy: 385
    },
    {
        id: 'Centre', label: 'Centre', color: '#a855f7',
        path: 'M 422,352 L 460,359 L 496,359 L 520,348 L 538,338 L 558,326 L 571,360 L 585,408 L 586,450 L 580,476 L 554,488 L 526,505 L 496,522 L 460,536 L 430,539 L 400,540 L 398,498 L 400,444 L 405,402 L 410,366 Z',
        cx: 512, cy: 425
    },
    {
        id: 'Ouest', label: 'Ouest', color: '#f59e0b',
        path: 'M 414,330 L 422,352 L 410,366 L 405,402 L 400,444 L 398,498 L 400,540 L 370,545 L 338,548 L 330,510 L 333,464 L 340,420 L 352,384 L 370,356 L 390,342 Z',
        cx: 370, cy: 440
    },
    {
        id: 'Sud', label: 'Sud', color: '#ef4444',
        path: 'M 338,548 L 370,545 L 400,540 L 430,539 L 460,536 L 496,522 L 526,505 L 554,488 L 580,476 L 604,480 L 640,482 L 683,479 L 666,508 L 642,532 L 640,564 L 630,600 L 606,623 L 574,640 L 538,652 L 508,654 L 460,652 L 412,636 L 382,618 L 354,596 L 328,580 L 304,587 L 292,594 L 310,566 Z',
        cx: 560, cy: 565
    }
    ];
  }

  selectZone(zoneId) {
    if (this.selectedZone === zoneId) {
      this.selectedZone = null;
    } else {
      this.selectedZone = zoneId;
    }

    if (this.onZoneSelect) {
      this.onZoneSelect(this.selectedZone);
    }
  }

  renderZones(containerId, itemsWithoutZoneFilter = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const counts = {};
    this.zones.forEach(z => counts[z.id] = 0);
    itemsWithoutZoneFilter.forEach(item => {
      if (counts[item.zone] !== undefined) {
        counts[item.zone]++;
      }
    });

    const totalCount = itemsWithoutZoneFilter.length;
    const isAllSelected = (this.selectedZone === null); // <-- AJOUTER CETTE LIGNE

    let svgPaths = '';
    let svgBadges = '';

    this.zones.forEach(z => {
      const isSelected = this.selectedZone === z.id;
      const count = counts[z.id];
      
      const fillColor = (isAllSelected || this.selectedZone === z.id) ? z.color : '#e2e8f0';
      const strokeColor = isSelected ? '#0f172a' : '#cbd5e1';
      const badgeBg = isSelected ? z.color : '#ffffff';
      const badgeText = isSelected ? '#ffffff' : '#1e293b';

      svgPaths += `
        <path d="${z.path}" 
              fill="${fillColor}" 
              stroke="${strokeColor}" 
              stroke-width="${isSelected ? '5' : '2.5'}"
              class="cursor-pointer transition-all duration-200 hover:opacity-80"
              data-zone="${z.id}" />
      `;

      svgBadges += `
        <g class="cursor-pointer zone-badge" data-zone="${z.id}">
          <circle cx="${z.cx}" cy="${z.cy}" r="32" fill="${badgeBg}" stroke="${strokeColor}" stroke-width="3.5"/>
          <text x="${z.cx}" y="${z.cy + 11}" text-anchor="middle" font-size="26" font-weight="bold" fill="${badgeText}">${count}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <div class="space-y-4">
        <button id="btn-all-island" class="w-full py-2 px-3 text-xs font-bold rounded-xl transition flex justify-between items-center ${!this.selectedZone ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          <span>🌍 Toute l'île</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] ${!this.selectedZone ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}">${totalCount}</span>
        </button>

        <div class="relative bg-slate-50/50 p-2 rounded-2xl border border-slate-100 flex justify-center">
          <svg viewBox="280 140 450 640" class="w-full max-w-[240px] h-auto drop-shadow-sm">
            <g id="svg-zones-paths">${svgPaths}</g>
            <g id="svg-zones-badges">${svgBadges}</g>
          </svg>
        </div>

        <div class="grid grid-cols-2 gap-1.5 pt-1">
          ${this.zones.map(z => {
            const isSelected = this.selectedZone === z.id;
            return `
              <button data-zone="${z.id}" class="zone-btn text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex justify-between items-center transition ${isSelected ? 'bg-slate-800 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${z.color}"></span>
                  ${z.label}
                </span>
                <span class="text-[11px] opacity-75">${counts[z.id]}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-zone]').forEach(el => {
      el.addEventListener('click', () => {
        const zoneId = el.getAttribute('data-zone');
        this.selectZone(zoneId);
      });
    });

    const btnAll = container.querySelector('#btn-all-island');
    if (btnAll) {
      btnAll.addEventListener('click', () => {
        this.selectedZone = null;
        if (this.onZoneSelect) this.onZoneSelect(null);
      });
    }
  }
}

window.ZoneMapManager = ZoneMapManager;