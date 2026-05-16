import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { api, getApiErrorMessage } from '../api/client';
import styles from './Admin.module.css';

function flattenCategoryTree(nodes, pathPrefix = '') {
  const rows = [];
  if (!Array.isArray(nodes)) return rows;
  for (const node of nodes) {
    const id = String(node._id ?? node.id ?? '');
    if (!id) continue;
    const name = node.name ?? '';
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
      parentCategoryId: parentId,
      hierarchyLabel: hierLabel,
    });
    if (node.children?.length) {
      rows.push(
        ...flattenCategoryTree(
          node.children,
          pathPrefix ? `${pathPrefix} › ${name}` : name
        )
      );
    }
  }
  return rows;
}

/**
 * @param {{
 *   product?: object | null;
 *   onSuccess?: () => void;
 *   onCancel?: () => void;
 * }} props
 */
export default function ProductForm({ product = null, onSuccess, onCancel }) {
  const productId = product
    ? String(product.id ?? product._id ?? '')
    : '';
  const isEdit = Boolean(productId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [categoryRows, setCategoryRows] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadCategories = useCallback(async () => {
    setCategoriesError('');
    setCategoriesLoading(true);
    try {
      const { data } = await api.get('/categories');
      const list = Array.isArray(data) ? data : [];
      setCategoryRows(flattenCategoryTree(list));
    } catch (e) {
      setCategoriesError(getApiErrorMessage(e, 'Kategori listesi alınamadı'));
      setCategoryRows([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setFormError('');
    if (!product) {
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
      return;
    }
    setName(product.name ?? '');
    setDescription(product.description ?? product.desc ?? '');
    setPrice(
      product.price != null && product.price !== ''
        ? String(product.price)
        : ''
    );
    setStock(
      product.stock != null && product.stock !== ''
        ? String(product.stock)
        : ''
    );
    setCategoryId(
      product.categoryId != null && product.categoryId !== ''
        ? String(product.categoryId)
        : ''
    );
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nameTrim = name.trim();
    const descTrim = description.trim();
    const priceNum = parseFloat(String(price).replace(',', '.'));
    const stockTrim = String(stock).trim();
    let stockFinal;
    if (stockTrim === '') {
      stockFinal = isEdit ? Number(product?.stock ?? 0) : 10;
    } else {
      const n = parseInt(stockTrim, 10);
      stockFinal = Number.isNaN(n) ? (isEdit ? Number(product?.stock ?? 0) : 10) : n;
    }

    if (!nameTrim) {
      setFormError('Ürün adı zorunludur.');
      return;
    }
    if (!descTrim) {
      setFormError('Açıklama zorunludur.');
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFormError('Geçerli bir fiyat girin.');
      return;
    }
    if (!categoryId) {
      setFormError('Bir kategori seçin.');
      return;
    }
    if (stockFinal < 0 || !Number.isInteger(stockFinal)) {
      setFormError('Stok 0 veya pozitif tam sayı olmalıdır.');
      return;
    }

    const body = {
      name: nameTrim,
      description: descTrim,
      price: priceNum,
      categoryId,
      stock: stockFinal,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/products/${productId}`, body);
      } else {
        await api.post('/products', body);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setFormError('Oturum süresi doldu.');
      } else {
        setFormError(getApiErrorMessage(err, 'İstek gönderilemedi.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.productForm} onSubmit={handleSubmit} noValidate>
      {categoriesLoading && (
        <p className={styles.fieldHint}>Kategoriler yükleniyor…</p>
      )}
      {categoriesError && (
        <p className={styles.inlineError}>{categoriesError}</p>
      )}

      {formError && <p className={styles.modalError}>{formError}</p>}

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Ürün adı</span>
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
          rows={4}
          required
        />
      </label>

      <div className={styles.productFormGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Fiyat (TL)</span>
          <input
            className={styles.fieldInput}
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Stok miktarı</span>
          <input
            className={styles.fieldInput}
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="10"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Kategori</span>
        <select
          className={styles.fieldSelect}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          disabled={categoriesLoading || categoryRows.length === 0}
        >
          <option value="">Kategori seçin…</option>
          {categoryRows.map((c) => (
            <option key={c._id} value={c._id}>
              {c.hierarchyLabel || c.name}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.productFormActions}>
        {onCancel && (
          <button
            type="button"
            className={styles.btnMuted}
            onClick={onCancel}
            disabled={submitting}
          >
            Vazgeç
          </button>
        )}
        <button type="submit" className={styles.btnPrimary} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className={styles.btnIconSpin} aria-hidden />
              Kaydediliyor…
            </>
          ) : isEdit ? (
            'Değişiklikleri Kaydet'
          ) : (
            'Ürün Oluştur'
          )}
        </button>
      </div>
    </form>
  );
}
