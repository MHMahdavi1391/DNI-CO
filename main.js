/**
 * main.js - فایل اصلی JavaScript برای سایت DNI CO
 * مدیریت محصولات، انیمیشن‌ها، تعاملات و localStorage
 */

document.addEventListener('DOMContentLoaded', function() {
  // ====================
  // 1. تنظیمات اولیه
  // ====================
  const CONFIG = {
    PRODUCTS_URL: 'products.json',
    HITS_KEY: 'dni_product_hits',
    ORDERS_KEY: 'dni_product_orders',
    THEME_KEY: 'dni_theme_preference'
  };

  const elements = {
    productList: document.getElementById('product-list'),
    backToTop: document.getElementById('back-to-top'),
    statsBar: document.querySelector('.stats-bar'),
    quickNav: document.querySelector('.quick-nav')
  };

  let state = {
    products: [],
    hits: {},
    isLoading: true,
    error: null
  };

  // ====================
  // 2. بارگذاری اولیه
  // ====================
  async function initialize() {
    try {
      showLoading();
      await Promise.all([
        loadProducts(),
        loadHits()
      ]);
      renderProducts();
      setupEventListeners();
      updateStatsDisplay();
    } catch (error) {
      handleError(error);
    } finally {
      hideLoading();
      setupScrollEffects();
    }
  }

  // ====================
  // 3. بارگذاری محصولات
  // ====================
  async function loadProducts() {
    try {
      const response = await fetch(CONFIG.PRODUCTS_URL);
      if (!response.ok) {
        throw new Error(`خطا در دریافت محصولات: ${response.status}`);
      }
      state.products = await response.json();
    } catch (error) {
      console.error('خطا در بارگذاری محصولات:', error);
      state.error = error.message;
    }
  }

  // ====================
  // 4. مدیریت بازدیدها
  // ====================
  function loadHits() {
    try {
      const savedHits = localStorage.getItem(CONFIG.HITS_KEY);
      state.hits = savedHits ? JSON.parse(savedHits) : {};
      
      // مقداردهی اولیه برای محصولات جدید
      state.products.forEach(product => {
        if (!state.hits[product.id]) {
          state.hits[product.id] = 0;
        }
      });
      
      saveHits();
    } catch (error) {
      console.warn('خطا در بارگذاری بازدیدها:', error);
      state.hits = {};
    }
  }

  function saveHits() {
    try {
      localStorage.setItem(CONFIG.HITS_KEY, JSON.stringify(state.hits));
    } catch (error) {
      console.warn('خطا در ذخیره بازدیدها:', error);
    }
  }

  function incrementHit(productId) {
    if (!state.hits[productId]) {
      state.hits[productId] = 0;
    }
    state.hits[productId]++;
    saveHits();
    updateHitDisplay(productId);
    updateStatsDisplay();
  }

  // ====================
  // 5. رندر محصولات
  // ====================
  function renderProducts() {
    if (!elements.productList) return;
    
    if (state.error) {
      showErrorState();
      return;
    }
    
    if (state.products.length === 0) {
      showEmptyState();
      return;
    }
    
    elements.productList.innerHTML = '';
    
    state.products.forEach((product, index) => {
      const productCard = createProductCard(product, index);
      elements.productList.appendChild(productCard);
    });
  }

  function createProductCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product';
    card.dataset.id = product.id;
    card.dataset.category = product.category || 'general';
    card.tabIndex = 0;
    card.setAttribute('aria-label', `محصول ${product.name} با قیمت ${product.price} تومان`);
    
    const hits = state.hits[product.id] || 0;
    const priceText = product.price === "0" || product.price === 0 ? 
      `<span class="price free" aria-label="رایگان">رایگان</span>` : 
      `<span class="price" aria-label="${product.price} تومان">${formatPrice(product.price)} تومان</span>`;
    
    const badge = product.id === 1 ? '<span class="product-badge" aria-hidden="true">پیشنهاد ویژه</span>' : '';
    
    card.innerHTML = `
      <div class="product-image-container">
        ${badge}
        <img src="${product.image}" 
             alt="${product.name}" 
             loading="lazy"
             onerror="handleImageError(this)">
      </div>
      <h3>${product.name}</h3>
      ${priceText}
      <div class="hit-counter" aria-label="تعداد بازدید: ${hits}">
        <span class="hit-icon" aria-hidden="true">👁️</span>
        <span class="hit-count">${hits}</span> بازدید
      </div>
      <button class="view-btn" 
              onclick="viewProduct(${product.id})"
              aria-label="مشاهده جزئیات و سفارش ${product.name}">
        مشاهده و سفارش
      </button>
    `;
    
    // انیمیشن ورود با تاخیر
    setTimeout(() => {
      card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
    }, 100);
    
    // رویدادهای کیبورد برای accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        viewProduct(product.id);
      }
    });
    
    return card;
  }

  // ====================
  // 6. نمایش وضعیت‌ها
  // ====================
  function showLoading() {
    if (elements.productList) {
      elements.productList.innerHTML = `
        <div class="loading-state" aria-live="polite" aria-busy="true">
          <div class="spinner" aria-hidden="true"></div>
          <span class="loading-text">در حال بارگذاری محصولات...</span>
        </div>
      `;
    }
    state.isLoading = true;
  }

  function hideLoading() {
    state.isLoading = false;
  }

  function showErrorState() {
    if (elements.productList) {
      elements.productList.innerHTML = `
        <div class="error-state" role="alert">
          <h3>خطا در بارگذاری محصولات</h3>
          <p>${state.error || 'مشکلی در ارتباط با سرور پیش آمده است.'}</p>
          <button onclick="location.reload()" class="view-btn mt-2">
            تلاش مجدد
          </button>
        </div>
      `;
    }
  }

  function showEmptyState() {
    if (elements.productList) {
      elements.productList.innerHTML = `
        <div class="empty-state">
          <h3>محصولی یافت نشد</h3>
          <p>در حال حاضر محصولی برای نمایش وجود ندارد.</p>
        </div>
      `;
    }
  }

  // ====================
  // 7. به‌روزرسانی نمایش
  // ====================
  function updateHitDisplay(productId) {
    const hitElements = document.querySelectorAll(`[data-id="${productId}"] .hit-count`);
    const currentHits = state.hits[productId] || 0;
    
    hitElements.forEach(element => {
      element.textContent = currentHits;
      element.parentElement.setAttribute('aria-label', `تعداد بازدید: ${currentHits}`);
      
      // انیمیشن
      element.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
    });
  }

  function updateStatsDisplay() {
    const totalHits = Object.values(state.hits).reduce((sum, hits) => sum + hits, 0);
    
    if (elements.statsBar) {
      elements.statsBar.textContent = `مجموع بازدیدها: ${totalHits}`;
    }
  }

  // ====================
  // 8. مدیریت ناوبری
  // ====================
  function viewProduct(productId) {
    incrementHit(productId);
    
    // انتقال به صفحه محصول
    window.location.href = `product.html?id=${productId}`;
    
    // ثبت در تاریخچه مرورگر
    history.replaceState({ productId }, '', `?highlight=${productId}`);
  }

  // ====================
  // 9. رویدادها
  // ====================
  function setupEventListeners() {
    // دکمه بازگشت به بالا
    if (elements.backToTop) {
      elements.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    // مدیریت اسکرول
    window.addEventListener('scroll', handleScroll);
    
    // رویدادهای کیبورد
    document.addEventListener('keydown', (e) => {
      // اسکرول با کلیدهای جهت‌دار
      if (e.key === 'ArrowUp' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function handleScroll() {
    // دکمه بازگشت به بالا
    if (elements.backToTop) {
      elements.backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }
    
    // نمایش آمار در اسکرول
    if (window.scrollY > 200) {
      updateStatsDisplay();
    }
  }

  function setupScrollEffects() {
    // انیمیشن اسکرول برای محصولات
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.product').forEach(product => {
      observer.observe(product);
    });
  }

  // ====================
  // 10. توابع کمکی
  // ====================
  function formatPrice(price) {
    if (!price) return '۰';
    return parseInt(price).toLocaleString('fa-IR');
  }

  // ====================
  // 11. توابع global
  // ====================
  window.viewProduct = viewProduct;
  
  window.handleImageError = function(img) {
    img.src = 'images/placeholder.png';
    img.onerror = null;
    img.alt = 'تصویر جایگزین';
  };
  
  window.showStats = function() {
    const totalHits = Object.values(state.hits).reduce((sum, hits) => sum + hits, 0);
    let message = `📊 آمار بازدید محصولات\n\n`;
    message += `مجموع بازدیدها: ${totalHits}\n\n`;
    
    state.products.forEach(product => {
      const hits = state.hits[product.id] || 0;
      message += `• ${product.name}: ${hits} بازدید\n`;
    });
    
    alert(message);
    
    // همچنین در کنسول نمایش داده می‌شود
    console.table(state.hits);
  };

  // ====================
  // 12. شروع برنامه
  // ====================
  initialize();
});
