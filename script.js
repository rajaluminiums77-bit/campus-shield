
  // ============================================
  // CAMPUS ZONE SELECTION & INTERACTION
  // ============================================
  const ZONE_DETAILS_DATA = {
    'Block A': {
      title: '🏫 Block A — Science & Engineering',
      status: '🔴 Active Alert',
      desc: 'Minor electrical smoke reported in Lab 304. Security team dispatched, evacuation of 3rd floor completed.',
      time: 'Reported 15 mins ago · Priority: High',
    },
    'Gym': {
      title: '🏋️ Gymnasium & Sports Complex',
      status: '🟡 Medical Aid In Progress',
      desc: 'First-aid assistance requested on Court 2. Campus medical team is on site.',
      time: 'Reported 35 mins ago · Priority: Medium',
    },
    'Gate 2': {
      title: '🚪 Main Campus Gate 2',
      status: '🔴 Active Security Alert',
      desc: 'Unregistered individual without campus ID stopped at entry. Security patrol verifying credentials.',
      time: 'Reported 20 mins ago · Priority: High',
    },
    'Parking': {
      title: '🚗 North Parking Area',
      status: '🟢 Incident Resolved',
      desc: 'Reported misplaced bicycle was recovered by security and returned to student.',
      time: 'Resolved 1 hour ago',
    },
    'Library': {
      title: '🏛️ Central Library',
      status: '🟢 Safe & Secure',
      desc: 'Normal operations. Quiet study zone active. Security guard on duty on ground floor.',
      time: 'All clear · Regular patrol active',
    },
    'Block B': {
      title: '🏢 Block B — Humanities & Business',
      status: '🟢 Safe & Secure',
      desc: 'All classrooms and faculty offices operational. No safety alerts reported.',
      time: 'All clear',
    },
    'Cafeteria': {
      title: '🍽️ Student Cafeteria & Food Court',
      status: '🟢 Safe & Secure',
      desc: 'Routine safety inspection passed. Area is clear and under CCTV surveillance.',
      time: 'All clear',
    },
    'Hostel': {
      title: '🏠 Student Residential Hostel',
      status: '🟢 Safe & Secure',
      desc: 'Night warden and biometric access points functioning normally.',
      time: 'All clear',
    },
  };

  let currentlySelectedZone = null;

  window.selectZone = function(zoneName) {
    currentlySelectedZone = zoneName;

    // Highlight selected card in both grids
    document.querySelectorAll('.zone-card').forEach(card => {
      if (card.getAttribute('data-zone') === zoneName || card.querySelector('.zone-name')?.textContent === zoneName) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    const data = ZONE_DETAILS_DATA[zoneName] || {
      title: '📍 ' + zoneName,
      status: '🟢 Monitored',
      desc: 'Campus zone under active CCTV surveillance and regular security patrols.',
      time: 'Status: Normal',
    };

    const titleEl = document.getElementById('detailZoneTitle');
    const contentEl = document.getElementById('detailZoneContent');
    const actionBtn = document.getElementById('btnReportInZone');

    if (titleEl) {
      titleEl.innerHTML = `${data.title} &nbsp; <span style="font-size:0.75rem; font-weight:600;">(${data.status})</span>`;
    }

    if (contentEl) {
      contentEl.innerHTML = `
        <div style="color:#1f2937; margin-bottom:4px;">${data.desc}</div>
        <div style="font-size:0.75rem; color:#9ca3af;"><i class="fas fa-clock"></i> ${data.time}</div>
      `;
    }

    if (actionBtn) {
      actionBtn.style.display = 'inline-flex';
    }
  };

  window.reportInSelectedZone = function() {
    if (!currentlySelectedZone) return;
    const locationInput = document.querySelector('#reportForm input[placeholder*="location"], #reportForm input[type="text"]:nth-of-type(2)');
    if (locationInput) {
      locationInput.value = currentlySelectedZone;
    }
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
      reportForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.filterCampusZones = function(filterType, btn) {
    if (btn) {
      document.querySelectorAll('#zoneFilterButtons .btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    document.querySelectorAll('#fullZoneGrid .zone-card').forEach(card => {
      const status = card.getAttribute('data-status');
      if (filterType === 'all' || status === filterType) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  };

/**
 * Campus Shield - Frontend Script
 * Wired to backend API with JWT auth
 */

(function () {
  'use strict';

  
  // ============================================
  // INTERACTIVE LEAFLET CAMPUS MAPS
  // ============================================
  let dashboardMapInstance = null;
  let fullMapInstance = null;
  let allMapIncidents = [];
  let currentMapFilter = 'all';

  const CAMPUS_LOCATIONS = {
    'Library': { lat: 28.5458, lng: 77.1920, emoji: '🏛️' },
    'Block A': { lat: 28.5465, lng: 77.1935, emoji: '🏫' },
    'Block B': { lat: 28.5452, lng: 77.1945, emoji: '🏢' },
    'Block C': { lat: 28.5442, lng: 77.1930, emoji: '🏢' },
    'Gym': { lat: 28.5435, lng: 77.1915, emoji: '🏋️' },
    'Parking': { lat: 28.5470, lng: 77.1910, emoji: '🚗' },
    'Gate 2': { lat: 28.5430, lng: 77.1940, emoji: '🚪' },
    'Cafeteria': { lat: 28.5450, lng: 77.1930, emoji: '🍽️' },
    'Hostel': { lat: 28.5460, lng: 77.1950, emoji: '🏠' },
  };

  function getIncidentEmoji(type) {
    const map = {
      'Fire': '🔥',
      'Medical Emergency': '🚑',
      'Medical': '🚑',
      'Theft': '🔒',
      'Bullying': '⚠️',
      'Ragging': '⚠️',
      'Suspicious Person': '👤',
      'SOS': '🚨',
    };
    return map[type] || '📍';
  }

  function getStatusColor(status) {
    if (status === 'Resolved') return '#10b981';
    if (status === 'In Progress') return '#f59e0b';
    return '#dc2626';
  }

  function createMarkerIcon(incident) {
    const color = getStatusColor(incident.status);
    const emoji = getIncidentEmoji(incident.type);
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="campus-pin-marker" style="background:${color};">${emoji}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  }

  function buildPopupContent(incident) {
    const badgeClass = incident.status === 'Resolved' ? 'resolved' : (incident.status === 'In Progress' ? 'in-progress' : 'active');
    return `
      <div>
        <div class="map-popup-title">${incident.title || 'Campus Incident'}</div>
        <span class="map-popup-badge ${badgeClass}">${incident.status || 'Active'}</span>
        <div class="map-popup-desc">${incident.description || 'No description provided.'}</div>
        <div class="map-popup-meta">
          <span>📍 ${incident.location || 'Campus'}</span>
          <span>${incident.priority || 'Medium'} Priority</span>
        </div>
      </div>
    `;
  }

  function renderMarkersOnMap(map, incidents) {
    if (!map) return;

    // Clear existing markers
    if (map._markerLayerGroup) {
      map._markerLayerGroup.clearLayers();
    } else {
      map._markerLayerGroup = L.layerGroup().addTo(map);
    }

    // Default markers if none from API yet
    const displayIncidents = (incidents && incidents.length > 0) ? incidents : [
      { id: 1, title: 'Fire alarm inspection', type: 'Fire', location: 'Block A', status: 'Active', description: 'Minor smoke detected in lab 3' },
      { id: 2, title: 'Medical first aid', type: 'Medical Emergency', location: 'Gym', status: 'In Progress', description: 'Student sprained ankle during game' },
      { id: 3, title: 'Resolved bicycle theft', type: 'Theft', location: 'Parking', status: 'Resolved', description: 'Bicycle returned to owner' },
      { id: 4, title: 'Suspicious individual', type: 'Suspicious Person', location: 'Gate 2', status: 'Active', description: 'Unregistered visitor near Gate 2' },
    ];

    displayIncidents.forEach(inc => {
      if (currentMapFilter !== 'all' && inc.status !== currentMapFilter) return;

      let lat = inc.lat;
      let lng = inc.lng;

      if (!lat || !lng) {
        // Find by location name keyword
        for (const [locName, coords] of Object.entries(CAMPUS_LOCATIONS)) {
          if (inc.location && inc.location.toLowerCase().includes(locName.toLowerCase())) {
            lat = coords.lat + (Math.random() - 0.5) * 0.0005;
            lng = coords.lng + (Math.random() - 0.5) * 0.0005;
            break;
          }
        }
      }

      // Fallback within campus area
      if (!lat || !lng) {
        lat = 28.5450 + (Math.random() - 0.5) * 0.003;
        lng = 77.1926 + (Math.random() - 0.5) * 0.003;
      }

      const marker = L.marker([lat, lng], { icon: createMarkerIcon(inc) });
      marker.bindPopup(buildPopupContent(inc));
      map._markerLayerGroup.addLayer(marker);
    });
  }

  async function initCampusMaps() {
    if (typeof L === 'undefined') return;

    const campusCenter = [28.5452, 77.1930];
    const tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const tileOpts = { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' };

    // 1. Dashboard Mini Map
    const dashEl = document.getElementById('dashboardMap');
    if (dashEl && !dashboardMapInstance) {
      dashboardMapInstance = L.map('dashboardMap', {
        center: campusCenter,
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer(tileLayerUrl, tileOpts).addTo(dashboardMapInstance);
      L.control.zoom({ position: 'topright' }).addTo(dashboardMapInstance);
    }

    // 2. Full Live Map Page
    const fullEl = document.getElementById('fullCampusMap');
    if (fullEl && !fullMapInstance) {
      fullMapInstance = L.map('fullCampusMap', {
        center: campusCenter,
        zoom: 16,
      });
      L.tileLayer(tileLayerUrl, tileOpts).addTo(fullMapInstance);

      // Add campus zone labels
      Object.entries(CAMPUS_LOCATIONS).forEach(([name, data]) => {
        L.circleMarker([data.lat, data.lng], {
          radius: 8,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(fullMapInstance).bindTooltip(`${data.emoji} ${name}`, { permanent: false, direction: 'top' });
      });
    }

    // Load incidents from API
    try {
      const res = await window.API.IncidentsAPI.list();
      if (res.success && res.data) {
        allMapIncidents = res.data;
      }
    } catch (e) {
      console.warn('Could not load incidents for map:', e);
    }

    renderMarkersOnMap(dashboardMapInstance, allMapIncidents);
    renderMarkersOnMap(fullMapInstance, allMapIncidents);

    // Setup filter buttons
    const filterBtns = document.querySelectorAll('#mapFilters .btn-filter');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentMapFilter = this.getAttribute('data-filter');
        renderMarkersOnMap(fullMapInstance, allMapIncidents);
      });
    });
  }

  // ============================================
  // LOGIN SCREEN
  // ============================================
  function showLoginScreen() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function hideLoginScreen() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  // ============================================
  // AUTH
  // ============================================
  function switchAuthTab(tab) {
    const tabSignIn = document.getElementById('tabSignIn');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const demoBox = document.getElementById('demoAccountsBox');
    const subtitle = document.getElementById('authSubtitle');
    const googleBtnText = document.getElementById('googleBtnText');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');

    if (loginError) loginError.textContent = '';
    if (registerError) registerError.textContent = '';

    if (tab === 'register') {
      if (tabSignIn) tabSignIn.classList.remove('active');
      if (tabRegister) tabRegister.classList.add('active');
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'flex';
      if (demoBox) demoBox.style.display = 'none';
      if (subtitle) subtitle.textContent = 'Create an account to join your campus safety network';
      if (googleBtnText) googleBtnText.textContent = 'Sign up with Google';
    } else {
      if (tabRegister) tabRegister.classList.remove('active');
      if (tabSignIn) tabSignIn.classList.add('active');
      if (loginForm) loginForm.style.display = 'flex';
      if (registerForm) registerForm.style.display = 'none';
      if (demoBox) demoBox.style.display = 'block';
      if (subtitle) subtitle.textContent = 'Sign in to access your safety dashboard';
      if (googleBtnText) googleBtnText.textContent = 'Continue with Google';
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginSubmitBtn');

    errorEl.textContent = '';
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    try {
      const res = await window.API.AuthAPI.login(email, password);

      if (res.success) {
        window.session.saveSession(res.data.user, res.data.token);
        hideLoginScreen();
        await loadUserData();
        await loadDashboardData();
        await loadAlerts();
        showNotification('Welcome back, ' + res.data.user.name + '!', 'Login successful', 'success');
      } else {
        errorEl.textContent = res.message || 'Login failed';
      }
    } catch (err) {
      errorEl.textContent = 'Network error. Is the server running?';
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const role = document.getElementById('regRole').value;
    const studentId = document.getElementById('regStudentId').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const errorEl = document.getElementById('registerError');
    const btn = document.getElementById('registerSubmitBtn');

    errorEl.textContent = '';

    if (password !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match.';
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    try {
      const res = await window.API.AuthAPI.register({
        name,
        email,
        password,
        role,
        studentId: studentId || null,
      });

      if (res.success) {
        window.session.saveSession(res.data.user, res.data.token);
        hideLoginScreen();
        await loadUserData();
        await loadDashboardData();
        await loadAlerts();
        showNotification('Welcome to Campus Shield, ' + res.data.user.name + '!', 'Account created successfully', 'success');
      } else {
        errorEl.textContent = res.message || 'Registration failed';
      }
    } catch (err) {
      errorEl.textContent = 'Network error. Is the server running?';
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
  }

  // Parse JWT token from Google Identity Services
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Handle real Google credential from Google Identity Services
  window.handleGoogleCredentialResponse = async function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) return;
    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) return;

    await completeGoogleLogin(payload.name || payload.email.split('@')[0], payload.email, payload.sub, payload.picture);
  }

  async function completeGoogleLogin(name, email, googleId, picture) {
    const errorEl = document.getElementById('loginError') || document.getElementById('registerError');
    const googleBtn = document.getElementById('btnGoogleAuth');
    const originalContent = googleBtn ? googleBtn.innerHTML : '';

    if (googleBtn) {
      googleBtn.disabled = true;
      googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in with Google...';
    }

    try {
      const res = await window.API.AuthAPI.googleLogin({
        email,
        name,
        googleId: googleId || 'google_' + Date.now(),
        picture: picture || null,
      });

      if (res.success) {
        window.session.saveSession(res.data.user, res.data.token);
        hideLoginScreen();
        await loadUserData();
        await loadDashboardData();
        await loadAlerts();
        showNotification('Signed in with Google as ' + res.data.user.email, 'Google Authentication', 'success');
      } else {
        if (errorEl) errorEl.textContent = res.message || 'Google authentication failed';
      }
    } catch (err) {
      if (errorEl) errorEl.textContent = 'Network error connecting to Google Auth.';
    }

    if (googleBtn) {
      googleBtn.disabled = false;
      googleBtn.innerHTML = originalContent;
    }
  }

  // Initialize official Google Identity Services
  async function initGoogleAuth() {
    try {
      const res = await fetch('/api/config');
      const config = await res.json();
      const clientId = config.googleClientId;

      window.GOOGLE_CLIENT_ID = clientId;

      function renderGoogleButton() {
        if (clientId && typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });

          const wrapper = document.getElementById('googleBtnWrapper');
          if (wrapper) {
            wrapper.innerHTML = '';
            google.accounts.id.renderButton(wrapper, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: 380,
              logo_alignment: 'left',
            });
          }
        }
      }

      if (typeof google === 'undefined') {
        window.addEventListener('load', renderGoogleButton);
      } else {
        renderGoogleButton();
      }
    } catch (err) {
      console.warn('Google Identity initialization:', err);
    }
  }

  function handleGoogleAuth() {
    if (window.GOOGLE_CLIENT_ID && typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.prompt();
    } else {
      const clientId = prompt('Enter your Google OAuth Client ID to activate real Google Login:\n(From console.cloud.google.com -> Credentials):');
      if (clientId && clientId.trim()) {
        window.GOOGLE_CLIENT_ID = clientId.trim();
        initGoogleAuth();
        alert('Google Client ID connected! Initializing Google Account chooser...');
      }
    }
  }

  function handleLogout() {
    window.session.clearSession();
    location.reload();
  }

  // ============================================
  // LOAD USER
  // ============================================
  async function loadUserData() {
    try {
      const res = await window.API.AuthAPI.me();
      if (!res.success) return;

      const user = res.data;

      const navName = document.querySelector('#profileBtn span:nth-child(2)');
      if (navName) navName.textContent = user.name.split(' ')[0];

      const profileH2 = document.querySelector('.modal-profile h2');
      if (profileH2) profileH2.textContent = user.name;

      const profileRole = document.querySelector('.profile-role');
      if (profileRole) {
        profileRole.textContent = `🎓 ${user.role === 'student' ? 'Student' : user.role} · ${user.department || 'N/A'}`;
      }

      const detailsContainer = document.querySelector('.profile-details');
      if (detailsContainer) {
        detailsContainer.innerHTML = `
          <div><span>📧 Email</span> ${user.email}</div>
          <div><span>🆔 Student ID</span> ${user.student_id || 'N/A'}</div>
          <div><span>📱 Phone</span> ${user.phone || 'N/A'}</div>
          <div><span>📍 Location</span> ${user.room || 'N/A'}</div>
          <div><span>🏫 Department</span> ${user.department || 'N/A'}</div>
          <div><span>📅 Joined</span> ${new Date(user.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        `;
      }

      const heroName = document.querySelector('.hero-content h1 span');
      if (heroName) heroName.textContent = user.name.split(' ')[0];
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  }

  // ============================================
  // LOAD DASHBOARD STATS
  // ============================================
  async function loadDashboardData() {
    try {
      const res = await window.API.IncidentsAPI.stats();
      if (!res.success) return;

      const stats = res.data;

      const heroNums = document.querySelectorAll('.hero-num');
      if (heroNums[0]) heroNums[0].textContent = stats.activeIncidents;
      if (heroNums[1]) heroNums[1].textContent = stats.avgResponseTime || '0';
      if (heroNums[2]) heroNums[2].textContent = stats.totalIncidents;

      const statNums = document.querySelectorAll('.stat-num');
      if (statNums[0]) statNums[0].textContent = stats.activeIncidents;
      if (statNums[1]) statNums[1].textContent = stats.inProgress;
      if (statNums[2]) statNums[2].textContent = stats.resolved;

      const analyticsStats = document.querySelectorAll('.analytics-stats strong');
      if (analyticsStats[0]) analyticsStats[0].textContent = stats.totalIncidents;
      if (analyticsStats[1]) analyticsStats[1].textContent = (stats.avgResponseTime || 0) + ' min';

      updateAnalyticsChart(stats.byType);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  function updateAnalyticsChart(byType) {
    const chartBars = document.querySelectorAll('.analytics-chart .chart-bar');
    if (!chartBars.length || !byType) return;

    const typeMap = {};
    byType.forEach(t => { typeMap[t.type] = parseInt(t.count); });

    const types = ['Theft', 'Fire', 'Medical Emergency', 'Bullying', 'Other'];
    const maxCount = Math.max(...types.map(t => typeMap[t] || 0), 1);

    chartBars.forEach((bar, i) => {
      const type = types[i];
      const count = typeMap[type] || 0;
      const height = Math.max(20, (count / maxCount) * 80);
      bar.style.height = height + 'px';

      const span = bar.querySelector('span');
      if (span) span.textContent = type === 'Medical Emergency' ? 'Medical' : type;
    });
  }

  // ============================================
  // LOAD ALERTS
  // ============================================
  async function loadAlerts() {
    try {
      const res = await window.API.AlertsAPI.list();
      if (!res.success) return;

      const alerts = res.data;

      const unread = alerts.filter(a => !a.is_read).length;
      const navBadge = document.querySelector('.nav-badge');
      if (navBadge) {
        navBadge.textContent = unread;
        navBadge.style.display = unread > 0 ? '' : 'none';
      }

      const notifList = document.querySelector('.notification-list');
      if (notifList && alerts.length > 0) {
        const icons = {
          'SOS': { icon: 'fa-triangle-exclamation', color: '#dc2626' },
          'Incident': { icon: 'fa-bell', color: '#f59e0b' },
          'System': { icon: 'fa-circle-info', color: '#2563eb' },
        };

        notifList.innerHTML = alerts.slice(0, 4).map(alert => {
          const iconData = icons[alert.type] || icons['System'];
          const timeAgo = getTimeAgo(alert.created_at);
          return `
            <div class="notif-item" data-alert-id="${alert.id}">
              <i class="fas ${iconData.icon}" style="color:${iconData.color};"></i>
              <span>${alert.title}</span>
              <small>${timeAgo}</small>
            </div>
          `;
        }).join('');

        notifList.querySelectorAll('.notif-item').forEach(item => {
          item.addEventListener('click', function () {
            const title = this.querySelector('span')?.textContent || 'Alert';
            showNotification('🔔 Alert', title, 'warning');
          });
        });
      }

      const alertsPageList = document.querySelector('.alert-list');
      if (alertsPageList && alerts.length > 0) {
        alertsPageList.innerHTML = alerts.map(alert => {
          const severityClass = alert.severity === 'Critical' ? 'high' : alert.severity === 'High' ? 'medium' : 'low';
          const dot = alert.severity === 'Critical' ? '🔴' : alert.severity === 'High' ? '🟠' : alert.severity === 'Medium' ? '🟡' : '🟢';
          return `
            <div class="alert-item ${severityClass}">
              <span>${dot}</span> ${alert.title}
              <small>${getTimeAgo(alert.created_at)}</small>
            </div>
          `;
        }).join('');

        alertsPageList.querySelectorAll('.alert-item').forEach(item => {
          item.addEventListener('click', function () {
            showNotification('🔔 Alert Details', this.textContent.trim(), 'warning');
          });
        });
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  }

  function getTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return seconds + ' sec ago';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hr ago';
    return Math.floor(seconds / 86400) + ' days ago';
  }

  // ============================================
  // NAVIGATION
  // ============================================
  function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const pages = {
      dashboard: document.getElementById('page-dashboard'),
      map: document.getElementById('page-map'),
      alerts: document.getElementById('page-alerts'),
      analytics: document.getElementById('page-analytics'),
    };

    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const pageName = this.dataset.page;
        if (!pageName || !pages[pageName]) return;

        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        Object.values(pages).forEach(page => {
          if (page) page.classList.remove('active');
        });
        pages[pageName].classList.add('active');
        
        if (pageName === 'dashboard' && dashboardMapInstance) { setTimeout(() => dashboardMapInstance.invalidateSize(), 200); }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // ============================================
  // PROFILE MODAL
  // ============================================
  function initProfileModal() {
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeModal = document.getElementById('closeModal');
    const logoutBtn = document.querySelector('.btn-logout');

    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        profileModal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeModal) {
      closeModal.addEventListener('click', () => {
        profileModal.classList.remove('show');
        document.body.style.overflow = '';
      });
    }

    if (profileModal) {
      profileModal.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.remove('show');
          document.body.style.overflow = '';
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && profileModal && profileModal.classList.contains('show')) {
        profileModal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================
  // SOS
  // ============================================
  function initSOS() {
    const sosBtn = document.getElementById('sosButton');
    if (!sosBtn) return;

    sosBtn.addEventListener('click', async function () {
      if (!confirm('🚨 Are you sure you want to trigger SOS? This will alert campus security immediately.')) {
        return;
      }

      this.disabled = true;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';

      try {
        let location = 'Campus (location auto-captured)';
        if (navigator.geolocation) {
          try {
            const pos = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            location = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
          } catch (e) {}
        }

        const res = await window.API.IncidentsAPI.sos(location);

        if (res.success) {
          showNotification('🚨 SOS ACTIVATED!', 'Security has been notified. Help is on the way.', 'error');
          await loadDashboardData();
          await loadAlerts();
        } else {
          showNotification('❌ SOS Failed', res.message, 'error');
        }
      } catch (err) {
        showNotification('❌ SOS Failed', 'Network error. Please try again.', 'error');
      }

      this.disabled = false;
      this.innerHTML = '<i class="fas fa-circle-exclamation"></i><span>PRESS SOS</span>';
    });
  }

  // ============================================
  // REPORT FORM
  // ============================================
  function initReportForm() {
    const form = document.getElementById('reportForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const title = form.querySelector('input[type="text"]')?.value?.trim();
      const type = form.querySelector('select')?.value;
      const locationInput = form.querySelectorAll('input[type="text"]')[1];
      const location = locationInput?.value?.trim();
      const description = form.querySelector('textarea')?.value?.trim();
      const fileInput = form.querySelector('input[type="file"]');

      if (!title || !type || type === 'Select incident type' || !location || !description) {
        showNotification('⚠️ Missing Info', 'Please fill all required fields.', 'warning');
        return;
      }

      const btn = form.querySelector('.submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('location', location);
        formData.append('description', description);

        if (fileInput && fileInput.files.length > 0) {
          for (const file of fileInput.files) {
            formData.append('attachments', file);
          }
        }

        const res = await window.API.IncidentsAPI.create(formData);

        if (res.success) {
          showNotification('📋 Incident Reported!', `${type} · ${res.data.priority} priority`, 'success');
          form.reset();
          if (locationInput) locationInput.value = '';
          await loadDashboardData();
          await loadAlerts();
        } else {
          showNotification('❌ Report Failed', res.message, 'error');
        }
      } catch (err) {
        showNotification('❌ Report Failed', 'Network error. Is server running?', 'error');
      }

      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
    });
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================
  function showNotification(title, message, type = 'info') {
    const existing = document.querySelector('.custom-notification');
    if (existing) existing.remove();

    const colors = {
      error: '#dc2626',
      success: '#10b981',
      info: '#2563eb',
      warning: '#f59e0b',
    };

    const emojis = {
      error: '🔴',
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
    };

    const notif = document.createElement('div');
    notif.className = 'custom-notification';
    notif.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      background: white;
      border-radius: 20px;
      padding: 24px 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      border-left: 6px solid ${colors[type] || colors.info};
      z-index: 2000;
      max-width: 400px;
      animation: slideIn 0.4s ease;
      font-family: 'Inter', sans-serif;
    `;

    notif.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
        <span style="font-size:1.8rem;">${emojis[type] || emojis.info}</span>
        <strong style="font-size:1.1rem; color:#0b1a2e;">${title}</strong>
      </div>
      <p style="color:#4a5f7a; font-size:0.9rem; margin:0;">${message}</p>
      <button onclick="this.parentElement.remove()" style="
        margin-top:12px;
        background:#f0f4ff;
        border:none;
        padding:6px 18px;
        border-radius:40px;
        cursor:pointer;
        font-weight:500;
        color:#2563eb;
      ">Dismiss</button>
    `;

    document.body.appendChild(notif);

    if (!document.querySelector('#notif-styles')) {
      const style = document.createElement('style');
      style.id = 'notif-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(80px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      if (notif.parentElement) {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(50px)';
        notif.style.transition = '0.4s';
        setTimeout(() => notif.remove(), 400);
      }
    }, 5000);
  }

  // ============================================
  // INTERACTIVE
  // ============================================
  function initInteractive() {
    document.querySelectorAll('.marker-dot').forEach(marker => {
      marker.addEventListener('click', function (e) {
        e.stopPropagation();
        const text = this.textContent.trim();
        const emojis = {
          '🔥': 'Fire · Block A',
          '🚑': 'Medical · Gym',
          '✅': 'Theft · Parking (Resolved)',
          '⚠️': 'Suspicious · Gate 2',
        };
        showNotification('📍 Incident', emojis[text] || 'Incident', 'info');
      });
    });

    document.querySelectorAll('.stat-card').forEach(stat => {
      stat.addEventListener('click', function () {
        const num = this.querySelector('.stat-num')?.textContent || '0';
        const label = this.querySelector('.stat-label')?.textContent || 'items';
        showNotification('📊 Statistics', `${num} ${label}`, 'info');
      });
    });

    document.querySelectorAll('.chart-bar, .chart-bar-large').forEach(bar => {
      bar.addEventListener('click', function () {
        const label = this.querySelector('span')?.textContent || 'Category';
        const height = this.style.height || '40px';
        showNotification('📊 Chart Data', `${label}: ${height.replace('px', '')} incidents`, 'info');
      });
    });
  }

  // ============================================
  // KEYBOARD
  // ============================================
  function initKeyboard() {
    document.addEventListener('keydown', function (e) {
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;

        const sosBtn = document.getElementById('sosButton');
        if (sosBtn) {
          sosBtn.click();
          e.preventDefault();
        }
      }
    });
  }

  // ============================================
  // INIT
  // ============================================
  async function init() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }

    const tabSignIn = document.getElementById('tabSignIn');
    if (tabSignIn) {
      tabSignIn.addEventListener('click', () => switchAuthTab('signin'));
    }

    const tabRegister = document.getElementById('tabRegister');
    if (tabRegister) {
      tabRegister.addEventListener('click', () => switchAuthTab('register'));
    }

    const linkToRegister = document.getElementById('linkToRegister');
    if (linkToRegister) {
      linkToRegister.addEventListener('click', () => switchAuthTab('register'));
    }

    const linkToLogin = document.getElementById('linkToLogin');
    if (linkToLogin) {
      linkToLogin.addEventListener('click', () => switchAuthTab('signin'));
    }

    const btnGoogleAuth = document.getElementById('btnGoogleAuth');
    if (btnGoogleAuth) {
      btnGoogleAuth.addEventListener('click', handleGoogleAuth);
    }

    initNavigation();
    
    initProfileModal();
    initSOS();
    initReportForm();
    initInteractive();
    initKeyboard();

    if (window.session.isLoggedIn()) {
      hideLoginScreen();
      await loadUserData();
      await loadDashboardData();
      await loadAlerts();
    } else {
      showLoginScreen();
    }

    console.log('🛡️ Campus Shield loaded!');
    console.log('👤 Logged in:', window.session.isLoggedIn() ? 'Yes' : 'No');
    console.log('⌨️ Press S for SOS');
  }

  window.showLoginScreen = showLoginScreen;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();