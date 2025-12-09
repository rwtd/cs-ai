/**
 * Database Service - SQLite Backend
 * Abstraction layer for data persistence
 * 
 * Can be swapped out for Postgres, Firestore, etc. by implementing
 * the same interface in a different file.
 */

const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Database file location (can be configured via env)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'cs-ai.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // Better performance

// ============================================
// Schema Initialization
// ============================================
const initSchema = () => {
    db.exec(`
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            name TEXT,
            password_hash TEXT,
            role TEXT DEFAULT 'user',
            api_keys TEXT DEFAULT '{}',
            preferences TEXT DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Search history
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            search_type TEXT,
            query TEXT,
            params TEXT,
            response_summary TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Tracked ASINs
        CREATE TABLE IF NOT EXISTS tracked_asins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            asin TEXT NOT NULL,
            marketplace TEXT DEFAULT 'amazon.com',
            title TEXT,
            notes TEXT,
            target_price REAL,
            alert_enabled INTEGER DEFAULT 0,
            last_checked DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Price history for tracked ASINs
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asin TEXT NOT NULL,
            marketplace TEXT,
            price REAL,
            buybox_seller TEXT,
            buybox_price REAL,
            is_buybox_winner INTEGER,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- AI chat conversations (for assistant memory)
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            context TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Batch jobs
        CREATE TABLE IF NOT EXISTS batch_jobs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            job_type TEXT,
            status TEXT DEFAULT 'pending',
            input_data TEXT,
            output_data TEXT,
            progress INTEGER DEFAULT 0,
            error TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Create indexes for common queries
        CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_tracked_asins_user ON tracked_asins(user_id);
        CREATE INDEX IF NOT EXISTS idx_tracked_asins_asin ON tracked_asins(asin);
        CREATE INDEX IF NOT EXISTS idx_price_history_asin ON price_history(asin);
        CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
    `);

    console.log('✅ Database schema initialized');
};

// Initialize on load
initSchema();

// ============================================
// User Service
// ============================================
const UserService = {
    create(email, name, role = 'user') {
        const id = crypto.randomUUID();
        const stmt = db.prepare(`
            INSERT INTO users (id, email, name, role)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(id, email, name, role);
        return this.getById(id);
    },

    getById(id) {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        if (user) {
            user.api_keys = JSON.parse(user.api_keys || '{}');
            user.preferences = JSON.parse(user.preferences || '{}');
        }
        return user;
    },

    getByEmail(email) {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);
        if (user) {
            user.api_keys = JSON.parse(user.api_keys || '{}');
            user.preferences = JSON.parse(user.preferences || '{}');
        }
        return user;
    },

    list() {
        const stmt = db.prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
        return stmt.all();
    },

    update(id, data) {
        const updates = [];
        const values = [];

        if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
        if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
        if (data.role !== undefined) { updates.push('role = ?'); values.push(data.role); }
        if (data.password_hash !== undefined) { updates.push('password_hash = ?'); values.push(data.password_hash); }
        if (data.api_keys !== undefined) { updates.push('api_keys = ?'); values.push(JSON.stringify(data.api_keys)); }
        if (data.preferences !== undefined) { updates.push('preferences = ?'); values.push(JSON.stringify(data.preferences)); }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        return this.getById(id);
    },

    getAll() {
        // Return all users including password_hash for auth checking
        const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
        return stmt.all().map(user => {
            user.api_keys = JSON.parse(user.api_keys || '{}');
            user.preferences = JSON.parse(user.preferences || '{}');
            return user;
        });
    },

    delete(id) {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        return stmt.run(id);
    }
};

// ============================================
// Search History Service
// ============================================
const SearchHistoryService = {
    add(userId, searchType, query, params, responseSummary) {
        const stmt = db.prepare(`
            INSERT INTO search_history (user_id, search_type, query, params, response_summary)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(userId, searchType, query, JSON.stringify(params), responseSummary);
    },

    getByUser(userId, limit = 50) {
        const stmt = db.prepare(`
            SELECT * FROM search_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `);
        return stmt.all(userId, limit);
    },

    getRecent(limit = 20) {
        const stmt = db.prepare(`
            SELECT sh.*, u.email as user_email 
            FROM search_history sh
            LEFT JOIN users u ON sh.user_id = u.id
            ORDER BY sh.created_at DESC 
            LIMIT ?
        `);
        return stmt.all(limit);
    }
};

// ============================================
// ASIN Tracking Service
// ============================================
const AsinService = {
    track(userId, asin, marketplace, title, notes, targetPrice) {
        const stmt = db.prepare(`
            INSERT INTO tracked_asins (user_id, asin, marketplace, title, notes, target_price)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(userId, asin.toUpperCase(), marketplace, title, notes, targetPrice);
    },

    getByUser(userId) {
        const stmt = db.prepare(`
            SELECT * FROM tracked_asins 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `);
        return stmt.all(userId);
    },

    getByAsin(asin) {
        const stmt = db.prepare('SELECT * FROM tracked_asins WHERE asin = ?');
        return stmt.all(asin.toUpperCase());
    },

    update(id, data) {
        const updates = [];
        const values = [];

        if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
        if (data.notes !== undefined) { updates.push('notes = ?'); values.push(data.notes); }
        if (data.target_price !== undefined) { updates.push('target_price = ?'); values.push(data.target_price); }
        if (data.alert_enabled !== undefined) { updates.push('alert_enabled = ?'); values.push(data.alert_enabled ? 1 : 0); }
        if (data.last_checked !== undefined) { updates.push('last_checked = ?'); values.push(data.last_checked); }

        values.push(id);
        const stmt = db.prepare(`UPDATE tracked_asins SET ${updates.join(', ')} WHERE id = ?`);
        return stmt.run(...values);
    },

    delete(id) {
        const stmt = db.prepare('DELETE FROM tracked_asins WHERE id = ?');
        return stmt.run(id);
    },

    recordPrice(asin, marketplace, price, buyboxSeller, buyboxPrice, isBuyboxWinner) {
        const stmt = db.prepare(`
            INSERT INTO price_history (asin, marketplace, price, buybox_seller, buybox_price, is_buybox_winner)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(asin.toUpperCase(), marketplace, price, buyboxSeller, buyboxPrice, isBuyboxWinner ? 1 : 0);
    },

    getPriceHistory(asin, days = 30) {
        const stmt = db.prepare(`
            SELECT * FROM price_history 
            WHERE asin = ? AND recorded_at > datetime('now', '-' || ? || ' days')
            ORDER BY recorded_at ASC
        `);
        return stmt.all(asin.toUpperCase(), days);
    }
};

// ============================================
// Chat History Service (AI Memory)
// ============================================
const ChatService = {
    addMessage(userId, sessionId, role, content, context = null) {
        const stmt = db.prepare(`
            INSERT INTO chat_history (user_id, session_id, role, content, context)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(userId, sessionId, role, content, context ? JSON.stringify(context) : null);
    },

    getSession(sessionId, limit = 50) {
        const stmt = db.prepare(`
            SELECT * FROM chat_history 
            WHERE session_id = ? 
            ORDER BY created_at ASC 
            LIMIT ?
        `);
        return stmt.all(sessionId, limit);
    },

    getUserSessions(userId) {
        const stmt = db.prepare(`
            SELECT session_id, MIN(created_at) as started_at, MAX(created_at) as last_message,
                   COUNT(*) as message_count
            FROM chat_history 
            WHERE user_id = ?
            GROUP BY session_id
            ORDER BY last_message DESC
        `);
        return stmt.all(userId);
    }
};

// ============================================
// Batch Jobs Service
// ============================================
const BatchService = {
    create(userId, jobType, inputData) {
        const id = crypto.randomUUID();
        const stmt = db.prepare(`
            INSERT INTO batch_jobs (id, user_id, job_type, input_data)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(id, userId, jobType, JSON.stringify(inputData));
        return id;
    },

    get(id) {
        const stmt = db.prepare('SELECT * FROM batch_jobs WHERE id = ?');
        const job = stmt.get(id);
        if (job) {
            job.input_data = JSON.parse(job.input_data || '{}');
            job.output_data = JSON.parse(job.output_data || '{}');
        }
        return job;
    },

    updateProgress(id, progress, status = 'running') {
        const stmt = db.prepare('UPDATE batch_jobs SET progress = ?, status = ? WHERE id = ?');
        return stmt.run(progress, status, id);
    },

    complete(id, outputData) {
        const stmt = db.prepare(`
            UPDATE batch_jobs 
            SET status = 'completed', output_data = ?, progress = 100, completed_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(JSON.stringify(outputData), id);
    },

    fail(id, error) {
        const stmt = db.prepare(`
            UPDATE batch_jobs 
            SET status = 'failed', error = ?, completed_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(error, id);
    },

    getByUser(userId) {
        const stmt = db.prepare('SELECT * FROM batch_jobs WHERE user_id = ? ORDER BY created_at DESC');
        return stmt.all(userId);
    }
};

// ============================================
// Export All Services
// ============================================
module.exports = {
    db,
    UserService,
    SearchHistoryService,
    AsinService,
    ChatService,
    BatchService
};

console.log('✅ Database service loaded');
