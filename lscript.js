
    /* ============================================================
       API CONFIG
       ============================================================ */
    const API_URL = 'api';
    // Relative path: works no matter what host/vhost you use,
    // as long as library.html is served from the same "library" folder
    // that contains the "api" folder (e.g. http://localhost/library/library.html
    // or http://library.test/library.html).

    /* ============================================================
       ADMIN CREDENTIALS
       ============================================================ */
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    /* ============================================================
       BOOKS STATE
       ============================================================ */
    let books = [];

    /* ============================================================
       API HELPER
       ============================================================ */
    async function apiRequest(path, options = {}) {
      const res = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    }

    /* ============================================================
       LOAD BOOKS FROM SERVER
       ============================================================ */
    async function loadBooks() {
      try {
        books = await apiRequest('/books.php');
        renderBooks();
      } catch (err) {
        console.error('Load failed:', err);
        document.getElementById('bookGrid').innerHTML = `
          <div class="empty-state">
            <span class="icon">⚠️</span>
            <h3>Could not connect to server</h3>
            <p>${escapeHtml(err.message)}. Make sure Laragon is running and the API is set up.</p>
          </div>
        `;
      }
    }

    /* ============================================================
       ADMIN LOGIN
       ============================================================ */
    function openAdminLogin() {
      document.getElementById('adminModal').classList.add('open');
      document.getElementById('adminUser').value = '';
      document.getElementById('adminPass').value = '';
      document.getElementById('loginError').classList.remove('show');
      setTimeout(() => document.getElementById('adminUser').focus(), 100);
    }

    function closeAdminLogin() {
      document.getElementById('adminModal').classList.remove('open');
    }

    function handleAdminLogin(event) {
      event.preventDefault();

      const username = document.getElementById('adminUser').value.trim();
      const password = document.getElementById('adminPass').value;
      const errorBox = document.getElementById('loginError');

      errorBox.classList.remove('show');

      if (!username || !password) {
        errorBox.textContent = '⚠️ Please fill in both fields';
        errorBox.classList.add('show');
        return false;
      }

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        closeAdminLogin();
        document.body.classList.add('admin-mode');
        showToast('👑 Welcome, Admin!');
        openAddBook();
      } else {
        errorBox.textContent = '❌ Invalid username or password';
        errorBox.classList.add('show');
        document.getElementById('adminPass').value = '';
        document.getElementById('adminPass').focus();
      }

      return false;
    }

    /* ============================================================
       ADD BOOK
       ============================================================ */
    function openAddBook() {
      document.getElementById('addBookModal').classList.add('open');
      document.getElementById('bookName').value     = '';
      document.getElementById('bookAuthor').value   = '';
      document.getElementById('bookCategory').value = '';
      document.getElementById('bookYear').value     = '';
      document.getElementById('bookLanguage').value = 'english';
      document.getElementById('bookDesc').value     = '';
      document.getElementById('bookImage').value    = '';
      setStatus('available');
      setTimeout(() => document.getElementById('bookName').focus(), 100);
    }

    function closeAddBook() {
      document.getElementById('addBookModal').classList.remove('open');
    }

    function setStatus(status) {
      document.querySelectorAll('#statusToggle .status-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === status);
      });
      document.getElementById('bookStatus').value = status;
    }

    document.querySelectorAll('#statusToggle .status-option').forEach(btn => {
      btn.addEventListener('click', () => setStatus(btn.dataset.status));
    });

    async function handleAddBook(event) {
      event.preventDefault();

      const newBook = {
        name:        document.getElementById('bookName').value.trim(),
        author:      document.getElementById('bookAuthor').value.trim(),
        category:    document.getElementById('bookCategory').value,
        year:        document.getElementById('bookYear').value,
        language:    document.getElementById('bookLanguage').value,
        description: document.getElementById('bookDesc').value.trim(),
        image:       document.getElementById('bookImage').value.trim(),
        status:      document.getElementById('bookStatus').value
      };

      if (!newBook.name || !newBook.author || !newBook.category || !newBook.description) {
        alert('⚠️ Please fill in all required fields.');
        return false;
      }

      try {
        await apiRequest('/books.php', {
          method: 'POST',
          body: JSON.stringify(newBook)
        });

        closeAddBook();
        showToast('✅ "' + newBook.name + '" added successfully!');
        await loadBooks();
      } catch (err) {
        alert('Failed to add book: ' + err.message);
        console.error(err);
      }
    }

    /* ============================================================
       DELETE BOOK — admin only
       ============================================================ */
    async function deleteBook(id) {
      if (!document.body.classList.contains('admin-mode')) {
        alert('❌ Only admin can delete books.');
        return;
      }

      const book = books.find(b => b.id === id);
      if (!book) return;

      if (!confirm('Delete "' + book.name + '"?\n\nThis cannot be undone.')) return;

      try {
        await apiRequest(`/book.php?id=${id}`, { method: 'DELETE' });
        showToast('🗑️ "' + book.name + '" deleted');
        await loadBooks();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }

    /* ============================================================
       BOOK DETAILS POPUP
       ============================================================ */
    function openDetail(id) {
      const book = books.find(b => b.id === id);
      if (!book) return;

      const coverEl = document.getElementById('detailCover');
      if (book.image) {
        coverEl.innerHTML = `<img src="${escapeHtml(book.image)}" alt="${escapeHtml(book.name)}">`;
      } else {
        coverEl.innerHTML = `<div class="fallback-title">${escapeHtml(book.name)}</div>`;
      }

      document.getElementById('detailTitle').textContent    = book.name;
      document.getElementById('detailAuthor').textContent   = book.author;
      document.getElementById('detailCategory').textContent = book.category || '—';
      document.getElementById('detailYear').textContent     = book.year || '—';
      document.getElementById('detailLanguage').textContent = book.language || '—';
      document.getElementById('detailDesc').textContent     = book.description || 'No description available.';

      const statusEl = document.getElementById('detailStatus');
      statusEl.textContent = book.status === 'available' ? '✅ Available' : '📕 Issued';
      statusEl.className = 'detail-status ' + book.status;

      document.getElementById('detailOverlay').classList.add('open');
    }

    function closeDetail() {
      document.getElementById('detailOverlay').classList.remove('open');
    }

    /* ============================================================
       RENDER BOOKS
       ============================================================ */
    function renderBooks() {
      const grid = document.getElementById('bookGrid');
      const count = document.getElementById('bookCount');

      count.textContent = books.length + (books.length === 1 ? ' Book' : ' Books');

      if (books.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <span class="icon">📚</span>
            <h3>No books yet</h3>
            <p>Click "+ Add Book" as admin to add your first book.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = books.map(book => {
        const cover = book.image
          ? `<img src="${escapeHtml(book.image)}" alt="${escapeHtml(book.name)}">`
          : `<div class="fallback-title">${escapeHtml(book.name)}</div>`;

        return `
          <article class="book-card">
            <button class="book-delete"
                    onclick="event.stopPropagation(); deleteBook(${book.id})"
                    title="Delete (admin only)">✕</button>

            <div class="book-cover" onclick="openDetail(${book.id})" title="Click to see details">
              ${cover}
              <span class="book-status-badge ${escapeHtml(book.status)}">
                ${book.status === 'available' ? '✅ Available' : '📕 Issued'}
              </span>
            </div>

            <div class="book-name-bar">
              <p class="name">${escapeHtml(book.name)}</p>
            </div>
          </article>
        `;
      }).join('');
    }

    /* ============================================================
       HELPERS
       ============================================================ */
    function escapeHtml(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function showToast(text) {
      const toast = document.getElementById('toastMsg');
      toast.textContent = text;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    /* ============================================================
       SEARCH — calls backend
       ============================================================ */
    async function handleSearch(event) {
      event.preventDefault();

      const q        = document.getElementById('searchInput').value.trim();
      const category = document.getElementById('filterCategory').value;
      const author   = document.getElementById('filterAuthor').value;
      const language = document.getElementById('filterLanguage').value;

      const params = new URLSearchParams();
      if (q)        params.append('q', q);
      if (category) params.append('category', category);
      if (author)   params.append('author', author);
      if (language) params.append('language', language);

      try {
        books = await apiRequest('/search.php?' + params.toString());
        renderBooks();
      } catch (err) {
        alert('Search failed: ' + err.message);
      }
    }

    /* ============================================================
       CLOSE OVERLAYS
       ============================================================ */
    document.querySelectorAll('.modal-overlay, .detail-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open, .detail-overlay.open')
          .forEach(m => m.classList.remove('open'));
      }
    });

    /* ============================================================
       INIT
       ============================================================ */
    loadBooks();
