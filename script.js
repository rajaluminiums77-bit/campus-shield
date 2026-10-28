/**
 * Campus Shield - Frontend Script
 * Wired to backend API with JWT auth
 */

(function () {
  'use strict';

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
  async function handleGoogleCredentialResponse(response) {
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