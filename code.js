/* eslint-env browser, node */
var KasirBackend = (function (root, factory) {
  var api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.KasirBackend = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STORAGE_KEY = 'kasir-umkm-state-v1';
  var SHEET_HEADERS = {
    Settings: ['key', 'value', 'type', 'description'],
    Users: ['user_id', 'email', 'nama', 'role', 'status'],
    Categories: ['category_id', 'nama', 'deskripsi', 'urutan', 'status'],
    Products: [
      'product_id',
      'sku',
      'barcode',
      'nama',
      'category_id',
      'satuan',
      'harga_beli',
      'harga_jual',
      'stok_saat_ini',
      'stok_minimum',
      'tipe',
      'status'
    ],
    Customers: [
      'customer_id',
      'nama',
      'telepon',
      'alamat',
      'tanggal_bergabung',
      'total_transaksi',
      'total_pembelian',
      'poin',
      'status'
    ],
    Sales: [
      'sale_id',
      'nomor_transaksi',
      'timestamp',
      'kasir',
      'customer_id',
      'subtotal',
      'diskon',
      'pajak',
      'total',
      'metode_bayar',
      'status',
      'referensi_bayar'
    ],
    SaleDetails: [
      'detail_id',
      'sale_id',
      'product_id',
      'sku',
      'nama_produk',
      'harga',
      'qty',
      'diskon',
      'subtotal'
    ],
    StockMovements: [
      'movement_id',
      'timestamp',
      'product_id',
      'jenis',
      'qty_masuk',
      'qty_keluar',
      'saldo_sebelum',
      'saldo_sesudah',
      'referensi',
      'alasan',
      'user_id'
    ],
    Payments: [
      'payment_id',
      'sale_id',
      'metode',
      'nominal_tagihan',
      'nominal_dibayar',
      'kembalian',
      'status',
      'waktu_konfirmasi',
      'referensi'
    ],
    AuditLogs: [
      'log_id',
      'timestamp',
      'user_id',
      'aksi',
      'modul',
      'record_id',
      'detail'
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createId(prefix) {
    var random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + random;
  }

  function isoNow() {
    return new Date().toISOString();
  }

  function roundMoney(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function roundQuantity(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
  }

  function toNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback || 0;
  }

  function normalizeText(value) {
    return String(value == null ? '' : value).trim();
  }

  function dateKey(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 10);
  }

  function createInitialState() {
    return {
      settings: {
        storeName: 'Warung Maju Jaya',
        address: 'Jl. Contoh No. 1, Indonesia',
        phone: '0812-0000-0000',
        currency: 'IDR',
        allowNegativeStock: false,
        taxRate: 0,
        qrisUrl: '',
        qrisEnabled: true,
        nextTransactionNumber: 1
      },
      currentUser: {
        id: 'USR-LOCAL',
        name: 'Admin Lokal',
        email: 'admin@local',
        role: 'ADMIN'
      },
      categories: [
        { id: 'CAT-SEMBAKO', name: 'Sembako', description: '', order: 1, status: 'AKTIF' },
        { id: 'CAT-MINUMAN', name: 'Minuman', description: '', order: 2, status: 'AKTIF' },
        { id: 'CAT-MAKANAN', name: 'Makanan Ringan', description: '', order: 3, status: 'AKTIF' },
        { id: 'CAT-RUMAH', name: 'Rumah Tangga', description: '', order: 4, status: 'AKTIF' },
        { id: 'CAT-JASA', name: 'Pulsa & Jasa', description: '', order: 5, status: 'AKTIF' }
      ],
      products: [
        {
          id: 'PRD-BERAS5',
          sku: 'BR-5KG',
          barcode: '',
          name: 'Beras Premium 5 kg',
          categoryId: 'CAT-SEMBAKO',
          unit: 'karung',
          costPrice: 65000,
          sellPrice: 75000,
          stock: 12,
          minStock: 3,
          type: 'STOK',
          status: 'AKTIF'
        },
        {
          id: 'PRD-MI',
          sku: 'MI-GRG',
          barcode: '899999900001',
          name: 'Mi Instan Goreng',
          categoryId: 'CAT-SEMBAKO',
          unit: 'pcs',
          costPrice: 2300,
          sellPrice: 3000,
          stock: 48,
          minStock: 12,
          type: 'STOK',
          status: 'AKTIF'
        },
        {
          id: 'PRD-AIR',
          sku: 'AM-600',
          barcode: '899999900002',
          name: 'Air Mineral 600 ml',
          categoryId: 'CAT-MINUMAN',
          unit: 'botol',
          costPrice: 1800,
          sellPrice: 3000,
          stock: 36,
          minStock: 12,
          type: 'STOK',
          status: 'AKTIF'
        },
        {
          id: 'PRD-KOPI',
          sku: 'KOPI-SCH',
          barcode: '899999900003',
          name: 'Kopi Sachet',
          categoryId: 'CAT-MINUMAN',
          unit: 'sachet',
          costPrice: 1200,
          sellPrice: 2000,
          stock: 60,
          minStock: 15,
          type: 'STOK',
          status: 'AKTIF'
        },
        {
          id: 'PRD-SABUN',
          sku: 'SBN-CTK',
          barcode: '899999900004',
          name: 'Sabun Cuci Batang',
          categoryId: 'CAT-RUMAH',
          unit: 'pcs',
          costPrice: 2800,
          sellPrice: 4000,
          stock: 7,
          minStock: 10,
          type: 'STOK',
          status: 'AKTIF'
        },
        {
          id: 'PRD-PULSA',
          sku: 'PLS-10',
          barcode: '',
          name: 'Pulsa 10.000',
          categoryId: 'CAT-JASA',
          unit: 'transaksi',
          costPrice: 10000,
          sellPrice: 12000,
          stock: 0,
          minStock: 0,
          type: 'NON_STOK',
          status: 'AKTIF'
        }
      ],
      customers: [
        {
          id: 'CUS-GENERAL',
          name: 'Pelanggan Umum',
          phone: '',
          address: '',
          joinedAt: isoNow(),
          totalTransactions: 0,
          totalPurchases: 0,
          points: 0,
          status: 'AKTIF'
        }
      ],
      sales: [],
      stockMovements: [],
      auditLogs: []
    };
  }

  function createLocalStore(storage) {
    var backing = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    var state;

    function load() {
      var raw = backing && backing.getItem(STORAGE_KEY);
      if (raw) {
        try {
          state = Object.assign(createInitialState(), JSON.parse(raw));
          state.settings = Object.assign(createInitialState().settings, state.settings || {});
          state.categories = Array.isArray(state.categories) ? state.categories : [];
          state.products = Array.isArray(state.products) ? state.products : [];
          state.customers = Array.isArray(state.customers) ? state.customers : [];
          state.sales = Array.isArray(state.sales) ? state.sales : [];
          state.stockMovements = Array.isArray(state.stockMovements) ? state.stockMovements : [];
          state.auditLogs = Array.isArray(state.auditLogs) ? state.auditLogs : [];
          return;
        } catch (error) {
          state = createInitialState();
        }
      }
      state = createInitialState();
      persist();
    }

    function persist() {
      if (backing) {
        backing.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }

    function getState() {
      if (!state) {
        load();
      }
      return clone(state);
    }

    function replace(nextState) {
      state = clone(nextState);
      persist();
      return getState();
    }

    function reset() {
      state = createInitialState();
      persist();
      return getState();
    }

    load();

    return {
      getState: getState,
      replace: replace,
      reset: reset,
      persist: persist
    };
  }

  function addAudit(state, action, moduleName, recordId, detail) {
    state.auditLogs.unshift({
      id: createId('LOG'),
      timestamp: isoNow(),
      userId: state.currentUser && state.currentUser.id,
      action: action,
      module: moduleName,
      recordId: recordId || '',
      detail: detail || ''
    });
  }

  function findProduct(state, productId) {
    return state.products.find(function (product) {
      return product.id === productId;
    });
  }

  function findCategory(state, categoryId) {
    return state.categories.find(function (category) {
      return category.id === categoryId;
    });
  }

  function findCustomer(state, customerId) {
    return state.customers.find(function (customer) {
      return customer.id === customerId;
    });
  }

  function transactionNumber(state, timestamp) {
    var date = new Date(timestamp);
    var datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    var sequence = Number(state.settings.nextTransactionNumber) || 1;
    state.settings.nextTransactionNumber = sequence + 1;
    return 'TRX-' + datePart + '-' + String(sequence).padStart(4, '0');
  }

  function normalizeSaleItems(state, items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Keranjang transaksi masih kosong.');
    }

    return items.map(function (item) {
      var product = findProduct(state, item.productId);
      var quantity = roundQuantity(item.quantity);

      if (!product || product.status !== 'AKTIF') {
        throw new Error('Barang tidak tersedia atau sudah dinonaktifkan.');
      }
      if (quantity <= 0) {
        throw new Error('Jumlah barang harus lebih besar dari nol.');
      }
      if (product.type !== 'NON_STOK' &&
          !state.settings.allowNegativeStock &&
          quantity > Number(product.stock)) {
        throw new Error('Stok ' + product.name + ' tidak mencukupi.');
      }

      var price = roundMoney(product.sellPrice);
      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        price: price,
        quantity: quantity,
        discount: 0,
        subtotal: roundMoney(price * quantity)
      };
    });
  }

  function finalizeSale(state, payload) {
    payload = payload || {};
    var timestamp = payload.timestamp || isoNow();
    var items = normalizeSaleItems(state, payload.items);
    var subtotal = roundMoney(items.reduce(function (sum, item) {
      return sum + item.subtotal;
    }, 0));
    var discount = Math.min(Math.max(roundMoney(payload.discount), 0), subtotal);
    var taxRate = Math.max(toNumber(payload.taxRate, toNumber(state.settings.taxRate, 0)), 0);
    var tax = roundMoney((subtotal - discount) * taxRate / 100);
    var total = roundMoney(subtotal - discount + tax);
    var paymentMethod = normalizeText(payload.paymentMethod || 'TUNAI').toUpperCase();
    var paid = roundMoney(payload.amountPaid);
    var change = 0;

    if (paymentMethod === 'TUNAI') {
      if (paid < total) {
        throw new Error('Nominal tunai kurang dari total transaksi.');
      }
      change = roundMoney(paid - total);
    } else {
      paid = total;
    }

    var customerId = payload.customerId || 'CUS-GENERAL';
    var customer = findCustomer(state, customerId) || findCustomer(state, 'CUS-GENERAL');
    var sale = {
      id: createId('SALE'),
      number: transactionNumber(state, timestamp),
      timestamp: timestamp,
      cashier: normalizeText(payload.cashier || (state.currentUser && state.currentUser.name) || 'Kasir'),
      customerId: customer ? customer.id : 'CUS-GENERAL',
      customerName: customer ? customer.name : 'Pelanggan Umum',
      items: items,
      subtotal: subtotal,
      discount: discount,
      taxRate: taxRate,
      tax: tax,
      total: total,
      paymentMethod: paymentMethod,
      amountPaid: paid,
      change: change,
      paymentReference: normalizeText(payload.paymentReference),
      status: 'LUNAS'
    };

    items.forEach(function (item) {
      var product = findProduct(state, item.productId);
      if (product.type !== 'NON_STOK') {
        var before = Number(product.stock) || 0;
        product.stock = roundQuantity(before - item.quantity);
        state.stockMovements.unshift({
          id: createId('MOV'),
          timestamp: timestamp,
          productId: product.id,
          type: 'PENJUALAN',
          quantityIn: 0,
          quantityOut: item.quantity,
          stockBefore: before,
          stockAfter: product.stock,
          reference: sale.number,
          reason: 'Penjualan POS',
          userId: state.currentUser && state.currentUser.id
        });
      }
    });

    state.sales.unshift(sale);
    if (customer) {
      customer.totalTransactions = Number(customer.totalTransactions || 0) + 1;
      customer.totalPurchases = roundMoney(Number(customer.totalPurchases || 0) + total);
      customer.points = Number(customer.points || 0) + Math.floor(total / 10000);
    }
    addAudit(state, 'CREATE', 'SALES', sale.id, sale.number);
    return clone(sale);
  }

  function saveProduct(state, input) {
    input = input || {};
    var name = normalizeText(input.name);
    var sku = normalizeText(input.sku).toUpperCase();
    var categoryId = normalizeText(input.categoryId);

    if (!name || !sku || !categoryId) {
      throw new Error('Nama, SKU, dan kategori barang wajib diisi.');
    }
    if (!findCategory(state, categoryId)) {
      throw new Error('Kategori barang tidak ditemukan.');
    }

    var duplicate = state.products.find(function (product) {
      return product.sku === sku && product.id !== input.id;
    });
    if (duplicate) {
      throw new Error('SKU sudah digunakan oleh barang lain.');
    }

    var product = input.id ? findProduct(state, input.id) : null;
    if (!product) {
      product = {
        id: createId('PRD'),
        stock: 0,
        status: 'AKTIF'
      };
      state.products.push(product);
    }

    product.sku = sku;
    product.barcode = normalizeText(input.barcode);
    product.name = name;
    product.categoryId = categoryId;
    product.unit = normalizeText(input.unit) || 'pcs';
    product.costPrice = roundMoney(input.costPrice);
    product.sellPrice = roundMoney(input.sellPrice);
    product.minStock = Math.max(roundQuantity(input.minStock), 0);
    product.type = input.type === 'NON_STOK' ? 'NON_STOK' : 'STOK';
    product.status = input.status === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF';
    addAudit(state, input.id ? 'UPDATE' : 'CREATE', 'PRODUCTS', product.id, product.name);
    return clone(product);
  }

  function saveCategory(state, input) {
    input = input || {};
    var name = normalizeText(input.name);
    if (!name) {
      throw new Error('Nama kategori wajib diisi.');
    }
    var duplicate = state.categories.find(function (category) {
      return category.name.toLowerCase() === name.toLowerCase() && category.id !== input.id;
    });
    if (duplicate) {
      throw new Error('Nama kategori sudah digunakan.');
    }

    var category = input.id ? findCategory(state, input.id) : null;
    if (!category) {
      category = {
        id: createId('CAT'),
        order: state.categories.length + 1,
        status: 'AKTIF'
      };
      state.categories.push(category);
    }
    category.name = name;
    category.description = normalizeText(input.description);
    category.order = Number(input.order) || category.order;
    category.status = input.status === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF';
    addAudit(state, input.id ? 'UPDATE' : 'CREATE', 'CATEGORIES', category.id, category.name);
    return clone(category);
  }

  function saveCustomer(state, input) {
    input = input || {};
    var name = normalizeText(input.name);
    if (!name) {
      throw new Error('Nama pelanggan wajib diisi.');
    }

    var customer = input.id ? findCustomer(state, input.id) : null;
    if (!customer) {
      customer = {
        id: createId('CUS'),
        joinedAt: isoNow(),
        totalTransactions: 0,
        totalPurchases: 0,
        points: 0,
        status: 'AKTIF'
      };
      state.customers.push(customer);
    }
    customer.name = name;
    customer.phone = normalizeText(input.phone);
    customer.address = normalizeText(input.address);
    customer.status = input.status === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF';
    addAudit(state, input.id ? 'UPDATE' : 'CREATE', 'CUSTOMERS', customer.id, customer.name);
    return clone(customer);
  }

  function recordStockMovement(state, input) {
    input = input || {};
    var product = findProduct(state, input.productId);
    var quantity = roundQuantity(input.quantity);
    var type = normalizeText(input.type).toUpperCase();

    if (!product || product.type === 'NON_STOK') {
      throw new Error('Barang stok tidak ditemukan.');
    }
    if (quantity <= 0) {
      throw new Error('Jumlah stok harus lebih besar dari nol.');
    }
    if (['RESTOCK', 'PENYESUAIAN_MASUK', 'RETUR_PENJUALAN'].indexOf(type) === -1 &&
        ['PENGELUARAN_MANUAL', 'PENYESUAIAN_KELUAR', 'RETUR_PEMBELIAN'].indexOf(type) === -1) {
      throw new Error('Jenis mutasi stok tidak valid.');
    }

    var incoming = ['RESTOCK', 'PENYESUAIAN_MASUK', 'RETUR_PENJUALAN'].indexOf(type) !== -1;
    var before = Number(product.stock) || 0;
    var after = roundQuantity(incoming ? before + quantity : before - quantity);
    if (after < 0 && !state.settings.allowNegativeStock) {
      throw new Error('Stok tidak boleh menjadi negatif.');
    }

    product.stock = after;
    var movement = {
      id: createId('MOV'),
      timestamp: isoNow(),
      productId: product.id,
      type: type,
      quantityIn: incoming ? quantity : 0,
      quantityOut: incoming ? 0 : quantity,
      stockBefore: before,
      stockAfter: after,
      reference: normalizeText(input.reference),
      reason: normalizeText(input.reason) || 'Penyesuaian stok',
      userId: state.currentUser && state.currentUser.id
    };
    state.stockMovements.unshift(movement);
    addAudit(state, 'CREATE', 'STOCK', movement.id, product.name + ' ' + type);
    return clone(movement);
  }

  function withinRange(timestamp, from, to) {
    var date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    var key = dateKey(date);
    return (!from || key >= from) && (!to || key <= to);
  }

  function getDashboardReport(state, from, to) {
    var sales = state.sales.filter(function (sale) {
      return sale.status === 'LUNAS' && withinRange(sale.timestamp, from, to);
    });
    var grossSales = roundMoney(sales.reduce(function (sum, sale) {
      return sum + sale.subtotal;
    }, 0));
    var discount = roundMoney(sales.reduce(function (sum, sale) {
      return sum + sale.discount;
    }, 0));
    var tax = roundMoney(sales.reduce(function (sum, sale) {
      return sum + sale.tax;
    }, 0));
    var revenue = roundMoney(sales.reduce(function (sum, sale) {
      return sum + sale.total;
    }, 0));
    var cost = roundMoney(sales.reduce(function (sum, sale) {
      return sum + sale.items.reduce(function (itemSum, item) {
        var product = findProduct(state, item.productId);
        return itemSum + (product ? product.costPrice * item.quantity : 0);
      }, 0);
    }, 0));
    var byPayment = {};
    var byCategory = {};
    var topProducts = {};

    sales.forEach(function (sale) {
      byPayment[sale.paymentMethod] = roundMoney((byPayment[sale.paymentMethod] || 0) + sale.total);
      sale.items.forEach(function (item) {
        var product = findProduct(state, item.productId);
        var category = product && findCategory(state, product.categoryId);
        var categoryName = category ? category.name : 'Tanpa kategori';
        byCategory[categoryName] = roundMoney((byCategory[categoryName] || 0) + item.subtotal);
        if (!topProducts[item.productId]) {
          topProducts[item.productId] = {
            productId: item.productId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        topProducts[item.productId].quantity += item.quantity;
        topProducts[item.productId].revenue = roundMoney(
          topProducts[item.productId].revenue + item.subtotal
        );
      });
    });

    return {
      from: from || '',
      to: to || '',
      transactionCount: sales.length,
      grossSales: grossSales,
      discount: discount,
      tax: tax,
      revenue: revenue,
      cost: cost,
      grossProfit: roundMoney(revenue - cost),
      averageTransaction: sales.length ? roundMoney(revenue / sales.length) : 0,
      byPayment: byPayment,
      byCategory: byCategory,
      topProducts: Object.keys(topProducts)
        .map(function (key) {
          return topProducts[key];
        })
        .sort(function (a, b) {
          return b.revenue - a.revenue;
        })
        .slice(0, 10),
      sales: sales
    };
  }

  function getLowStockProducts(state) {
    return state.products.filter(function (product) {
      return product.status === 'AKTIF' &&
        product.type !== 'NON_STOK' &&
        Number(product.stock) <= Number(product.minStock);
    }).sort(function (a, b) {
      return a.stock - b.stock;
    });
  }

  function getStockValue(state) {
    return roundMoney(state.products.reduce(function (sum, product) {
      return sum + (product.type === 'NON_STOK' ? 0 : product.stock * product.costPrice);
    }, 0));
  }

  function getPublicConstants() {
    return {
      storageKey: STORAGE_KEY,
      sheetHeaders: clone(SHEET_HEADERS)
    };
  }

  /*
   * Apps Script adapter
   *
   * The local application does not call these functions, but they make this
   * same file usable as code.gs after the HTML files are uploaded to Apps
   * Script. The spreadsheet is initialized lazily by setupSpreadsheet().
   */
  function appsScriptSheet_(name) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(name);
    }
    return sheet;
  }

  function appsScriptEnsureSheet_(name) {
    var sheet = appsScriptSheet_(name);
    var headers = SHEET_HEADERS[name];
    if (headers && sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
    return sheet;
  }

  function appsScriptRows_(sheet) {
    var values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      return [];
    }
    var headers = values[0];
    return values.slice(1).map(function (row, index) {
      var item = { _row: index + 2 };
      headers.forEach(function (header, columnIndex) {
        item[header] = row[columnIndex];
      });
      return item;
    });
  }

  function appsScriptSetup_() {
    Object.keys(SHEET_HEADERS).forEach(function (name) {
      appsScriptEnsureSheet_(name);
    });
    return { success: true, message: 'Sheet aplikasi berhasil disiapkan.' };
  }

  function appsScriptGetBootstrapData_() {
    appsScriptSetup_();
    var settings = {};
    appsScriptRows_(appsScriptSheet_('Settings')).forEach(function (row) {
      settings[row.key] = row.value;
    });
    var categories = appsScriptRows_(appsScriptSheet_('Categories')).map(function (row) {
      return {
        id: String(row.category_id),
        name: String(row.nama),
        description: String(row.deskripsi || ''),
        order: Number(row.urutan) || 0,
        status: String(row.status || 'AKTIF')
      };
    });
    var products = appsScriptRows_(appsScriptSheet_('Products')).map(function (row) {
      return {
        id: String(row.product_id),
        sku: String(row.sku),
        barcode: String(row.barcode || ''),
        name: String(row.nama),
        categoryId: String(row.category_id),
        unit: String(row.satuan || 'pcs'),
        costPrice: Number(row.harga_beli) || 0,
        sellPrice: Number(row.harga_jual) || 0,
        stock: Number(row.stok_saat_ini) || 0,
        minStock: Number(row.stok_minimum) || 0,
        type: String(row.tipe || 'STOK'),
        status: String(row.status || 'AKTIF')
      };
    });
    var customers = appsScriptRows_(appsScriptSheet_('Customers')).map(function (row) {
      return {
        id: String(row.customer_id),
        name: String(row.nama),
        phone: String(row.telepon || ''),
        address: String(row.alamat || ''),
        joinedAt: row.tanggal_bergabung,
        totalTransactions: Number(row.total_transaksi) || 0,
        totalPurchases: Number(row.total_pembelian) || 0,
        points: Number(row.poin) || 0,
        status: String(row.status || 'AKTIF')
      };
    });
    return {
      settings: settings,
      categories: categories,
      products: products,
      customers: customers
    };
  }

  function appsScriptFindRow_(sheet, keyColumn, keyValue) {
    var rows = appsScriptRows_(sheet);
    return rows.find(function (row) {
      return String(row[keyColumn]) === String(keyValue);
    });
  }

  function appsScriptSetRow_(sheet, rowNumber, values) {
    sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
  }

  function appsScriptNextTransactionSequence_(salesSheet, timestamp) {
    var datePart = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    var rows = appsScriptRows_(salesSheet);
    var latest = rows
      .map(function (row) {
        return String(row.nomor_transaksi || '');
      })
      .filter(function (number) {
        return number.indexOf('TRX-' + datePart + '-') === 0;
      })
      .map(function (number) {
        return Number(number.split('-').pop()) || 0;
      })
      .sort(function (a, b) {
        return b - a;
      })[0] || 0;
    return latest + 1;
  }

  function appsScriptSaveProduct_(input) {
    appsScriptSetup_();
    input = input || {};
    var sheet = appsScriptSheet_('Products');
    var id = input.id || createId('PRD');
    var existing = appsScriptFindRow_(sheet, 'product_id', id);
    var values = [
      id,
      normalizeText(input.sku).toUpperCase(),
      normalizeText(input.barcode),
      normalizeText(input.name),
      normalizeText(input.categoryId),
      normalizeText(input.unit) || 'pcs',
      roundMoney(input.costPrice),
      roundMoney(input.sellPrice),
      existing ? Number(existing.stok_saat_ini) || 0 : 0,
      Math.max(roundQuantity(input.minStock), 0),
      input.type === 'NON_STOK' ? 'NON_STOK' : 'STOK',
      input.status === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF'
    ];
    if (existing) {
      appsScriptSetRow_(sheet, existing._row, values);
    } else {
      sheet.appendRow(values);
    }
    return { success: true, productId: id };
  }

  function appsScriptSaveCategory_(input) {
    appsScriptSetup_();
    input = input || {};
    var sheet = appsScriptSheet_('Categories');
    var id = input.id || createId('CAT');
    var existing = appsScriptFindRow_(sheet, 'category_id', id);
    var values = [
      id,
      normalizeText(input.name),
      normalizeText(input.description),
      Number(input.order) || 0,
      input.status === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF'
    ];
    if (existing) {
      appsScriptSetRow_(sheet, existing._row, values);
    } else {
      sheet.appendRow(values);
    }
    return { success: true, categoryId: id };
  }

  function appsScriptSaveCustomer_(input) {
    appsScriptSetup_();
    input = input || {};
    var sheet = appsScriptSheet_('Customers');
    var id = input.id || createId('CUS');
    var existing = appsScriptFindRow_(sheet, 'customer_id', id);
    var values = [
      id,
      normalizeText(input.name),
      normalizeText(input.phone),
      normalizeText(input.address),
      existing ? existing.tanggal_bergabung : new Date(),
      existing ? existing.total_transaksi : 0,
      existing ? existing.total_pembelian : 0,
      existing ? existing.poin : 0,
      input.status === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF'
    ];
    if (existing) {
      appsScriptSetRow_(sheet, existing._row, values);
    } else {
      sheet.appendRow(values);
    }
    return { success: true, customerId: id };
  }

  function appsScriptSaveSale_(payload) {
    appsScriptSetup_();
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var productSheet = appsScriptSheet_('Products');
      var salesSheet = appsScriptSheet_('Sales');
      var detailsSheet = appsScriptSheet_('SaleDetails');
      var paymentsSheet = appsScriptSheet_('Payments');
      var stockSheet = appsScriptSheet_('StockMovements');
      var productRows = appsScriptRows_(productSheet);
      var products = productRows.map(function (row) {
        return {
          id: String(row.product_id),
          sku: String(row.sku),
          name: String(row.nama),
          unit: String(row.satuan || 'pcs'),
          costPrice: Number(row.harga_beli) || 0,
          sellPrice: Number(row.harga_jual) || 0,
          stock: Number(row.stok_saat_ini) || 0,
          minStock: Number(row.stok_minimum) || 0,
          type: String(row.tipe || 'STOK'),
          status: String(row.status || 'AKTIF')
        };
      });
      var localState = createInitialState();
      localState.products = products;
      localState.customers = appsScriptGetBootstrapData_().customers;
      localState.settings.allowNegativeStock = false;
      localState.settings.nextTransactionNumber = appsScriptNextTransactionSequence_(
        salesSheet,
        payload && payload.timestamp ? payload.timestamp : new Date()
      );
      var sale = finalizeSale(localState, payload);
      var productRowsById = {};

      productRows.forEach(function (row) {
        productRowsById[String(row.product_id)] = row;
      });
      sale.items.forEach(function (item) {
        var row = productRowsById[item.productId];
        var product = findProduct(localState, item.productId);
        if (row && product) {
          productSheet.getRange(row._row, 9).setValue(product.stock);
        }
      });

      salesSheet.appendRow([
        sale.id,
        sale.number,
        new Date(sale.timestamp),
        sale.cashier,
        sale.customerId,
        sale.subtotal,
        sale.discount,
        sale.tax,
        sale.total,
        sale.paymentMethod,
        sale.status,
        sale.paymentReference
      ]);
      sale.items.forEach(function (item) {
        detailsSheet.appendRow([
          createId('DTL'),
          sale.id,
          item.productId,
          item.sku,
          item.name,
          item.price,
          item.quantity,
          item.discount,
          item.subtotal
        ]);
      });
      paymentsSheet.appendRow([
        createId('PAY'),
        sale.id,
        sale.paymentMethod,
        sale.total,
        sale.amountPaid,
        sale.change,
        'LUNAS',
        new Date(sale.timestamp),
        sale.paymentReference
      ]);
      sale.items.forEach(function (item) {
        var product = findProduct(localState, item.productId);
        if (product.type !== 'NON_STOK') {
          stockSheet.appendRow([
            createId('MOV'),
            new Date(sale.timestamp),
            product.id,
            'PENJUALAN',
            0,
            item.quantity,
            product.stock + item.quantity,
            product.stock,
            sale.number,
            'Penjualan POS',
            sale.cashier
          ]);
        }
      });
      var customerSheet = appsScriptSheet_('Customers');
      var customerRow = appsScriptFindRow_(customerSheet, 'customer_id', sale.customerId);
      var customer = findCustomer(localState, sale.customerId);
      if (customerRow && customer) {
        appsScriptSetRow_(customerSheet, customerRow._row, [
          customer.id,
          customer.name,
          customer.phone,
          customer.address,
          customerRow.tanggal_bergabung,
          customer.totalTransactions,
          customer.totalPurchases,
          customer.points,
          customer.status
        ]);
      }
      SpreadsheetApp.flush();
      return { success: true, sale: sale };
    } finally {
      lock.releaseLock();
    }
  }

  function appsScriptRecordStockMovement_(input) {
    appsScriptSetup_();
    var data = appsScriptGetBootstrapData_();
    var state = createInitialState();
    state.products = data.products;
    state.settings.allowNegativeStock = false;
    var movement = recordStockMovement(state, input);
    var productSheet = appsScriptSheet_('Products');
    var movementSheet = appsScriptSheet_('StockMovements');
    var productRow = appsScriptFindRow_(productSheet, 'product_id', movement.productId);
    if (productRow) {
      productSheet.getRange(productRow._row, 9).setValue(movement.stockAfter);
    }
    movementSheet.appendRow([
      movement.id,
      new Date(movement.timestamp),
      movement.productId,
      movement.type,
      movement.quantityIn,
      movement.quantityOut,
      movement.stockBefore,
      movement.stockAfter,
      movement.reference,
      movement.reason,
      movement.userId
    ]);
    return { success: true, movement: movement };
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    SHEET_HEADERS: SHEET_HEADERS,
    clone: clone,
    createInitialState: createInitialState,
    createLocalStore: createLocalStore,
    createId: createId,
    finalizeSale: finalizeSale,
    saveProduct: saveProduct,
    saveCategory: saveCategory,
    saveCustomer: saveCustomer,
    recordStockMovement: recordStockMovement,
    getDashboardReport: getDashboardReport,
    getLowStockProducts: getLowStockProducts,
    getStockValue: getStockValue,
    getPublicConstants: getPublicConstants,
    roundMoney: roundMoney,
    appsScriptDoGet: function () {
      return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Kasir Warung UMKM')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    },
    appsScriptSetup: appsScriptSetup_,
    appsScriptGetBootstrapData: appsScriptGetBootstrapData_,
    appsScriptSaveSale: appsScriptSaveSale_,
    appsScriptSaveProduct: appsScriptSaveProduct_,
    appsScriptSaveCategory: appsScriptSaveCategory_,
    appsScriptSaveCustomer: appsScriptSaveCustomer_,
    appsScriptRecordStockMovement: appsScriptRecordStockMovement_
  };
});

/*
 * Keep Apps Script entry points as top-level declarations. Apps Script uses
 * static parsing for its function picker and does not discover functions that
 * are only assigned inside an IIFE.
 */
function doGet() {
  return KasirBackend.appsScriptDoGet();
}

function setupSpreadsheet() {
  return KasirBackend.appsScriptSetup();
}

function getBootstrapData() {
  return KasirBackend.appsScriptGetBootstrapData();
}

function saveSale(payload) {
  return KasirBackend.appsScriptSaveSale(payload);
}

function saveProduct(product) {
  return KasirBackend.appsScriptSaveProduct(product);
}

function saveCategory(category) {
  return KasirBackend.appsScriptSaveCategory(category);
}

function saveCustomer(customer) {
  return KasirBackend.appsScriptSaveCustomer(customer);
}

function recordStockMovement(payload) {
  return KasirBackend.appsScriptRecordStockMovement(payload);
}
