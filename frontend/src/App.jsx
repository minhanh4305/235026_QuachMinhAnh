import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api';
import './index.css';

// ─── Toast ───────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'} {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── Book Form Modal ──────────────────────────────────────
const EMPTY = { bookId: '', title: '', author: '', price: '', category: '', description: '' };

function BookFormModal({ book, onClose, onSaved, push }) {
  const [form, setForm] = useState(book ? {
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    price: book.price,
    category: book.category || '',
    description: book.description || ''
  } : EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.bookId.trim()) e.bookId = 'Bắt buộc';
    if (!form.title.trim()) e.title = 'Bắt buộc';
    if (!form.author.trim()) e.author = 'Bắt buộc';
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = 'Giá phải là số không âm';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (book) await api.updateBook(book._id, payload);
      else await api.createBook(payload);
      push(book ? 'Cập nhật sách thành công!' : 'Thêm sách thành công!');
      onSaved();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{book ? '✏️ Cập nhật sách' : '➕ Thêm sách mới'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã sách *</label>
              <input className="form-control" value={form.bookId} onChange={set('bookId')}
                placeholder="VD: B004" disabled={!!book} />
              {errors.bookId && <span className="form-error">{errors.bookId}</span>}
            </div>
            <div className="form-group">
              <label>Giá (VNĐ) *</label>
              <input className="form-control" type="number" value={form.price} onChange={set('price')}
                placeholder="VD: 150000" min="0" />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-group full">
              <label>Tên sách *</label>
              <input className="form-control" value={form.title} onChange={set('title')}
                placeholder="Nhập tên sách" />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label>Tác giả *</label>
              <input className="form-control" value={form.author} onChange={set('author')}
                placeholder="Tên tác giả" />
              {errors.author && <span className="form-error">{errors.author}</span>}
            </div>
            <div className="form-group">
              <label>Thể loại</label>
              <input className="form-control" value={form.category} onChange={set('category')}
                placeholder="VD: Lập trình" />
            </div>
            <div className="form-group full">
              <label>Mô tả</label>
              <textarea className="form-control" value={form.description} onChange={set('description')}
                placeholder="Mô tả ngắn về cuốn sách..." />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : (book ? 'Cập nhật' : 'Thêm sách')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Book Detail Modal ────────────────────────────────────
function BookDetailModal({ bookId, onClose, onEdit, onDelete }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.getBook(bookId)
      .then(setBook)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [bookId]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">📖 Chi tiết sách</div>
        {loading && <div className="state-box"><div className="spinner" /><p>Đang tải...</p></div>}
        {err && <div className="state-box"><p style={{ color: 'var(--danger)' }}>⚠ {err}</p></div>}
        {book && (
          <>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Mã sách</label>
                <span>{book.bookId}</span>
              </div>
              <div className="detail-item">
                <label>Giá</label>
                <span className="detail-price">{Number(book.price).toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="detail-item full">
                <label>Tên sách</label>
                <span>{book.title}</span>
              </div>
              <div className="detail-item">
                <label>Tác giả</label>
                <span>{book.author}</span>
              </div>
              <div className="detail-item">
                <label>Thể loại</label>
                <span>{book.category || '—'}</span>
              </div>
              {book.description && (
                <div className="detail-item detail-desc">
                  <label>Mô tả</label>
                  <span>{book.description}</span>
                </div>
              )}
              <div className="detail-item">
                <label>Ngày thêm</label>
                <span>{new Date(book.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(book)}>Xoá</button>
              <button className="btn btn-primary" onClick={() => onEdit(book)}>Chỉnh sửa</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────
function ConfirmModal({ book, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">🗑 Xác nhận xoá</div>
        <p className="confirm-msg">
          Bạn có chắc muốn xoá sách{' '}
          <span className="confirm-name">"{book.title}"</span>?{' '}
          Hành động này không thể hoàn tác.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Huỷ</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xoá...' : 'Xoá sách'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Book Card ────────────────────────────────────────────
function BookCard({ book, onView, onEdit, onDelete }) {
  return (
    <div className="book-card" onClick={() => onView(book._id)}>
      <div className="book-id">{book.bookId}</div>
      <div className="book-title">{book.title}</div>
      <div className="book-author">✍ {book.author}</div>
      <div className="book-meta">
        <div className="book-price">{Number(book.price).toLocaleString('vi-VN')}₫</div>
        <div className="book-category">{book.category || 'Chưa phân loại'}</div>
      </div>
      <div className="book-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(book)}>✏ Sửa</button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(book)}>🗑 Xoá</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────
export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'detail' | 'confirm'
  const [selected, setSelected] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const { toasts, push } = useToast();
  const searchRef = useRef(null);

  const fetchBooks = useCallback(async (q = search) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBooks(q);
      setBooks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchBooks(''); }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchBooks(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleView = (id) => { setSelected(id); setModal('detail'); };
  const handleEdit = (book) => { setSelected(book); setModal('edit'); };
  const handleDelete = (book) => { setSelected(book); setModal('confirm'); };

  const handleDeleteConfirm = async () => {
    setDelLoading(true);
    try {
      await api.deleteBook(selected._id);
      push(`Đã xoá "${selected.title}"`);
      closeModal();
      fetchBooks();
    } catch (e) {
      push(e.message, 'error');
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-logo">📚 BookManager</div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          ＋ Thêm sách
        </button>
      </nav>

      <div className="container">
        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Tổng số sách</div>
            <div className="stat-value">{books.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Kết quả tìm kiếm</div>
            <div className="stat-value">{search ? books.length : '—'}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, tác giả, mã sách, thể loại..."
            />
          </div>
          {search && (
            <button className="btn btn-secondary" onClick={() => setSearch('')}>✕ Xoá filter</button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="state-box">
            <div className="spinner" />
            <p>Đang tải danh sách sách...</p>
          </div>
        ) : error ? (
          <div className="state-box">
            <div className="icon">⚠️</div>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => fetchBooks()}>
              Thử lại
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="state-box">
            <div className="icon">{search ? '🔍' : '📭'}</div>
            <p>{search ? `Không tìm thấy sách với từ khoá "${search}"` : 'Chưa có sách nào. Hãy thêm sách mới!'}</p>
          </div>
        ) : (
          <div className="book-grid">
            {books.map(book => (
              <BookCard
                key={book._id}
                book={book}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <BookFormModal onClose={closeModal} onSaved={() => { closeModal(); fetchBooks(); }} push={push} />
      )}
      {modal === 'edit' && selected && (
        <BookFormModal book={selected} onClose={closeModal} onSaved={() => { closeModal(); fetchBooks(); }} push={push} />
      )}
      {modal === 'detail' && selected && (
        <BookDetailModal
          bookId={selected}
          onClose={closeModal}
          onEdit={(b) => { setSelected(b); setModal('edit'); }}
          onDelete={(b) => { setSelected(b); setModal('confirm'); }}
        />
      )}
      {modal === 'confirm' && selected && (
        <ConfirmModal
          book={selected}
          onClose={closeModal}
          onConfirm={handleDeleteConfirm}
          loading={delLoading}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
