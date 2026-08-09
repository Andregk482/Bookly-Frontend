// ========== NAV.JS — Menu lateral + Auth compartilhado ==========
const API_BASE_URL = 'http://localhost:5000';
const AUTH_KEY = 'bookly_user';

// ----- FETCH helpers -----
async function apiGet(endpoint) {
    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error('HTTP ' + response.status + ': ' + text);
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.error('Backend não está rodando em', API_BASE_URL);
        }
        return null;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error('HTTP ' + response.status + ': ' + text);
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Não foi possível conectar ao backend. Verifique se o Flask está rodando.');
        }
        throw error;
    }
}

function extrairLista(response) {
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.results)) return response.results;
        if (Array.isArray(response.items)) return response.items;
        var keys = Object.keys(response);
        for (var i = 0; i < keys.length; i++) {
            if (Array.isArray(response[keys[i]])) return response[keys[i]];
        }
    }
    return null;
}

// ----- Auth helpers -----
function getSession() {
    var data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
}

function setSession(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'catalogo.html';
}

function requireLogin(tipo) {
    var user = getSession();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    if (tipo && user.tipo !== tipo) {
        alert('Esta área é apenas para ' + (tipo === 'livreiro' ? 'vendedores' : 'compradores') + '.');
        window.location.href = 'catalogo.html';
        return false;
    }
    return true;
}

// ----- Navbar auth -----
function updateNavbarAuth() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var authArea = document.getElementById('authArea');
    if (!authArea) {
        authArea = document.createElement('div');
        authArea.id = 'authArea';
        var hamburger = navbar.querySelector('.hamburger');
        if (hamburger) navbar.insertBefore(authArea, hamburger);
        else navbar.appendChild(authArea);
    }

    var user = getSession();

    if (user) {
        authArea.innerHTML =
            '<span class="auth-user-name">Olá, ' + user.primeiro_nome + '</span>' +
            '<button class="auth-logout-btn" onclick="logout()">Sair</button>';
    } else {
        authArea.innerHTML =
            '<a href="login.html" class="auth-login-link">Log in</a>' +
            '<a href="signup.html" class="auth-signup-link">Sign up</a>';
    }

    var loginBtns = document.querySelector('.login-btns');
    if (loginBtns) {
        if (user) {
            loginBtns.innerHTML =
                '<span style="color:#9ca3af; font-size:14px;">Olá, ' + user.primeiro_nome + '</span>' +
                '<button class="btn-login" onclick="logout()">Sair</button>';
        } else {
            loginBtns.innerHTML =
                '<button class="btn-login" onclick="window.location.href=\'login.html\'">Log in</button>' +
                '<button class="btn-signup" onclick="window.location.href=\'signup.html\'">Sign up</button>';
        }
    }

    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
        var authItem = document.getElementById('authSidebarItem');
        if (!authItem) {
            authItem = document.createElement('a');
            authItem.id = 'authSidebarItem';
            sidebar.appendChild(authItem);
        }
        if (user) {
            authItem.href = '#';
            authItem.onclick = function(e) { e.preventDefault(); logout(); };
            authItem.textContent = 'Sair (' + user.primeiro_nome + ')';
        } else {
            authItem.href = 'login.html';
            authItem.textContent = 'Log in / Sign up';
        }
    }
}

// ----- Hamburger / Sidebar -----
function initNav() {
    var hamburger = document.getElementById('hamburger');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('overlay');

    function toggleSidebar() {
        if (hamburger) hamburger.classList.toggle('active');
        if (sidebar) sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }

    if (hamburger) hamburger.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    if (sidebar) {
        sidebar.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (hamburger) hamburger.classList.remove('active');
                sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            });
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });

    updateNavbarAuth();
}

document.addEventListener('DOMContentLoaded', initNav);