// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let darkMode = localStorage.getItem('darkMode') === 'enabled';

// DOM Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const cartCountElements = document.querySelectorAll('#cart-count');
const productContainer = document.getElementById('product-container');
const cartItemsContainer = document.getElementById('cart-items');
const checkoutItemsContainer = document.getElementById('checkout-items');
const orderSummaryContainer = document.getElementById('order-summary');
const relatedProductsContainer = document.getElementById('related-products');
const mainProductImage = document.getElementById('main-product-image');
const thumbnailImagesContainer = document.querySelector('.thumbnail-images');
const productTitle = document.getElementById('product-title');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const ratingForm = document.getElementById('rating-form');
const thankYouMessage = document.getElementById('thank-you');
const orderForm = document.getElementById('order-form');
const qrPaymentOption = document.getElementById('qr-payment');
const codPaymentOption = document.getElementById('cod-payment');
const screenshotUpload = document.getElementById('screenshot-upload');
const checkoutTotal = document.getElementById('checkout-total');
const finalTotal = document.getElementById('final-total');
const subtotalElement = document.getElementById('subtotal');
const deliveryElement = document.getElementById('delivery');
const totalElement = document.getElementById('total');

// Initialize the app
function init() {
    // Load products from JSON file
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            renderProducts();
            renderCartCount();
            checkPage();
        })
        .catch(error => console.error('Error loading products:', error));

    // Set dark mode if enabled
    if (darkMode) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Event Listeners
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
    if (ratingForm) ratingForm.addEventListener('submit', handleRatingSubmit);
    if (orderForm) orderForm.addEventListener('submit', handleOrderSubmit);
    
    // Payment method selection
    if (qrPaymentOption && codPaymentOption) {
        const paymentOptions = document.querySelectorAll('input[name="payment"]');
        paymentOptions.forEach(option => {
            option.addEventListener('change', () => {
                if (option.id === 'qr') {
                    qrPaymentOption.classList.add('active');
                    codPaymentOption.classList.remove('active');
                    screenshotUpload.style.display = 'block';
                } else {
                    qrPaymentOption.classList.remove('active');
                    codPaymentOption.classList.add('active');
                    screenshotUpload.style.display = 'none';
                }
            });
        });
    }
}

// Check current page and run page-specific functions
function checkPage() {
    const path = window.location.pathname.split('/').pop();
    
    if (path === 'index.html' || path === '') {
        // Homepage
        renderProducts();
    } else if (path === 'product.html') {
        // Product page
        loadProductDetails();
        loadRelatedProducts();
    } else if (path === 'cart.html') {
        // Cart page
        renderCartItems();
        updateCartSummary();
    } else if (path === 'checkout.html') {
        // Checkout page
        renderCheckoutItems();
        updateCheckoutTotal();
    } else if (path === 'success.html') {
        // Success page
        renderOrderSummary();
    }
}

// Dark Mode Toggle
function toggleDarkMode() {
    darkMode = !darkMode;
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
        this.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        this.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', null);
    }
}

// Product Functions
function renderProducts(filter = 'all') {
    if (!productContainer) return;
    
    let filteredProducts = products;
    if (filter !== 'all') {
        filteredProducts = products.filter(product => product.category === filter);
    }
    
    productContainer.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="price">₹${product.price}</div>
                <div class="rating">
                    ${renderRatingStars(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    const product = products.find(p => p.id == productId);
    if (!product) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set product details
    productTitle.textContent = product.name;
    productPrice.textContent = `₹${product.price}`;
    productDescription.textContent = product.description;
    mainProductImage.src = product.images[0];
    mainProductImage.alt = product.name;
    
    // Set thumbnails
    thumbnailImagesContainer.innerHTML = product.images.map((img, index) => `
        <img src="${img}" alt="Thumbnail ${index + 1}" onclick="changeMainImage(this, '${img}')" 
             class="${index === 0 ? 'active' : ''}">
    `).join('');
    
    // Set up add to cart and buy now buttons
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');
    
    if (addToCartBtn && buyNowBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
            showNotification('Added to cart!');
        });
        
        buyNowBtn.addEventListener('click', () => {
            addToCart(product);
            window.location.href = 'cart.html';
        });
    }
    
    // Set up size selection
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function changeMainImage(thumbnail, imgSrc) {
    // Update main image
    mainProductImage.src = imgSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail-images img').forEach(img => {
        img.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

function loadRelatedProducts() {
    if (!relatedProductsContainer) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const currentProduct = products.find(p => p.id == productId);
    
    if (!currentProduct) return;
    
    // Get 4 random related products (excluding current product)
    const related = products
        .filter(p => p.id != productId && p.category === currentProduct.category)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    
    relatedProductsContainer.innerHTML = related.map(product => `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="price">₹${product.price}</div>
                <div class="rating">
                    ${renderRatingStars(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart Functions
function addToCart(product) {
    const selectedSize = document.querySelector('.size-btn.active')?.textContent || 'M';
    
    // Check if product already exists in cart with same size
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && item.size === selectedSize
    );
    
    if (existingItemIndex !== -1) {
        // Increase quantity if already exists
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size: selectedSize,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification('Added to cart!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    showNotification('Item removed from cart');
}

function updateQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCart();
    }
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartCount();
    
    if (cartItemsContainer) {
        renderCartItems();
        updateCartSummary();
    }
    
    if (checkoutItemsContainer) {
        renderCheckoutItems();
        updateCheckoutTotal();
    }
}

function renderCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach(el => el.textContent = count);
}

function renderCartItems() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="index.html" class="btn">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="cart-item-size">Size: ${item.size}</div>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function updateCartSummary() {
    if (!subtotalElement || !deliveryElement || !totalElement) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal >= 999 ? 0 : 30;
    const total = subtotal + delivery;
    
    subtotalElement.textContent = `₹${subtotal}`;
    deliveryElement.textContent = `₹${delivery}`;
    totalElement.textContent = `₹${total}`;
    
    // Update checkout button if exists
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }
}

// Checkout Functions
function renderCheckoutItems() {
    if (!checkoutItemsContainer) return;
    
    checkoutItemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} (${item.size}) x ${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');
}

function updateCheckoutTotal() {
    if (!checkoutTotal || !finalTotal) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal >= 999 ? 0 : 30;
    const total = subtotal + delivery;
    
    checkoutTotal.textContent = `₹${total}`;
    finalTotal.textContent = `₹${total}`;
}

// Order Submission
function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const formData = new FormData(orderForm);
    const paymentMethod = document.querySelector('input[name="payment"]:checked').id;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal >= 999 ? 0 : 30;
    const total = subtotal + delivery;
    
    const orderData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        paymentMethod: paymentMethod === 'qr' ? 'QR Payment' : 'Cash on Delivery',
        screenshot: paymentMethod === 'qr' ? formData.get('screenshot') : null,
        items: cart,
        subtotal,
        delivery,
        total,
        date: new Date().toLocaleString()
    };
    
    // In a real app, you would send this to your server
    console.log('Order submitted:', orderData);
    
    // For demo purposes, we'll simulate sending the order
    setTimeout(() => {
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartCount();
        
        // Redirect to success page with order details
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        window.location.href = 'success.html';
    }, 1000);
}

// Success Page Functions
function renderOrderSummary() {
    if (!orderSummaryContainer) return;
    
    const orderData = JSON.parse(localStorage.getItem('lastOrder'));
    if (!orderData) {
        window.location.href = 'index.html';
        return;
    }
    
    orderSummaryContainer.innerHTML = `
        <div class="order-item">
            <span>Order Number:</span>
            <span>#${Math.floor(Math.random() * 1000000)}</span>
        </div>
        <div class="order-item">
            <span>Date:</span>
            <span>${orderData.date}</span>
        </div>
        <div class="order-item">
            <span>Payment Method:</span>
            <span>${orderData.paymentMethod}</span>
        </div>
        ${orderData.items.map(item => `
            <div class="order-item">
                <span>${item.name} (${item.size}) x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `).join('')}
        <div class="order-item">
            <span>Subtotal:</span>
            <span>₹${orderData.subtotal}</span>
        </div>
        <div class="order-item">
            <span>Delivery:</span>
            <span>₹${orderData.delivery}</span>
        </div>
        <div class="order-item">
            <span>Total:</span>
            <span>₹${orderData.total}</span>
        </div>
    `;
}

// Rating Functions
function handleRatingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(ratingForm);
    const rating = formData.get('rating');
    const feedback = formData.get('feedback');
    
    // In a real app, you would send this to your server
    console.log('Rating submitted:', { rating, feedback });
    
    // Show thank you message
    ratingForm.style.display = 'none';
    thankYouMessage.style.display = 'block';
}

// Helper Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary-color);
        color: white;
        padding: 12px 24px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .notification.show {
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Expose some functions to the global scope for HTML onclick attributes
window.filterProducts = function(category) {
    renderProducts(category);
};

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.changeMainImage = changeMainImage;