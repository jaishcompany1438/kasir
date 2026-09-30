(function () {
  'use strict';

  var backend = window.KasirBackend;
  var store = backend.createLocalStore();
  var state = store.getState();
  var cart = [];
  var currentView = 'dashboard';
  var lastSale = null;
  var moneyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
  var numberFormatter = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 3
  });

  var viewTitles = {
    dashboard: ['Dashboard', 'Ringkasan usaha'],
    pos: ['Point of Sale', 'Transaksi penjualan'],
    products: ['Master data', 'Barang'],
    categories: ['Master data', 'Kategori barang'],
    customers: ['Master data', 'Pelanggan'],
    inventory: ['Operasional', 'Manajemen stok'],
    reports: ['Analitik', 'Laporan usaha'],
    settings: ['Konfigurasi', 'Pengaturan toko']
  };

  function $(id) {
    return document.getElementById(id);
  }

  function all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMoney(value) {
    return moneyFormatter.format(Number(value) || 0).replace(/\u00a0/g, ' ');
  }

  function formatNumber(value) {
    return numberFormatter.format(Number(value) || 0);
  }

  function formatDateTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  function localDateKey(date) {
    var target = date || new Date();
    var year = target.getFullYear();
    var month = String(target.getMonth() + 1).padStart(2, '0');
    var day = String(target.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function shiftDays(date, amount) {
    var result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    toast.textContent = message;
    $('toast-container').appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 3400);
  }

  function showError(error) {
    showToast(error && error.message ? error.message : String(error), 'error');
  }

  function statusBadge(status, kind) {
    var statusText = status || '-';
    var badgeKind = kind || 'info';
    return '<span class="status-badge ' + badgeKind + '">' + escapeHtml(statusText) + '</span>';
  }

  function productCategory(product) {
    return state.categories.find(function (category) {
      return category.id === product.categoryId;
    });
  }

  function getPeriodRange(value) {
    var today = new Date();
    var to = localDateKey(today);
    if (value === 'today') {
      return { from: to, to: to };
    }
    if (value === '7days') {
      return { from: localDateKey(shiftDays(today, -6)), to: to };
    }
    if (value === '30days') {
      return { from: localDateKey(shiftDays(today, -29)), to: to };
    }
    return { from: '', to: '' };
  }

  function setText(id, value) {
    var element = $(id);
    if (element) {
      element.textContent = value;
    }
  }

  function getCartTotals() {
    var subtotal = cart.reduce(function (sum, line) {
      var product = state.products.find(function (item) {
        return item.id === line.productId;
      });
      return sum + (product ? product.sellPrice * line.quantity : 0);
    }, 0);
    var discount = Math.min(Math.max(Number($('cart-discount').value) || 0, 0), subtotal);
    var taxRate = Number(state.settings.taxRate) || 0;
    var tax = (subtotal - discount) * taxRate / 100;
    return {
      subtotal: backend.roundMoney(subtotal),
      discount: backend.roundMoney(discount),
      tax: backend.roundMoney(tax),
      total: backend.roundMoney(subtotal - discount + tax)
    };
  }

  function navigate(view) {
    if (!viewTitles[view]) {
      return;
    }
    currentView = view;
    all('.view').forEach(function (element) {
      element.classList.toggle('active', element.id === 'view-' + view);
    });
    all('.nav-item').forEach(function (element) {
      element.classList.toggle('active', element.dataset.view === view);
    });
    setText('breadcrumb-section', viewTitles[view][0]);
    setText('breadcrumb-title', viewTitles[view][1]);
    document.body.classList.remove('sidebar-open');
    if (view === 'dashboard') {
      renderDashboard();
    } else if (view === 'pos') {
      renderPOS();
    } else if (view === 'products') {
      renderProducts();
    } else if (view === 'categories') {
      renderCategories();
    } else if (view === 'customers') {
      renderCustomers();
    } else if (view === 'inventory') {
      renderInventory();
    } else if (view === 'reports') {
      renderReports();
    } else if (view === 'settings') {
      renderSettings();
    }
  }

  function refreshState() {
    state = store.getState();
    renderAll();
  }

  function renderAll() {
    renderDashboard();
    renderPOS();
    renderProducts();
    renderCategories();
    renderCustomers();
    renderInventory();
    renderReports();
    renderSettings();
    updateHeader();
  }

  function updateHeader() {
    var userName = state.currentUser && state.currentUser.name
      ? state.currentUser.name
      : 'Admin Lokal';
    setText('current-date', new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    setText('current-user-name', userName);
    setText('user-avatar', userName.slice(0, 1).toUpperCase());
    setText('greeting-name', userName.split(' ')[0]);
  }

  function renderDashboard() {
    var period = getPeriodRange($('dashboard-period').value);
    var report = backend.getDashboardReport(state, period.from, period.to);
    var lowStock = backend.getLowStockProducts(state);
    var rangeLabel = period.from && period.to
      ? period.from + ' - ' + period.to
      : 'Semua periode';

    setText('metric-revenue', formatMoney(report.revenue));
    setText('metric-transactions', formatNumber(report.transactionCount));
    setText('metric-profit', formatMoney(report.grossProfit));
    setText('metric-low-stock', formatNumber(lowStock.length));
    setText('metric-revenue-note', rangeLabel);
    setText('metric-transactions-note', report.transactionCount ? 'Transaksi lunas' : 'Belum ada transaksi');
    setText('metric-profit-note', 'HPP berdasarkan harga beli terakhir');
    setText('metric-stock-note', formatMoney(backend.getStockValue(state)) + ' nilai persediaan');
    setText('dashboard-updated', 'Diperbarui ' + new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }));

    var paymentEntries = Object.keys(report.byPayment);
    var paymentTotal = Math.max(report.revenue, 1);
    $('payment-chart').innerHTML = paymentEntries.length
      ? paymentEntries.map(function (key) {
        var amount = report.byPayment[key];
        return '<div class="chart-item">' +
          '<div class="chart-label"><span>' + escapeHtml(paymentLabel(key)) + '</span><strong>' + formatMoney(amount) + '</strong></div>' +
          '<div class="chart-track"><div class="chart-fill" style="width:' + Math.min(100, amount / paymentTotal * 100) + '%"></div></div>' +
          '</div>';
      }).join('')
      : 'Belum ada transaksi pada periode ini.';
    if (!paymentEntries.length) {
      $('payment-chart').classList.add('empty-state-inline');
    } else {
      $('payment-chart').classList.remove('empty-state-inline');
    }

    $('top-products-list').innerHTML = report.topProducts.length
      ? report.topProducts.slice(0, 5).map(function (item, index) {
        return '<div class="rank-row">' +
          '<span class="rank-number">' + (index + 1) + '</span>' +
          '<span class="rank-name">' + escapeHtml(item.name) + '</span>' +
          '<span class="rank-quantity">' + formatNumber(item.quantity) + ' terjual<br><strong>' + formatMoney(item.revenue) + '</strong></span>' +
          '</div>';
      }).join('')
      : 'Belum ada transaksi pada periode ini.';
    $('top-products-list').classList.toggle('empty-state-inline', !report.topProducts.length);

    $('low-stock-list').innerHTML = lowStock.length
      ? '<table><thead><tr><th>Barang</th><th>Stok</th><th>Minimum</th><th>Kondisi</th></tr></thead><tbody>' +
        lowStock.slice(0, 6).map(function (product) {
          return '<tr><td><strong>' + escapeHtml(product.name) + '</strong><br><small>' + escapeHtml(product.sku) + '</small></td>' +
            '<td>' + formatNumber(product.stock) + ' ' + escapeHtml(product.unit) + '</td>' +
            '<td>' + formatNumber(product.minStock) + '</td>' +
            '<td>' + stockBadge(product) + '</td></tr>';
        }).join('') +
        '</tbody></table>'
      : '<div class="table-empty">Semua stok berada di atas batas minimum.</div>';

    var recentSales = state.sales.slice(0, 6);
    $('recent-sales-list').innerHTML = recentSales.length
      ? '<table><thead><tr><th>Transaksi</th><th>Total</th><th>Bayar</th><th>Waktu</th></tr></thead><tbody>' +
        recentSales.map(function (sale) {
          return '<tr><td><strong>' + escapeHtml(sale.number) + '</strong><br><small>' + escapeHtml(sale.customerName) + '</small></td>' +
            '<td><strong>' + formatMoney(sale.total) + '</strong></td>' +
            '<td>' + escapeHtml(paymentLabel(sale.paymentMethod)) + '</td>' +
            '<td>' + escapeHtml(formatDateTime(sale.timestamp)) + '</td></tr>';
        }).join('') +
        '</tbody></table>'
      : '<div class="table-empty">Belum ada transaksi. Mulai dari menu Point of Sale.</div>';
  }

  function paymentLabel(method) {
    return {
      TUNAI: 'Tunai',
      TRANSFER: 'Transfer',
      QRIS: 'QRIS'
    }[method] || method || '-';
  }

  function stockBadge(product) {
    if (Number(product.stock) <= 0) {
      return statusBadge('Habis', 'danger');
    }
    if (Number(product.stock) <= Number(product.minStock)) {
      return statusBadge('Menipis', 'warning');
    }
    return statusBadge('Aman', 'success');
  }

  function populateCategorySelects() {
    var activeCategories = state.categories
      .filter(function (category) {
        return category.status === 'AKTIF';
      })
      .sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      });
    var categoryOptions = '<option value="">Semua kategori</option>' +
      activeCategories.map(function (category) {
        return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + '</option>';
      }).join('');

    var posFilterValue = $('pos-category-filter').value;
    var productFilterValue = $('product-category-filter').value;
    $('pos-category-filter').innerHTML = categoryOptions;
    $('product-category-filter').innerHTML = categoryOptions;
    $('pos-category-filter').value = posFilterValue;
    $('product-category-filter').value = productFilterValue;

    $('product-category').innerHTML = activeCategories.map(function (category) {
      return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + '</option>';
    }).join('');
  }

  function populateCustomers() {
    var selected = $('pos-customer').value;
    $('pos-customer').innerHTML = state.customers
      .filter(function (customer) {
        return customer.status === 'AKTIF';
      })
      .map(function (customer) {
        return '<option value="' + escapeHtml(customer.id) + '">' + escapeHtml(customer.name) + '</option>';
      }).join('');
    if (state.customers.some(function (customer) { return customer.id === selected; })) {
      $('pos-customer').value = selected;
    }
  }

  function renderPOS() {
    populateCategorySelects();
    populateCustomers();
    var qrisOption = $('payment-method').querySelector('option[value="QRIS"]');
    if (qrisOption) {
      qrisOption.disabled = state.settings.qrisEnabled === false;
      if (qrisOption.disabled && $('payment-method').value === 'QRIS') {
        $('payment-method').value = 'TUNAI';
      }
    }
    $('cash-payment-fields').classList.toggle('hidden', $('payment-method').value !== 'TUNAI');
    $('qris-payment-fields').classList.toggle('hidden', $('payment-method').value !== 'QRIS');
    var search = ($('pos-search').value || '').toLowerCase();
    var categoryId = $('pos-category-filter').value;
    var products = state.products.filter(function (product) {
      var matchesSearch = !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode.toLowerCase().includes(search);
      return product.status === 'AKTIF' &&
        matchesSearch &&
        (!categoryId || product.categoryId === categoryId);
    });

    $('pos-product-grid').innerHTML = products.length
      ? products.map(function (product) {
        var category = productCategory(product);
        var isUnavailable = product.type !== 'NON_STOK' &&
          Number(product.stock) <= 0 &&
          !state.settings.allowNegativeStock;
        var stockText = product.type === 'NON_STOK'
          ? 'Non-stok'
          : 'Stok ' + formatNumber(product.stock) + ' ' + product.unit;
        return '<button class="product-card" data-add-product="' + escapeHtml(product.id) + '"' + (isUnavailable ? ' disabled' : '') + '>' +
          '<span class="product-category">' + escapeHtml(category ? category.name : 'Tanpa kategori') + '</span>' +
          '<span class="product-name">' + escapeHtml(product.name) + '</span>' +
          '<span class="product-price">' + formatMoney(product.sellPrice) + '</span>' +
          '<span class="product-stock ' + (Number(product.stock) <= Number(product.minStock) ? 'low' : '') + '">' + stockText + '</span>' +
          '</button>';
      }).join('')
      : '<div class="table-empty">Barang tidak ditemukan.</div>';

    renderCart();
  }

  function renderCart() {
    var totals = getCartTotals();
    setText('cart-count', formatNumber(cart.reduce(function (sum, line) {
      return sum + line.quantity;
    }, 0)));
    $('cart-items').innerHTML = cart.length
      ? cart.map(function (line) {
        var product = state.products.find(function (item) {
          return item.id === line.productId;
        });
        if (!product) {
          return '';
        }
        return '<div class="cart-line">' +
          '<div><span class="cart-line-name">' + escapeHtml(product.name) + '</span>' +
          '<div class="cart-line-meta"><div class="quantity-control">' +
          '<button type="button" data-cart-minus="' + escapeHtml(product.id) + '">−</button>' +
          '<span>' + formatNumber(line.quantity) + '</span>' +
          '<button type="button" data-cart-plus="' + escapeHtml(product.id) + '">+</button>' +
          '</div><button class="remove-line" type="button" data-cart-remove="' + escapeHtml(product.id) + '">×</button></div></div>' +
          '<span class="cart-line-total">' + formatMoney(product.sellPrice * line.quantity) + '</span>' +
          '</div>';
      }).join('')
      : '<div class="cart-empty">Pilih barang untuk memulai transaksi.</div>';
    setText('cart-subtotal', formatMoney(totals.subtotal));
    setText('cart-tax', formatMoney(totals.tax));
    setText('cart-total', formatMoney(totals.total));
    updateCashChange();
  }

  function updateCashChange() {
    var totals = getCartTotals();
    var amount = Number($('amount-paid').value) || 0;
    setText('cash-change', formatMoney(Math.max(0, amount - totals.total)));
  }

  function addToCart(productId) {
    var product = state.products.find(function (item) {
      return item.id === productId;
    });
    if (!product) {
      return;
    }
    var line = cart.find(function (item) {
      return item.productId === productId;
    });
    var nextQuantity = line ? line.quantity + 1 : 1;
    if (product.type !== 'NON_STOK' &&
        !state.settings.allowNegativeStock &&
        nextQuantity > Number(product.stock)) {
      showToast('Stok ' + product.name + ' tidak mencukupi.', 'error');
      return;
    }
    if (line) {
      line.quantity = nextQuantity;
    } else {
      cart.push({ productId: productId, quantity: 1 });
    }
    renderCart();
  }

  function changeCartQuantity(productId, amount) {
    var line = cart.find(function (item) {
      return item.productId === productId;
    });
    var product = state.products.find(function (item) {
      return item.id === productId;
    });
    if (!line || !product) {
      return;
    }
    var next = line.quantity + amount;
    if (next <= 0) {
      cart = cart.filter(function (item) {
        return item.productId !== productId;
      });
    } else if (product.type !== 'NON_STOK' &&
        !state.settings.allowNegativeStock &&
        next > Number(product.stock)) {
      showToast('Jumlah melebihi stok tersedia.', 'error');
      return;
    } else {
      line.quantity = next;
    }
    renderCart();
  }

  function completeSale() {
    try {
      if (!cart.length) {
        throw new Error('Tambahkan minimal satu barang ke keranjang.');
      }
      var totals = getCartTotals();
      var paymentMethod = $('payment-method').value;
      var amountPaid = paymentMethod === 'TUNAI'
        ? Number($('amount-paid').value) || 0
        : totals.total;
      var nextState = backend.clone(state);
      lastSale = backend.finalizeSale(nextState, {
        items: cart,
        discount: totals.discount,
        taxRate: state.settings.taxRate,
        paymentMethod: paymentMethod,
        amountPaid: amountPaid,
        paymentReference: $('payment-reference').value,
        customerId: $('pos-customer').value,
        cashier: state.currentUser.name
      });
      store.replace(nextState);
      state = nextState;
      cart = [];
      $('cart-discount').value = 0;
      $('amount-paid').value = '';
      $('payment-reference').value = '';
      renderAll();
      showReceipt(lastSale);
      showToast('Transaksi ' + lastSale.number + ' berhasil disimpan.', 'success');
    } catch (error) {
      showError(error);
    }
  }

  function showReceipt(sale) {
    var settings = state.settings;
    $('receipt-content').innerHTML =
      '<div class="receipt">' +
      '<div class="receipt-header"><strong>' + escapeHtml(settings.storeName) + '</strong><span>' + escapeHtml(settings.address) + '</span><span>' + escapeHtml(settings.phone) + '</span></div>' +
      '<div class="receipt-meta"><span>No. transaksi</span><strong>' + escapeHtml(sale.number) + '</strong><span>Waktu</span><strong>' + escapeHtml(formatDateTime(sale.timestamp)) + '</strong><span>Kasir</span><strong>' + escapeHtml(sale.cashier) + '</strong><span>Pelanggan</span><strong>' + escapeHtml(sale.customerName) + '</strong></div>' +
      '<div class="receipt-items">' +
      sale.items.map(function (item) {
        return '<div class="receipt-item"><span>' + formatNumber(item.quantity) + ' x ' + escapeHtml(item.name) + '</span><strong>' + formatMoney(item.subtotal) + '</strong></div>';
      }).join('') +
      '</div><div class="receipt-totals">' +
      '<div class="receipt-total-row"><span>Subtotal</span><strong>' + formatMoney(sale.subtotal) + '</strong></div>' +
      '<div class="receipt-total-row"><span>Diskon</span><strong>' + formatMoney(sale.discount) + '</strong></div>' +
      '<div class="receipt-total-row"><span>Pajak</span><strong>' + formatMoney(sale.tax) + '</strong></div>' +
      '<div class="receipt-total-row total"><span>Total</span><strong>' + formatMoney(sale.total) + '</strong></div>' +
      '<div class="receipt-total-row"><span>' + escapeHtml(paymentLabel(sale.paymentMethod)) + '</span><strong>' + formatMoney(sale.amountPaid) + '</strong></div>' +
      '<div class="receipt-total-row"><span>Kembalian</span><strong>' + formatMoney(sale.change) + '</strong></div>' +
      '</div></div>';
    $('receipt-modal').showModal();
  }

  function printReceipt() {
    if (!lastSale) {
      return;
    }
    var popup = window.open('', '_blank', 'width=420,height=700');
    if (!popup) {
      showToast('Izinkan pop-up browser untuk mencetak struk.', 'error');
      return;
    }
    popup.document.write('<!doctype html><html><head><title>' + escapeHtml(lastSale.number) + '</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#17313a;font-size:12px}.receipt{max-width:360px;margin:auto}.receipt-header{text-align:center;padding-bottom:12px;border-bottom:1px dashed #aaa}.receipt-header strong{display:block;font-size:17px;margin-bottom:5px}.receipt-header span{display:block;color:#666;font-size:10px}.receipt-meta{display:grid;grid-template-columns:1fr auto;gap:5px;padding:12px 0;border-bottom:1px dashed #aaa}.receipt-meta span{color:#666}.receipt-items{display:grid;gap:7px;padding:12px 0;border-bottom:1px dashed #aaa}.receipt-item,.receipt-total-row{display:flex;justify-content:space-between;gap:10px}.receipt-item span{color:#666}.receipt-totals{display:grid;gap:6px;padding-top:12px}.receipt-total-row.total{border-top:1px solid #aaa;padding-top:7px;font-weight:bold}</style></head><body>' + $('receipt-content').innerHTML + '</body></html>');
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function renderProducts() {
    populateCategorySelects();
    var search = ($('product-search').value || '').toLowerCase();
    var categoryId = $('product-category-filter').value;
    var status = $('product-status-filter').value;
    var products = state.products.filter(function (product) {
      var matchesSearch = !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode.toLowerCase().includes(search);
      return matchesSearch &&
        (!categoryId || product.categoryId === categoryId) &&
        (!status || product.status === status);
    });
    $('products-table').innerHTML = products.length
      ? '<table><thead><tr><th>Barang</th><th>Kategori</th><th>Harga jual</th><th>Stok</th><th>Status</th><th></th></tr></thead><tbody>' +
        products.map(function (product) {
          var category = productCategory(product);
          return '<tr><td><strong>' + escapeHtml(product.name) + '</strong><br><small>' + escapeHtml(product.sku) + (product.barcode ? ' · ' + escapeHtml(product.barcode) : '') + '</small></td>' +
            '<td>' + escapeHtml(category ? category.name : '-') + '</td>' +
            '<td>' + formatMoney(product.sellPrice) + '<br><small>Modal ' + formatMoney(product.costPrice) + '</small></td>' +
            '<td>' + (product.type === 'NON_STOK' ? 'Non-stok' : formatNumber(product.stock) + ' ' + escapeHtml(product.unit)) + '</td>' +
            '<td>' + statusBadge(product.status, product.status === 'AKTIF' ? 'success' : 'warning') + '</td>' +
            '<td><div class="action-buttons"><button class="icon-button" data-edit-product="' + escapeHtml(product.id) + '" title="Edit">✎</button></div></td></tr>';
        }).join('') +
        '</tbody></table>'
      : '<div class="table-empty">Belum ada barang yang sesuai filter.</div>';
  }

  function openProductModal(product) {
    product = product || null;
    $('product-modal-title').textContent = product ? 'Edit barang' : 'Tambah barang';
    $('product-id').value = product ? product.id : '';
    $('product-name').value = product ? product.name : '';
    $('product-sku').value = product ? product.sku : '';
    $('product-barcode').value = product ? product.barcode : '';
    $('product-unit').value = product ? product.unit : 'pcs';
    $('product-type').value = product ? product.type : 'STOK';
    $('product-cost').value = product ? product.costPrice : '';
    $('product-price').value = product ? product.sellPrice : '';
    $('product-min-stock').value = product ? product.minStock : 0;
    $('product-status').value = product ? product.status : 'AKTIF';
    populateCategorySelects();
    $('product-category').value = product ? product.categoryId : (state.categories[0] ? state.categories[0].id : '');
    $('product-modal').showModal();
  }

  function renderCategories() {
    $('categories-grid').innerHTML = state.categories
      .slice()
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); })
      .map(function (category) {
        var count = state.products.filter(function (product) {
          return product.categoryId === category.id && product.status === 'AKTIF';
        }).length;
        return '<article class="category-card">' +
          '<div class="category-actions"><button class="icon-button" data-edit-category="' + escapeHtml(category.id) + '" title="Edit">✎</button></div>' +
          statusBadge(category.status, category.status === 'AKTIF' ? 'success' : 'warning') +
          '<h2>' + escapeHtml(category.name) + '</h2>' +
          '<p>' + escapeHtml(category.description || 'Tidak ada deskripsi.') + '</p>' +
          '<span class="category-count">' + formatNumber(count) + ' barang aktif</span>' +
          '</article>';
      }).join('');
  }

  function openCategoryModal(category) {
    category = category || null;
    $('category-modal-title').textContent = category ? 'Edit kategori' : 'Tambah kategori';
    $('category-id').value = category ? category.id : '';
    $('category-name').value = category ? category.name : '';
    $('category-description').value = category ? category.description : '';
    $('category-order').value = category ? category.order : state.categories.length + 1;
    $('category-status').value = category ? category.status : 'AKTIF';
    $('category-modal').showModal();
  }

  function renderCustomers() {
    var search = ($('customer-search').value || '').toLowerCase();
    var customers = state.customers.filter(function (customer) {
      return !search ||
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search);
    });
    $('customers-table').innerHTML = customers.length
      ? '<table><thead><tr><th>Pelanggan</th><th>Kontak</th><th>Transaksi</th><th>Total pembelian</th><th>Poin</th><th></th></tr></thead><tbody>' +
        customers.map(function (customer) {
          return '<tr><td><strong>' + escapeHtml(customer.name) + '</strong><br><small>Bergabung ' + escapeHtml(formatDateTime(customer.joinedAt)) + '</small></td>' +
            '<td>' + escapeHtml(customer.phone || '-') + '<br><small>' + escapeHtml(customer.address || '') + '</small></td>' +
            '<td>' + formatNumber(customer.totalTransactions) + '</td>' +
            '<td>' + formatMoney(customer.totalPurchases) + '</td>' +
            '<td>' + formatNumber(customer.points) + '</td>' +
            '<td><div class="action-buttons"><button class="icon-button" data-edit-customer="' + escapeHtml(customer.id) + '" title="Edit">✎</button></div></td></tr>';
        }).join('') +
        '</tbody></table>'
      : '<div class="table-empty">Belum ada pelanggan yang sesuai pencarian.</div>';
  }

  function openCustomerModal(customer) {
    customer = customer || null;
    $('customer-modal-title').textContent = customer ? 'Edit pelanggan' : 'Tambah pelanggan';
    $('customer-id').value = customer ? customer.id : '';
    $('customer-name').value = customer ? customer.name : '';
    $('customer-phone').value = customer ? customer.phone : '';
    $('customer-address').value = customer ? customer.address : '';
    $('customer-status').value = customer ? customer.status : 'AKTIF';
    $('customer-modal').showModal();
  }

  function inventoryCondition(product) {
    if (Number(product.stock) <= 0) {
      return 'OUT';
    }
    if (Number(product.stock) <= Number(product.minStock)) {
      return 'LOW';
    }
    return 'SAFE';
  }

  function renderInventory() {
    var stockProducts = state.products.filter(function (product) {
      return product.type !== 'NON_STOK';
    });
    var search = ($('inventory-search').value || '').toLowerCase();
    var filter = $('inventory-status-filter').value;
    var products = stockProducts.filter(function (product) {
      return (!search || product.name.toLowerCase().includes(search) || product.sku.toLowerCase().includes(search)) &&
        (!filter || inventoryCondition(product) === filter);
    });
    var lowStock = backend.getLowStockProducts(state);
    setText('inventory-product-count', formatNumber(stockProducts.length));
    setText('inventory-value', formatMoney(backend.getStockValue(state)));
    setText('inventory-low-count', formatNumber(lowStock.length));
    $('inventory-table').innerHTML = products.length
      ? '<table><thead><tr><th>Barang</th><th>Stok saat ini</th><th>Minimum</th><th>Nilai stok</th><th>Kondisi</th><th></th></tr></thead><tbody>' +
        products.map(function (product) {
          return '<tr><td><strong>' + escapeHtml(product.name) + '</strong><br><small>' + escapeHtml(product.sku) + '</small></td>' +
            '<td>' + formatNumber(product.stock) + ' ' + escapeHtml(product.unit) + '</td>' +
            '<td>' + formatNumber(product.minStock) + '</td>' +
            '<td>' + formatMoney(product.stock * product.costPrice) + '</td>' +
            '<td>' + stockBadge(product) + '</td>' +
            '<td><button class="button ghost" data-stock-for="' + escapeHtml(product.id) + '">Mutasi</button></td></tr>';
        }).join('') +
        '</tbody></table>'
      : '<div class="table-empty">Tidak ada barang yang sesuai filter.</div>';

    var movements = state.stockMovements.slice(0, 15);
    $('movements-table').innerHTML = movements.length
      ? '<table><thead><tr><th>Waktu</th><th>Barang</th><th>Jenis</th><th>Perubahan</th><th>Saldo</th><th>Alasan</th></tr></thead><tbody>' +
        movements.map(function (movement) {
          var product = state.products.find(function (item) { return item.id === movement.productId; });
          var incoming = Number(movement.quantityIn) > 0;
          return '<tr><td>' + escapeHtml(formatDateTime(movement.timestamp)) + '</td>' +
            '<td><strong>' + escapeHtml(product ? product.name : movement.productId) + '</strong></td>' +
            '<td>' + escapeHtml(movement.type) + '</td>' +
            '<td class="' + (incoming ? 'positive-value' : 'negative-value') + '">' + (incoming ? '+' : '-') + formatNumber(incoming ? movement.quantityIn : movement.quantityOut) + '</td>' +
            '<td>' + formatNumber(movement.stockAfter) + '</td>' +
            '<td>' + escapeHtml(movement.reason) + '</td></tr>';
        }).join('') +
        '</tbody></table>'
      : '<div class="table-empty">Belum ada mutasi stok.</div>';
  }

  function openStockModal(productId) {
    var stockProducts = state.products.filter(function (product) {
      return product.type !== 'NON_STOK' && product.status === 'AKTIF';
    });
    $('stock-product').innerHTML = stockProducts.map(function (product) {
      return '<option value="' + escapeHtml(product.id) + '">' + escapeHtml(product.name) + ' (stok ' + formatNumber(product.stock) + ')</option>';
    }).join('');
    if (productId) {
      $('stock-product').value = productId;
    }
    $('stock-quantity').value = '';
    $('stock-reference').value = '';
    $('stock-reason').value = '';
    $('stock-modal').showModal();
  }

  function renderReports() {
    var from = $('report-from').value;
    var to = $('report-to').value;
    var report = backend.getDashboardReport(state, from, to);
    setText('report-revenue', formatMoney(report.revenue));
    setText('report-transactions', formatNumber(report.transactionCount));
    setText('report-cost', formatMoney(report.cost));
    setText('report-profit', formatMoney(report.grossProfit));
    renderBars('category-report', report.byCategory);
    renderBars('payment-report', Object.keys(report.byPayment).reduce(function (result, key) {
      result[paymentLabel(key)] = report.byPayment[key];
      return result;
    }, {}));
    $('reports-table').innerHTML = report.sales.length
      ? '<table><thead><tr><th>Nomor transaksi</th><th>Waktu</th><th>Pelanggan</th><th>Metode</th><th>Item</th><th>Total</th><th>Status</th></tr></thead><tbody>' +
        report.sales.map(function (sale) {
          return '<tr><td><strong>' + escapeHtml(sale.number) + '</strong></td>' +
            '<td>' + escapeHtml(formatDateTime(sale.timestamp)) + '</td>' +
            '<td>' + escapeHtml(sale.customerName) + '</td>' +
            '<td>' + escapeHtml(paymentLabel(sale.paymentMethod)) + '</td>' +
            '<td>' + formatNumber(sale.items.reduce(function (sum, item) { return sum + item.quantity; }, 0)) + '</td>' +
            '<td><strong>' + formatMoney(sale.total) + '</strong></td>' +
            '<td>' + statusBadge(sale.status, 'success') + '</td></tr>';
        }).join('') +
        '</tbody></table>'
      : '<div class="table-empty">Tidak ada transaksi pada periode yang dipilih.</div>';
  }

  function renderBars(id, values) {
    var container = $(id);
    var entries = Object.keys(values);
    if (!entries.length) {
      container.className = 'bar-list empty-state-inline';
      container.textContent = 'Belum ada data pada periode ini.';
      return;
    }
    var max = Math.max.apply(null, entries.map(function (key) { return values[key]; })) || 1;
    container.className = 'bar-list';
    container.innerHTML = entries.sort(function (a, b) {
      return values[b] - values[a];
    }).map(function (key) {
      return '<div class="bar-item"><div class="bar-label"><span>' + escapeHtml(key) + '</span><strong>' + formatMoney(values[key]) + '</strong></div><div class="bar-track"><div class="bar-fill" style="width:' + (values[key] / max * 100) + '%"></div></div></div>';
    }).join('');
  }

  function renderSettings() {
    $('setting-store-name').value = state.settings.storeName || '';
    $('setting-address').value = state.settings.address || '';
    $('setting-phone').value = state.settings.phone || '';
    $('setting-tax-rate').value = state.settings.taxRate || 0;
    $('setting-negative-stock').checked = Boolean(state.settings.allowNegativeStock);
    $('setting-qris-enabled').checked = state.settings.qrisEnabled !== false;
    $('setting-qris-url').value = state.settings.qrisUrl || '';
    renderQrisPreview('settings-qris-preview', state.settings.qrisUrl);
    renderQrisPreview('qris-preview', state.settings.qrisUrl);
  }

  function renderQrisPreview(id, url) {
    var container = $(id);
    if (!container) {
      return;
    }
    if (url) {
      container.innerHTML = '<img src="' + escapeHtml(url) + '" alt="QRIS toko"><p>QRIS toko</p>';
    } else {
      container.innerHTML = '<div class="qris-placeholder">QRIS</div><p>Belum ada gambar QRIS. Atur URL pada Pengaturan.</p>';
    }
  }

  function bindNavigation() {
    all('.nav-item').forEach(function (button) {
      button.addEventListener('click', function () {
        navigate(button.dataset.view);
      });
    });
    all('[data-go-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        navigate(button.dataset.goView);
      });
    });
    $('mobile-menu').addEventListener('click', function () {
      document.body.classList.toggle('sidebar-open');
    });
  }

  function bindPOS() {
    $('pos-search').addEventListener('input', renderPOS);
    $('pos-category-filter').addEventListener('change', renderPOS);
    $('cart-discount').addEventListener('input', renderCart);
    $('amount-paid').addEventListener('input', updateCashChange);
    $('payment-method').addEventListener('change', function () {
      var isCash = $('payment-method').value === 'TUNAI';
      $('cash-payment-fields').classList.toggle('hidden', !isCash);
      $('qris-payment-fields').classList.toggle('hidden', $('payment-method').value !== 'QRIS');
      renderQrisPreview('qris-preview', state.settings.qrisUrl);
      updateCashChange();
    });
    $('pos-product-grid').addEventListener('click', function (event) {
      var button = event.target.closest('[data-add-product]');
      if (button) {
        addToCart(button.dataset.addProduct);
      }
    });
    $('cart-items').addEventListener('click', function (event) {
      var plus = event.target.closest('[data-cart-plus]');
      var minus = event.target.closest('[data-cart-minus]');
      var remove = event.target.closest('[data-cart-remove]');
      if (plus) {
        changeCartQuantity(plus.dataset.cartPlus, 1);
      } else if (minus) {
        changeCartQuantity(minus.dataset.cartMinus, -1);
      } else if (remove) {
        cart = cart.filter(function (item) { return item.productId !== remove.dataset.cartRemove; });
        renderCart();
      }
    });
    $('clear-cart').addEventListener('click', function () {
      if (cart.length && !window.confirm('Kosongkan semua item dalam keranjang?')) {
        return;
      }
      cart = [];
      renderCart();
    });
    $('complete-sale').addEventListener('click', completeSale);
  }

  function bindMasterData() {
    $('add-product').addEventListener('click', function () { openProductModal(); });
    $('add-category').addEventListener('click', function () { openCategoryModal(); });
    $('add-customer').addEventListener('click', function () { openCustomerModal(); });
    $('add-stock-movement').addEventListener('click', function () { openStockModal(); });
    $('product-search').addEventListener('input', renderProducts);
    $('product-category-filter').addEventListener('change', renderProducts);
    $('product-status-filter').addEventListener('change', renderProducts);
    $('customer-search').addEventListener('input', renderCustomers);
    $('inventory-search').addEventListener('input', renderInventory);
    $('inventory-status-filter').addEventListener('change', renderInventory);

    $('products-table').addEventListener('click', function (event) {
      var button = event.target.closest('[data-edit-product]');
      if (button) {
        openProductModal(state.products.find(function (product) {
          return product.id === button.dataset.editProduct;
        }));
      }
    });
    $('categories-grid').addEventListener('click', function (event) {
      var button = event.target.closest('[data-edit-category]');
      if (button) {
        openCategoryModal(state.categories.find(function (category) {
          return category.id === button.dataset.editCategory;
        }));
      }
    });
    $('customers-table').addEventListener('click', function (event) {
      var button = event.target.closest('[data-edit-customer]');
      if (button) {
        openCustomerModal(state.customers.find(function (customer) {
          return customer.id === button.dataset.editCustomer;
        }));
      }
    });
    $('inventory-table').addEventListener('click', function (event) {
      var button = event.target.closest('[data-stock-for]');
      if (button) {
        openStockModal(button.dataset.stockFor);
      }
    });
  }

  function bindForms() {
    $('product-form').addEventListener('submit', function (event) {
      event.preventDefault();
      try {
        var nextState = backend.clone(state);
        backend.saveProduct(nextState, {
          id: $('product-id').value,
          name: $('product-name').value,
          sku: $('product-sku').value,
          barcode: $('product-barcode').value,
          categoryId: $('product-category').value,
          unit: $('product-unit').value,
          type: $('product-type').value,
          costPrice: $('product-cost').value,
          sellPrice: $('product-price').value,
          minStock: $('product-min-stock').value,
          status: $('product-status').value
        });
        store.replace(nextState);
        state = nextState;
        $('product-modal').close();
        refreshState();
        showToast('Barang berhasil disimpan.', 'success');
      } catch (error) {
        showError(error);
      }
    });
    $('category-form').addEventListener('submit', function (event) {
      event.preventDefault();
      try {
        var nextState = backend.clone(state);
        backend.saveCategory(nextState, {
          id: $('category-id').value,
          name: $('category-name').value,
          description: $('category-description').value,
          order: $('category-order').value,
          status: $('category-status').value
        });
        store.replace(nextState);
        state = nextState;
        $('category-modal').close();
        refreshState();
        showToast('Kategori berhasil disimpan.', 'success');
      } catch (error) {
        showError(error);
      }
    });
    $('customer-form').addEventListener('submit', function (event) {
      event.preventDefault();
      try {
        var nextState = backend.clone(state);
        backend.saveCustomer(nextState, {
          id: $('customer-id').value,
          name: $('customer-name').value,
          phone: $('customer-phone').value,
          address: $('customer-address').value,
          status: $('customer-status').value
        });
        store.replace(nextState);
        state = nextState;
        $('customer-modal').close();
        refreshState();
        showToast('Pelanggan berhasil disimpan.', 'success');
      } catch (error) {
        showError(error);
      }
    });
    $('stock-form').addEventListener('submit', function (event) {
      event.preventDefault();
      try {
        var nextState = backend.clone(state);
        backend.recordStockMovement(nextState, {
          productId: $('stock-product').value,
          type: $('stock-type').value,
          quantity: $('stock-quantity').value,
          reference: $('stock-reference').value,
          reason: $('stock-reason').value
        });
        store.replace(nextState);
        state = nextState;
        $('stock-modal').close();
        refreshState();
        showToast('Mutasi stok berhasil dicatat.', 'success');
      } catch (error) {
        showError(error);
      }
    });
    $('store-settings-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var nextState = backend.clone(state);
      nextState.settings.storeName = $('setting-store-name').value.trim() || 'Warung UMKM';
      nextState.settings.address = $('setting-address').value.trim();
      nextState.settings.phone = $('setting-phone').value.trim();
      nextState.settings.taxRate = Math.max(Number($('setting-tax-rate').value) || 0, 0);
      nextState.settings.allowNegativeStock = $('setting-negative-stock').checked;
      store.replace(nextState);
      state = nextState;
      refreshState();
      showToast('Pengaturan toko disimpan.', 'success');
    });
    $('qris-settings-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var nextState = backend.clone(state);
      nextState.settings.qrisEnabled = $('setting-qris-enabled').checked;
      nextState.settings.qrisUrl = $('setting-qris-url').value.trim();
      store.replace(nextState);
      state = nextState;
      refreshState();
      showToast('Pengaturan QRIS disimpan.', 'success');
    });
  }

  function bindReportsAndSettings() {
    $('dashboard-period').addEventListener('change', renderDashboard);
    $('apply-report').addEventListener('click', renderReports);
    $('print-report').addEventListener('click', function () {
      window.print();
    });
    $('reset-local-data').addEventListener('click', function () {
      if (!window.confirm('Reset akan menghapus transaksi dan perubahan data lokal. Lanjutkan?')) {
        return;
      }
      store.reset();
      state = store.getState();
      cart = [];
      refreshState();
      showToast('Data lokal kembali ke kondisi awal.', 'success');
    });
    $('close-receipt').addEventListener('click', function () {
      $('receipt-modal').close();
    });
    $('receipt-close-action').addEventListener('click', function () {
      $('receipt-modal').close();
    });
    $('print-receipt').addEventListener('click', printReceipt);
  }

  function initializeReportDates() {
    $('report-from').value = localDateKey(shiftDays(new Date(), -29));
    $('report-to').value = localDateKey(new Date());
  }

  function init() {
    initializeReportDates();
    bindNavigation();
    bindPOS();
    bindMasterData();
    bindForms();
    bindReportsAndSettings();
    renderAll();
    navigate(currentView);
  }

  init();
})();
