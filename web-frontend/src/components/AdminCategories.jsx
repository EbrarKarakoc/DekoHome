import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { api, getApiErrorMessage } from '../api/client';
import styles from './Admin.module.css';

function flattenCategoryTree(nodes, pathPrefix = '') {
  const rows = [];
  if (!Array.isArray(nodes)) return rows;
  for (const node of nodes) {
    const id = String(node._id ?? node.id ?? '');
    const name = node.name ?? '';
    const desc = node.description ?? '';
    const parentRaw = node.parentCategoryId;
    const parentId =
      parentRaw != null && parentRaw !== ''
        ? typeof parentRaw === 'object' && parentRaw.$oid
          ? parentRaw.$oid
          : String(parentRaw)
        : '';
    const hierLabel = pathPrefix ? `${pathPrefix} › ${name}` : name;
    rows.push({
      _id: id,
      name,
      description: desc,
      parentCategoryId: parentId,
      hierarchyLabel: hierLabel,
    });
    if (node.children?.length) {
      rows.push(...flattenCategoryTree(node.children, pathPrefix ? `${pathPrefix} › ${name}` : name));
    }
  }
  return rows;
}

/** Alt öğe id'leri — üst kategori seçiminde döngüyü önlemek için */
function collectIdsUnder(tree, targetId) {
  const idStr = String(targetId);
  for (const node of tree || []) {
    if (String(node._id ?? node.id) === idStr) {
      const ids = [];
      const stack = [...(node.children || [])];
      while (stack.length) {
        const n = stack.pop();
        ids.push(String(n._id ?? n.id));
        if (n.children?.length) stack.push(...n.children);
      }
      return ids;
    }
    const inner = collectIdsUnder(node.children || [], targetId);
    if (inner.length) return inner;
  }
  return [];
}

export default function AdminCategories() {
  const [tree, setTree] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');

  const loadCategories = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      const list = Array.isArray(data) ? data : [];
      setTree(list);
      setRows(flattenCategoryTree(list));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Liste alınamadı'));
      setTree([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const parentOptions = useMemo(() => {
    const opts = [{ value: '', label: '(Kök kategori)' }];
    for (const r of rows) {
      opts.push({ value: r._id, label: r.hierarchyLabel || r.name });
    }
    return opts;
  }, [rows]);

  const forbiddenParentIds = useMemo(() => {
    if (modalMode !== 'edit' || !editingId) return new Set();
    const blocked = new Set([String(editingId), ...collectIdsUnder(tree, editingId)]);
    return blocked;
  }, [modalMode, editingId, tree]);

  const openCreate = () => {
    setError('');
    setModalMode('create');
    setEditingId(null);
    setName('');
    setDescription('');
    setParentCategoryId('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setError('');
    setModalMode('edit');
    setEditingId(row._id);
    setName(row.name);
    setDescription(row.description ?? '');
    setParentCategoryId(row.parentCategoryId ? String(row.parentCategoryId) : '');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setError('');
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        parentCategoryId: parentCategoryId || null,
      };

      if (modalMode === 'create') {
        await api.post('/categories', body);
      } else {
        await api.put(`/categories/${editingId}`, body);
      }

      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      const msg = axios.isAxiosError(err) && err.response?.status === 401
        ? 'Oturum süresi doldu.'
        : getApiErrorMessage(err);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.categoriesPage}>
      <div className={styles.categoriesToolbar}>
        <h1 className={styles.categoriesTitle}>Kategori Yönetimi</h1>
        <button type="button" className={styles.btnPrimary} onClick={openCreate}>
          <Plus className={styles.btnIcon} strokeWidth={2.2} aria-hidden />
          Yeni Kategori Ekle
        </button>
      </div>

      {error && !modalOpen && <p className={styles.inlineError}>{error}</p>}

      {loading ? (
        <div className={styles.centered}>
          <Loader2 className={styles.spinner} aria-hidden />
          <span className={styles.muted}>Yükleniyor…</span>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>İsim</th>
                <th>Açıklama</th>
                <th className={styles.colNarrow}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.emptyCell}>
                    Kayıt yok.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <span className={styles.cellName}>{row.name}</span>
                      <span className={styles.hierarchyHint}>{row.hierarchyLabel}</span>
                    </td>
                    <td className={styles.cellDesc}>{row.description || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className={styles.btnIconSm} strokeWidth={2} aria-hidden />
                        Güncelle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closeModal();
          }}
        >
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cat-modal-title"
          >
            <div className={styles.modalHead}>
              <h2 id="cat-modal-title" className={styles.modalTitle}>
                {modalMode === 'create' ? 'Yeni Kategori' : 'Kategoriyi Güncelle'}
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {error && <p className={styles.modalError}>{error}</p>}
              <label className={styles.field}>
                <span className={styles.fieldLabel}>İsim</span>
                <input
                  className={styles.fieldInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="off"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Açıklama</span>
                <textarea
                  className={styles.fieldTextarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Hiyerarşi — üst kategori</span>
                <select
                  className={styles.fieldSelect}
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                >
                  {parentOptions
                    .filter((o) => {
                      if (o.value === '') return true;
                      if (forbiddenParentIds.has(o.value)) return false;
                      return true;
                    })
                    .map((o) => (
                      <option key={o.value || 'root'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </select>
                <span className={styles.fieldHint}>
                  Kök kategori için üst alan boş bırakılır; alt kategori için üst öğeyi seçin.
                </span>
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnMuted}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Vazgeç
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className={styles.btnIconSpin} aria-hidden />
                      Kaydediliyor…
                    </>
                  ) : modalMode === 'create' ? (
                    'Oluştur'
                  ) : (
                    'Kaydet'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
