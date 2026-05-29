/* js/map.js — Ruduino Live Map */
(function () {

    const POLL_INTERVAL = 5000;
    const FLOOR_IMAGES = {
        2: 'assets/leve2area.png',
        3: 'assets/level3area.png',
        4: 'assets/level4area.png',
        5: 'assets/level5area.png',
        6: 'assets/level6area.png',
    };

    let currentFloor = 3;
    let myPin = null;
    let allPins = [];
    let currentUser = null;
    let pollTimer = null;

    const mapWrapper  = document.getElementById('map-wrapper');
    const mapImage    = document.getElementById('map-image');
    const pinsLayer   = document.getElementById('pins-layer');
    const floorLabel  = document.getElementById('floor-label');
    const floorBtns   = document.querySelectorAll('.floor-btn');
    const myLocText   = document.getElementById('my-location-text');
    const myStatusDot = document.getElementById('my-status-dot');
    const clearBtn    = document.getElementById('clear-location-btn');
    const userList    = document.getElementById('user-list');
    const userCount   = document.getElementById('user-count');
    const navUserItem = document.getElementById('nav-user-item');
    const navUsername = document.getElementById('nav-username');
    const navLoginLink = document.getElementById('nav-login-link');
    const navLogout   = document.getElementById('nav-logout');
    const toast       = document.getElementById('toast');

    /* ── Auth check ── */
    function init() {
        const user = sessionStorage.getItem('ruduino_user') || localStorage.getItem('ruduino_user');

        if (!user) {
            /* Show auth wall instead of blank map */
            document.querySelector('.map-section').innerHTML = `
                <div class="map-auth-wall">
                    <div class="auth-wall-box">
                        <p class="sidebar-eyebrow" style="margin-bottom:8px;">Campus Navigation</p>
                        <h2 class="auth-wall-title">LIVE MAP<span class="cursor" style="background:#4ade80;"></span></h2>
                        <p class="auth-wall-sub">You need to be logged in to view<br>the live student location map.</p>
                        <a href="login.html?redirect=map.html" class="auth-wall-btn">→ Sign In</a>
                    </div>
                </div>`;
            return;
        }

        currentUser = user;
        if (navUserItem) {
            navUsername.textContent = user;
            navUserItem.style.display = '';
            if (navLoginLink) navLoginLink.parentElement.style.display = 'none';
        }
        if (navLogout) {
            navLogout.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }

        const saved = sessionStorage.getItem('ruduino_pin');
        if (saved) {
            try {
                myPin = JSON.parse(saved);
                currentFloor = myPin.floor || 3;
            } catch(err) {}
        }

        switchFloor(currentFloor, false);
        startPolling();
    }

    function logout() {
        if (myPin) clearLocation();
        sessionStorage.removeItem('ruduino_user');
        localStorage.removeItem('ruduino_user');
        sessionStorage.removeItem('ruduino_pin');
        window.location.href = 'login.html';
    }

    /* ── Floor switching ── */
    function switchFloor(floor, animate) {
        if (animate === undefined) animate = true;
        currentFloor = floor;
        floorLabel.textContent = 'Level ' + floor;
        floorBtns.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.floor) === floor));
        if (animate) {
            mapImage.classList.add('loading');
            setTimeout(() => mapImage.classList.remove('loading'), 250);
        }
        mapImage.src = FLOOR_IMAGES[floor];
        mapImage.alt = 'Level ' + floor + ' floor plan';
        renderPins();
    }

    floorBtns.forEach(btn => {
        btn.addEventListener('click', () => switchFloor(parseInt(btn.dataset.floor)));
    });

    /* ── Click on map → set pin ── */
    mapWrapper.addEventListener('click', function (e) {
        if (!currentUser) return;
        const rect = mapImage.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top  || e.clientY > rect.bottom) return;

        const x_pct = ((e.clientX - rect.left) / rect.width)  * 100;
        const y_pct = ((e.clientY - rect.top)  / rect.height) * 100;

        myPin = { x_pct, y_pct, floor: currentFloor };
        sessionStorage.setItem('ruduino_pin', JSON.stringify(myPin));

        myLocText.textContent = 'Level ' + currentFloor;
        myStatusDot.classList.add('active');
        clearBtn.style.display = 'block';

        renderPins();
        saveLocation(x_pct, y_pct, currentFloor);
        showToast('📍 Location set on Level ' + currentFloor);
    });

    /* ── Clear location ── */
    clearBtn.addEventListener('click', () => {
        myPin = null;
        sessionStorage.removeItem('ruduino_pin');
        myLocText.textContent = 'Not set — tap the map';
        myStatusDot.classList.remove('active');
        clearBtn.style.display = 'none';
        clearLocation();
        renderPins();
        showToast('Location cleared');
    });

    /* ── Render pins ── */
    function renderPins() {
        pinsLayer.innerHTML = '';
        const rect    = mapImage.getBoundingClientRect();
        const wrapRect = mapWrapper.getBoundingClientRect();
        const imgLeft  = rect.left - wrapRect.left;
        const imgTop   = rect.top  - wrapRect.top;

        allPins.forEach(pin => {
            if (pin.username === currentUser) return;
            if (parseInt(pin.floor) !== currentFloor) return;
            placePin(pin.x_pct, pin.y_pct, pin.username, 'other', imgLeft, imgTop, rect);
        });

        if (myPin && myPin.floor === currentFloor) {
            placePin(myPin.x_pct, myPin.y_pct, currentUser + ' (you)', 'me', imgLeft, imgTop, rect);
        }
    }

    function placePin(x_pct, y_pct, label, type, imgLeft, imgTop, rect) {
        const color  = type === 'me' ? '#4ade80' : '#60a5fa';
        const shadow = type === 'me' ? 'rgba(74,222,128,0.5)' : 'rgba(96,165,250,0.5)';

        const pin = document.createElement('div');
        pin.className = 'pin';
        pin.innerHTML = `
            <div class="pin-label">${escHtml(label)}</div>
            <svg width="26" height="32" viewBox="0 0 26 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1C7.477 1 3 5.477 3 11c0 7.732 10 20 10 20s10-12.268 10-20c0-5.523-4.477-10-10-10z"
                      fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
                <circle cx="13" cy="11" r="4" fill="rgba(0,0,0,0.2)"/>
            </svg>
            <div class="pin-shadow" style="background: radial-gradient(ellipse, ${shadow} 0%, transparent 70%);"></div>
        `;

        const px = imgLeft + (x_pct / 100) * rect.width;
        const py = imgTop  + (y_pct / 100) * rect.height;
        pin.style.left = px + 'px';
        pin.style.top  = py + 'px';
        pinsLayer.appendChild(pin);
    }

    /* ── API ── */
    function saveLocation(x_pct, y_pct, floor) {
        fetch('php/location_update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, x_pct, y_pct, floor })
        }).catch(() => {});
    }

    function clearLocation() {
        fetch('php/location_update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, clear: true })
        }).catch(() => {});
    }

    function fetchLocations() {
        fetch('php/location_fetch.php')
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    allPins = data;
                    renderPins();
                    updateUserList(data);
                }
            })
            .catch(() => {});
    }

    function startPolling() {
        fetchLocations();
        pollTimer = setInterval(fetchLocations, POLL_INTERVAL);
    }

    /* ── User list ── */
    function updateUserList(pins) {
        const byUser = {};
        pins.forEach(p => { byUser[p.username] = p; });
        const users = Object.values(byUser);

        userCount.textContent = users.length;
        userList.innerHTML = '';

        if (users.length === 0) {
            userList.innerHTML = '<li class="user-list-empty">No one online yet</li>';
            return;
        }

        users.forEach(p => {
            const li = document.createElement('li');
            li.className = 'user-list-item';
            const initials = p.username.substring(0,2).toUpperCase();
            const isMe = p.username === currentUser;
            li.innerHTML = `
                <div class="user-avatar">${escHtml(initials)}</div>
                <span>${escHtml(p.username)}${isMe ? ' <span style="color:#4ade80;font-size:0.68em;">(you)</span>' : ''}</span>
                <span class="user-floor-badge">L${p.floor}</span>
            `;
            li.addEventListener('click', () => {
                switchFloor(parseInt(p.floor));
                showToast('Jumped to Level ' + p.floor);
            });
            userList.appendChild(li);
        });
    }

    /* ── Toast ── */
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function escHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    window.addEventListener('resize', () => requestAnimationFrame(renderPins));
    mapImage.addEventListener('load', renderPins);

    init();
})();
