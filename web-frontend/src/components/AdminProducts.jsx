import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Trash2, ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react';
import ProductForm from './ProductForm.jsx';
import { api, getApiErrorMessage } from '../api/client';
import styles from './Admin.module.css';

const PAGE_SIZE = 10;

/**
 * Mock GET yanıtında tüm ürünler tek seferde dönebilir; istenen sayfa/limit için dilimle.
 */
function normalizeProductsPayload(data, requestedPage, requestedLimit) {
  const raw = Array.isArray(data?.products) ? data.products : [];
  const pag = data?.pagination || {};
  const totalFromApi = typeof pag.total === 'number' ? pag.total : raw.length;
  const apiPages = typeof pag.pages === 'number' ? pag.pages : 1;
  const apiLimit = typeof pag.limit === 'number' ? pag.limit : requestedLimit;

  const needsClientSlice =
    raw.length > requestedLimit &&
    apiPages === 1 &&
    (apiLimit >= raw.length || apiLimit >= totalFromApi);

  if (needsClientSlice) {
    const total = raw.length;
    const pages = Math.max(1, Math.ceil(total / requestedLimit));
    const safePage = Math.min(requestedPage, pages);
    const start = (safePage - 1) * requestedLimit;
    return {
      products: raw.slice(start, start + requestedLimit),
      pagination: {
        total,
        page: safePage,
        pages,
        limit: requestedLimit,
      },
    };
  }

  return {
    products: raw,
    pagination: {
      total: totalFromApi,
      page: pag.page ?? requestedPage,
      pages: apiPages || Math.max(1, Math.ceil(totalFromApi / requestedLimit)),
      limit: pag.limit ?? requestedLimit,
    },
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: PAGE_SIZE,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [formProduct, setFormProduct] = useState(null);

  const loadProducts = useCallback(async (pageArg) => {
    setListError('');
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { page: pageArg, limit: PAGE_SIZE },
      });
      const normalized = normalizeProductsPayload(data, pageArg, PAGE_SIZE);
      setProducts(normalized.products);
      setPagination(normalized.pagination);
      if (normalized.pagination.page !== pageArg) {
        setPage(normalized.pagination.page);
      }
    } catch (e) {
      setListError(getApiErrorMessage(e, 'Liste alınamadı'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(page);
  }, [page, loadProducts]);

  const pid = (p) => String(p.id ?? p._id ?? '');

  const handleDelete = async (product) => {
    const id = pid(product);
    if (!id) return;

    const ok = window.confirm(
      'Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?'
    );
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`);

      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadProducts(page);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) return;
      const msg = getApiErrorMessage(err, 'Silme işlemi başarısız oldu.');
      window.alert(msg);
    }
  };

  const goPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const goNext = () => {
    if (page < pagination.pages) setPage((p) => p + 1);
  };

  const closeProductForm = () => {
    setFormOpen(false);
    setFormProduct(null);
  };

  const openNewProduct = () => {
    setFormProduct(null);
    setFormOpen(true);
  };

  const openEditProduct = (p) => {
    setFormProduct(p);
    setFormOpen(true);
  };

  return (
    <div className={styles.productsPage}>
      <div className={styles.productsHeaderRow}>
        <div className={styles.productsPageHeader}>
          <h1 className={styles.categoriesTitle}>Ürün Yönetimi</h1>
          <p className={styles.productsSubtitle}>
            Envanter özeti — isim, fiyat, stok ve kategori.
          </p>
        </div>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={openNewProduct}
        >
          <Plus className={styles.btnIcon} strokeWidth={2.2} aria-hidden />
          Yeni Ürün
        </button>
      </div>

      {listError && <p className={styles.inlineError}>{listError}</p>}

      {loading ? (
        <div className={styles.centered}>
          <Loader2 className={styles.spinner} aria-hidden />
          <span className={styles.muted}>Yükleniyor…</span>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>İsim</th>
                  <th className={styles.colNum}>Fiyat (TL)</th>
                  <th className={styles.colNum}>Stok</th>
                  <th>Kategori</th>
                  <th className={styles.colActionsHead}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>
                      Bu sayfada ürün yok.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={pid(p)}>
                      <td className={styles.cellStrong}>{p.name}</td>
                      <td className={styles.colNum}>
                        {typeof p.price === 'number'
                          ? p.price.toLocaleString('tr-TR')
                          : '—'}
                      </td>
                      <td className={styles.colNum}>
                        {p.stock != null ? p.stock : '—'}
                      </td>
                      <td>{p.category || '—'}</td>
                      <td className={styles.colActionsCell}>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.btnIconEdit}
                            title="Düzenle"
                            aria-label={`${p.name} ürününü düzenle`}
                            onClick={() => openEditProduct(p)}
                          >
                            <Pencil
                              strokeWidth={2}
                              className={styles.trashIcon}
                            />
                          </button>
                          <button
                            type="button"
                            className={styles.btnIconDanger}
                            title="Sil"
                            aria-label={`${p.name} ürününü sil`}
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 strokeWidth={2} className={styles.trashIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.paginationBar}>
            <span className={styles.paginationInfo}>
              Toplam {pagination.total} ürün — Sayfa {pagination.page} /{' '}
              {pagination.pages}
            </span>
            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={goPrev}
                disabled={page <= 1}
              >
                <ChevronLeft className={styles.btnIconSm} aria-hidden />
                Önceki
              </button>
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={goNext}
                disabled={page >= pagination.pages}
              >
                Sonraki
                <ChevronRight className={styles.btnIconSm} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}

      {formOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closeProductForm();
          }}
        >
          <div
            className={`${styles.modalCard} ${styles.modalCardWide}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h2 id="product-form-title" className={styles.modalTitle}>
                {formProduct ? 'Ürünü Düzenle' : 'Yeni Ürün'}
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeProductForm}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            <div className={styles.modalForm}>
              <ProductForm
                key={
                  formProduct
                    ? String(formProduct.id ?? formProduct._id)
                    : 'new'
                }
                product={formProduct}
                onSuccess={() => {
                  closeProductForm();
                  loadProducts(page);
                }}
                onCancel={closeProductForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
