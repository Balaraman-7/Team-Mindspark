// --- INITIALIZATION & MOCK DATA ---
const mockProjects = [
    { id: 1, title: "Smart Irrigation Drone", sector: "Agriculture", desc: "Autonomous drone that monitors soil moisture levels.", needed: 5000, raised: 3200, author: "student@test.com" },
    { id: 2, title: "3D Printed Prosthetic", sector: "Medical", desc: "Affordable prosthetics using recycled plastic.", needed: 1500, raised: 1500, author: "jane@test.com" },
    { id: 3, title: "AI Tutor for Kids", sector: "Technology", desc: "Personalized learning algorithms for rural education.", needed: 3000, raised: 500, author: "mike@test.com" }
];

const mockNeeds = [
    { id: 1, title: "Low-Cost Water Filter", sector: "Technology", desc: "Looking for a filter design under $5 per unit.", donor: "Global Relief Fund" },
    { id: 2, title: "Heart Rate Monitor App", sector: "Medical", desc: "Need a student team to build a React Native app.", donor: "HealthPlus" }
];

// Load Data
if (!localStorage.getItem('projects')) localStorage.setItem('projects', JSON.stringify(mockProjects));
if (!localStorage.getItem('needs')) localStorage.setItem('needs', JSON.stringify(mockNeeds));

// --- HELPERS ---
function getBadgeClass(sector) {
    if (sector === 'Medical') return 'badge-med';
    if (sector === 'Agriculture') return 'badge-agri';
    return 'badge-tech';
}

// --- AUTH LOGIC ---
function registerUser(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    const role = document.getElementById('reg-role').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        alert("Email already registered.");
        return;
    }
    users.push({ name, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration Successful! Please Login.");
    window.location.href = 'login.html';
}

function loginUser(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = user.role === 'student' ? 'student_dashboard.html' : 'donor_dashboard.html';
    } else {
        document.getElementById('error-msg').style.display = 'block';
        document.getElementById('error-msg').innerText = "Invalid email or password.";
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) window.location.href = 'login.html';
    document.getElementById('user-name').innerText = user.name;
    return user;
}

// --- DASHBOARD RENDER LOGIC ---

function loadStudentDash() {
    const user = checkAuth();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const needs = JSON.parse(localStorage.getItem('needs')) || [];

    // 1. My Projects
    const myProjs = projects.filter(p => p.author === user.email);
    const projContainer = document.getElementById('my-projects');

    if (myProjs.length === 0) {
        projContainer.innerHTML = <p style="text-align:center; padding:20px;">No projects posted yet.</p>;
    } else {
        projContainer.innerHTML = myProjs.map(p => `
            <div class="card item-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>${p.title}</h3>
                    <span class="badge ${getBadgeClass(p.sector)}">${p.sector}</span>
                </div>
                <p>${p.desc}</p>
                <div class="progress-container">
                    <div class="progress-fill" style="width:${Math.min((p.raised / p.needed) * 100, 100)}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                    <strong>Raised: $${p.raised}</strong>
                    <span style="color:#6b7280;">Goal: $${p.needed}</span>
                </div>
            </div>
        `).join('');
    }

    // 2. Donor Needs
    const needsContainer = document.getElementById('donor-needs');
    needsContainer.innerHTML = needs.map(n => `
        <div class="card item-card" style="border-left: 4px solid var(--primary);">
            <h3>${n.title}</h3>
            <div style="margin-bottom:10px;">
                <span class="badge ${getBadgeClass(n.sector)}">${n.sector}</span>
                <small>by ${n.donor}</small>
            </div>
            <p style="font-size:0.95rem;">${n.desc}</p>
            <button class="btn btn-outline btn-sm" onclick="alert('Contact details sent to your email.')">Contact Donor</button>
        </div>
    `).join('');
}

function loadDonorDash() {
    const user = checkAuth();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    // Calculate Stats
    let totalFunded = 0; // In a real app, track this per user
    // For demo, we just show a static number or sum of all

    // Render Feed
    const feed = document.getElementById('project-feed');
    feed.innerHTML = projects.map(p => `
        <div class="card item-card">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h3>${p.title}</h3>
                    <span class="badge ${getBadgeClass(p.sector)}">${p.sector}</span>
                </div>
                <div style="text-align:right;">
                    <small>by ${p.author}</small>
                </div>
            </div>
            <p style="margin-top:10px;">${p.desc}</p>
            
            <div class="progress-container">
                <div class="progress-fill" style="width:${Math.min((p.raised / p.needed) * 100, 100)}%"></div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <small>Raised: <b>$${p.raised}</b></small>
                <small>Goal: <b>$${p.needed}</b></small>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button onclick="fundProject(${p.id})" class="btn">Fund Project</button>
                <button class="btn btn-outline" onclick="alert('Message sent to student.')">Ask Question</button>
            </div>
        </div>
    `).join('');
}

// --- ACTIONS ---
function postProject(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const title = document.getElementById('p-title').value;
    const desc = document.getElementById('p-desc').value;
    const sector = document.getElementById('p-sector').value;
    const needed = document.getElementById('p-needed').value;

    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.unshift({ // Add to top
        id: Date.now(),
        title, desc, sector, needed,
        raised: 0,
        author: user.email
    });

    localStorage.setItem('projects', JSON.stringify(projects));
    alert("Project Posted Successfully!");
    window.location.reload();
}

function postNeed(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const title = document.getElementById('n-title').value;
    const desc = document.getElementById('n-desc').value;
    const sector = document.getElementById('n-sector').value;

    const needs = JSON.parse(localStorage.getItem('needs')) || [];
    needs.unshift({ id: Date.now(), title, desc, sector, donor: user.name });
    localStorage.setItem('needs', JSON.stringify(needs));
    alert("Need Posted Successfully!");
    window.location.reload();
}

function fundProject(id) {
    const amount = prompt("Enter funding amount ($):");
    if (amount && !isNaN(amount)) {
        const projects = JSON.parse(localStorage.getItem('projects'));
        const proj = projects.find(p => p.id === id);
        proj.raised = parseInt(proj.raised) + parseInt(amount);
        localStorage.setItem('projects', JSON.stringify(projects));
        alert(Thank you! You funded $${amount} to ${proj.title}.);
        window.location.reload();
    }
}