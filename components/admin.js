/**
 * Admin Panel Component
 * Simple user management for CS-AI
 */

ComponentRegistry.register('admin', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🛡️ Admin Panel</h1>
                <p class="page-subtitle">Manage users and system settings</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" id="addUserBtn">
                    <span>➕</span> Add User
                </button>
            </div>
        </div>

        <div class="admin-grid">
            <!-- Users Section -->
            <div class="card">
                <div class="card-header">
                    <h3>👥 Users</h3>
                    <span class="card-badge" id="userCount">Loading...</span>
                </div>
                <div class="admin-users-list" id="usersList">
                    <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                        Loading users...
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="card">
                <div class="card-header">
                    <h3>📊 System Stats</h3>
                </div>
                <div class="admin-stats" id="adminStats">
                    <div class="admin-stat-item">
                        <span class="admin-stat-value" id="statUsers">-</span>
                        <span class="admin-stat-label">Users</span>
                    </div>
                    <div class="admin-stat-item">
                        <span class="admin-stat-value" id="statSearches">-</span>
                        <span class="admin-stat-label">Searches</span>
                    </div>
                    <div class="admin-stat-item">
                        <span class="admin-stat-value" id="statAsins">-</span>
                        <span class="admin-stat-label">Tracked ASINs</span>
                    </div>
                    <div class="admin-stat-item">
                        <span class="admin-stat-value" id="statDb">-</span>
                        <span class="admin-stat-label">DB Status</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit User Modal -->
        <div class="modal-overlay" id="userModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle">➕ Add User</h3>
                    <button class="modal-close" id="closeModal">✕</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="editUserId">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="userEmail" placeholder="user@example.com">
                    </div>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="userName" placeholder="Full Name">
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <select id="userRole">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="form-group" id="passwordGroup">
                        <label>Password <span style="color: var(--text-muted); font-weight: normal;">(leave blank to keep unchanged)</span></label>
                        <input type="password" id="userPassword" placeholder="Enter password">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveUserBtn">Save User</button>
                </div>
            </div>
        </div>
    `,

    init: async function () {
        await this.loadUsers();
        await this.loadStats();
        this.bindEvents();
    },

    loadUsers: async function () {
        const usersList = document.getElementById('usersList');
        const userCount = document.getElementById('userCount');

        try {
            const response = await fetch('/api/users');
            const users = await response.json();

            userCount.textContent = `${users.length} users`;
            document.getElementById('statUsers').textContent = users.length;

            if (users.length === 0) {
                usersList.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                        <div style="font-size: 2rem; margin-bottom: 12px;">👤</div>
                        <p>No users yet</p>
                        <p style="font-size: 0.85rem;">Click "Add User" to create the first user</p>
                    </div>
                `;
                return;
            }

            usersList.innerHTML = users.map(user => `
                <div class="admin-user-row" data-id="${user.id}">
                    <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
                    <div class="user-info">
                        <span class="user-name">${user.name || 'Unnamed'}</span>
                        <span class="user-email">${user.email}</span>
                    </div>
                    <span class="user-role ${user.role}">${user.role}</span>
                    <div class="user-actions">
                        <button class="btn-icon-sm change-password" data-id="${user.id}" title="Change Password">🔒</button>
                        <button class="btn-icon-sm edit-user" data-id="${user.id}" title="Edit">✏️</button>
                        <button class="btn-icon-sm delete-user" data-id="${user.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            usersList.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--accent-red);">
                    ❌ Failed to load users: ${error.message}
                </div>
            `;
        }
    },

    loadStats: async function () {
        try {
            const searchResponse = await fetch('/api/search-history?limit=1000');
            const searches = await searchResponse.json();
            document.getElementById('statSearches').textContent = searches.length;
        } catch {
            document.getElementById('statSearches').textContent = '0';
        }

        try {
            const asinResponse = await fetch('/api/tracked-asins');
            const asins = await asinResponse.json();
            document.getElementById('statAsins').textContent = asins.length;
        } catch {
            document.getElementById('statAsins').textContent = '0';
        }

        document.getElementById('statDb').textContent = '✓ Online';
    },

    bindEvents: function () {
        const component = this;
        const modal = document.getElementById('userModal');

        // Add User button
        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = '➕ Add User';
            document.getElementById('editUserId').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userName').value = '';
            document.getElementById('userRole').value = 'user';
            document.getElementById('userPassword').value = '';
            document.getElementById('passwordGroup').style.display = 'block';
            modal.style.display = 'flex';
        });

        // Close modal
        document.getElementById('closeModal')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.getElementById('cancelBtn')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Click outside to close
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Save user
        document.getElementById('saveUserBtn')?.addEventListener('click', async () => {
            const id = document.getElementById('editUserId').value;
            const email = document.getElementById('userEmail').value.trim();
            const name = document.getElementById('userName').value.trim();
            const role = document.getElementById('userRole').value;

            if (!email) {
                window.app.showToast('⚠️ Email is required');
                return;
            }

            const password = document.getElementById('userPassword').value;

            try {
                if (id) {
                    // Update existing user
                    await fetch(`/api/users/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, name, role })
                    });
                    // Update password if provided
                    if (password) {
                        await fetch(`/api/users/${id}/password`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ password })
                        });
                    }
                    window.app.showToast('✅ User updated');
                } else {
                    // Create new user
                    const createResponse = await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, name, role })
                    });
                    const newUser = await createResponse.json();
                    // Set password if provided
                    if (password && newUser.id) {
                        await fetch(`/api/users/${newUser.id}/password`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ password })
                        });
                    }
                    window.app.showToast('✅ User created');
                }

                modal.style.display = 'none';
                component.loadUsers();
                component.loadStats();
            } catch (error) {
                window.app.showToast(`❌ Error: ${error.message}`);
            }
        });

        // Edit user
        document.getElementById('usersList')?.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-user');
            const deleteBtn = e.target.closest('.delete-user');

            if (editBtn) {
                const id = editBtn.dataset.id;
                try {
                    const response = await fetch(`/api/users/${id}`);
                    const user = await response.json();

                    document.getElementById('modalTitle').textContent = '✏️ Edit User';
                    document.getElementById('editUserId').value = user.id;
                    document.getElementById('userEmail').value = user.email;
                    document.getElementById('userName').value = user.name || '';
                    document.getElementById('userRole').value = user.role;
                    document.getElementById('userPassword').value = '';
                    document.getElementById('passwordGroup').style.display = 'block';
                    modal.style.display = 'flex';
                } catch (error) {
                    window.app.showToast(`❌ Error loading user: ${error.message}`);
                }
            }

            // Change password button
            const pwBtn = e.target.closest('.change-password');
            if (pwBtn) {
                const id = pwBtn.dataset.id;
                const newPassword = prompt('Enter new password for this user (min 6 characters):');
                if (newPassword) {
                    if (newPassword.length < 6) {
                        window.app.showToast('⚠️ Password must be at least 6 characters');
                        return;
                    }
                    try {
                        await fetch(`/api/users/${id}/password`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ password: newPassword })
                        });
                        window.app.showToast('✅ Password updated');
                    } catch (error) {
                        window.app.showToast(`❌ Error: ${error.message}`);
                    }
                }
            }

            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (confirm('Are you sure you want to delete this user?')) {
                    try {
                        await fetch(`/api/users/${id}`, { method: 'DELETE' });
                        window.app.showToast('🗑️ User deleted');
                        component.loadUsers();
                        component.loadStats();
                    } catch (error) {
                        window.app.showToast(`❌ Error: ${error.message}`);
                    }
                }
            }
        });
    }
});

console.log('✅ Admin component loaded');
