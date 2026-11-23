// gcyber-multicharacter - Application Frontend Logic

let charactersList = [];
let selectedSlot = 1;
let deletingCitizenId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Canvas animation
  initCanvas();

  // Request characters from server immediately
  if (window.mp && mp.events) {
    mp.events.emit('g-cyber:characters:request');
  }

  // Sidebar toggle
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const sidebar = document.getElementById('creator-sidebar');
  const toggleLabel = document.getElementById('toggle-label');

  if (btnToggle && sidebar) {
    btnToggle.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
      const isHidden = sidebar.classList.contains('hidden');
      toggleLabel.textContent = isHidden ? 'SHOW SERVER PANEL' : 'HIDE SERVER PANEL';
      btnToggle.classList.toggle('shifted', isHidden);
    });
  }

  // Native Creator Button
  const btnNative = document.getElementById('btn-open-native-creator');
  if (btnNative) {
    btnNative.addEventListener('click', () => {
      if (window.mp && mp.events) {
        mp.events.emit('g-cyber:characters:openNativeCreator');
      }
    });
  }

  // Life Path Selection
  const lpOptions = document.querySelectorAll('.lifepath-option');
  lpOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      lpOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Creator Form Submission
  const form = document.getElementById('form-create-character');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fn = document.getElementById('input-firstname').value.trim();
      const ln = document.getElementById('input-lastname').value.trim();
      const dob = document.getElementById('input-birthdate').value;
      const gender = document.getElementById('select-gender').value;
      const lp = document.querySelector('input[name="lifepath"]:checked').value;

      const payload = {
        slot: selectedSlot,
        charinfo: {
          firstname: fn,
          lastname: ln,
          birthdate: dob,
          gender: gender,
          lifepath: lp
        }
      };

      if (window.mp && mp.events) {
        mp.events.emit('g-cyber:characters:create', JSON.stringify(payload));
      }
    });
  }

  // Cancel Creator
  const btnCancel = document.getElementById('btn-cancel-creator');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      showView('view-multicharacter');
    });
  }

  // Modal Cancel
  const btnModalCancel = document.getElementById('btn-modal-cancel');
  if (btnModalCancel) {
    btnModalCancel.addEventListener('click', closeModal);
  }

  // Modal Confirm Delete
  const btnModalConfirm = document.getElementById('btn-modal-confirm');
  if (btnModalConfirm) {
    btnModalConfirm.addEventListener('click', () => {
      if (deletingCitizenId && window.mp && mp.events) {
        mp.events.emit('g-cyber:characters:delete', deletingCitizenId);
      }
      closeModal();
    });
  }
});

// Event from CyberMP Client: receive character list
if (window.mp && mp.events) {
  mp.events.add('g-cyber:characters:receive', (jsonStr) => {
    try {
      charactersList = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      renderSlots();
    } catch (e) {
      console.error('Error parsing characters:', e);
    }
  });

  mp.events.add('g-cyber:characters:loaded', () => {
    // Hide multicharacter UI when spawned in world
    document.getElementById('view-multicharacter').classList.remove('active');
    document.getElementById('view-creator').classList.remove('active');
    document.getElementById('fullscreen-backdrop').style.display = 'none';
  });
}

function renderSlots() {
  const grid = document.getElementById('characters-slots-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let slot = 1; slot <= 4; slot++) {
    const char = charactersList.find(c => Number(c.slot) === slot);

    if (char) {
      const charName = char.charinfo ? `${char.charinfo.firstname} ${char.charinfo.lastname}` : (char.name || 'Citizen');
      const cash = (char.money && char.money.cash !== undefined) ? char.money.cash : 5000;
      const bank = (char.money && char.money.bank !== undefined) ? char.money.bank : 25000;
      const job = (char.job && (char.job.label || char.job.name)) ? (char.job.label || char.job.name) : 'Civilian';
      const lp = (char.charinfo && char.charinfo.lifepath) ? char.charinfo.lifepath.toUpperCase() : 'STREET KID';

      const card = document.createElement('div');
      card.className = 'slot-card';
      card.innerHTML = `
        <div>
          <div class="char-slot-tag">SLOT 0${slot} // ${lp}</div>
          <div class="char-name">${charName}</div>
          <div class="char-cid">${char.citizenid}</div>
          <div class="char-stats">
            <div class="stat-row">
              <span class="stat-label">CASH:</span>
              <span class="stat-value text-green">$${cash.toLocaleString()}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">BANK:</span>
              <span class="stat-value text-cyan">$${bank.toLocaleString()}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">OCCUPATION:</span>
              <span class="stat-value">${job}</span>
            </div>
          </div>
        </div>
        <div class="slot-actions">
          <button class="btn btn-primary" onclick="selectCharacter('${char.citizenid}')">JACK IN</button>
          <button class="btn btn-danger" onclick="promptDelete('${char.citizenid}', '${charName}')">DELETE</button>
        </div>
      `;
      grid.appendChild(card);
    } else {
      const card = document.createElement('div');
      card.className = 'slot-card empty';
      card.onclick = () => openCreator(slot);
      card.innerHTML = `
        <div class="empty-plus-icon">+</div>
        <div class="empty-slot-title">CREATE NEW IDENTITY</div>
        <div style="font-size:0.8rem; color:var(--text-muted); font-family:var(--font-mono);">SLOT 0${slot} AVAILABLE</div>
      `;
      grid.appendChild(card);
    }
  }
}

function selectCharacter(citizenid) {
  if (window.mp && mp.events) {
    mp.events.emit('g-cyber:characters:select', citizenid);
  }
}

function promptDelete(citizenid, name) {
  deletingCitizenId = citizenid;
  document.getElementById('modal-char-name').textContent = name;
  document.getElementById('modal-char-id').textContent = citizenid;
  document.getElementById('modal-delete').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-delete').style.display = 'none';
  deletingCitizenId = null;
}

function openCreator(slot) {
  selectedSlot = slot;
  showView('view-creator');
}

function showView(viewId) {
  document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
}

// Background cyber grid canvas
function initCanvas() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const points = [];
  for (let i = 0; i < 40; i++) {
    points.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f0ff';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}
