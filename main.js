// ==========================
// بارگذاری محصولات و نمایش انیمیشنی
// ==========================
fetch("products.json")
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById("product-list");

    data.forEach((product, index) => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.price} تومان</p>
        <button>مشاهده محصول</button>
      `;

      // کلیک روی دکمه یا کارت -> رفتن به صفحه محصول
      div.querySelector("button").onclick = e => {
        e.stopPropagation();
        window.location.href = `product.html?id=${product.id}`;
      };
      div.onclick = () => window.location.href = `product.html?id=${product.id}`;

      // اضافه کردن کارت به لیست
      list.appendChild(div);

      // انیمیشن ورود
      setTimeout(() => div.classList.add("show"), index * 100);
    });
  })
  .catch(err => {
    const list = document.getElementById("product-list");
    list.innerHTML = "<p style='color:red;'>خطا در بارگذاری محصولات</p>";
    console.error(err);
  });

// ==========================
// دکمه بازگشت به بالا
// ==========================
const backToTop = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  backToTop.style.display = window.scrollY > 300 ? "flex" : "none";
});
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

