// main.js - فایل اصلی سایت DNI CO

document.addEventListener('DOMContentLoaded', function() {
  const productList = document.getElementById('product-list');
  
  // تابع اصلی بارگذاری محصولات
  async function loadProducts() {
    try {
      // ابتدا لودینگ نمایش می‌دهیم
      showLoading();
      
      // گرفتن محصولات از JSON
      const response = await fetch('products.json');
      if (!response.ok) throw new Error('خطا در دریافت محصولات');
      
      const products = await response.json();
      
      // پاک کردن لودینگ
      hideLoading();
      
      // نمایش محصولات
      displayProducts(products);
      
    } catch (error) {
      console.error('خطا:', error);
      showError();
    }
  }
  
  // نمایش وضعیت لودینگ
  function showLoading() {
    if (productList) {
      productList.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <p style="margin-top: 20px; color: #666;">در حال بارگذاری...</p>
        </div>
      `;
    }
  }
  
  // پنهان کردن لودینگ
  function hideLoading() {
    // فقط محتوای لودینگ پاک می‌شود
  }
  
  // نمایش خطا
  function showError() {
    if (productList) {
      productList.innerHTML = `
        <div class="error" style="text-align: center; padding: 50px; color: #ff3b30;">
          <h3>خطا در بارگذاری محصولات</h3>
          <p>لطفاً دوباره تلاش کنید</p>
          <button onclick="location.reload()" class="btn-details" style="margin-top: 20px;">
            تلاش مجدد
          </button>
        </div>
      `;
    }
  }
  
  // نمایش محصولات
  function displayProducts(products) {
    if (!productList) return;
    
    // پاک کردن محتوا
    productList.innerHTML = '';
    
    // ایجاد کارت برای هر محصول
    products.forEach((product, index) => {
      const productCard = createProductCard(product, index);
      productList.appendChild(productCard);
      
      // انیمیشن ورود با تاخیر
      setTimeout(() => {
        productCard.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
      }, 50);
    });
  }
  
  // ساخت کارت محصول
  function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product fade-in';
    card.style.opacity = '0';
    
    const priceText = product.price === "0" || product.price === 0 
      ? '<span class="product-price free">رایگان</span>'
      : `<span class="product-price">${parseInt(product.price).toLocaleString('fa-IR')} تومان</span>`;
    
    const badge = product.id === 1 
      ? '<div class="product-badge">ویژه</div>' 
      : '';
    
    card.innerHTML = `
      ${badge}
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" 
             onerror="this.src='https://via.placeholder.com/300x200/007aff/ffffff?text=DNI+CO'">
      </div>
      <div class="product-content">
        <h3 class="product-title">${product.name}</h3>
        ${priceText}
        <p class="product-description">${product.details.substring(0, 100)}...</p>
        <div class="product-actions">
          <a href="product.html?id=${product.id}" class="btn-details">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            مشاهده جزئیات
          </a>
        </div>
      </div>
    `;
    
    // رویداد کلیک روی کارت
    card.addEventListener('click', function(e) {
      if (!e.target.closest('a')) {
        window.location.href = `product.html?id=${product.id}`;
      }
    });
    
    return card;
  }
  
  // شروع بارگذاری
  loadProducts();
  
  // مدیریت دکمه بازگشت به بالا
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.style.display = 'flex';
      } else {
        backToTop.style.display = 'none';
      }
    });
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// تابع کمکی برای خطای تصویر
function handleImageError(img) {
  img.src = 'https://via.placeholder.com/300x200/007aff/ffffff?text=DNI+CO';
  img.onerror = null;
}
