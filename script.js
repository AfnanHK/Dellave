// Product Data
const products = [
    {
        id: 1,
        name: "Jacket Denim",
        category: "baju",
        price: 399000,
        image: "assets/denim.jpg",
        description: "Mudah dipadukan dengan berbagai outfit. Memberikan tampilan stylish dan clean."
    },
    {
        id: 2,
        name: "Kaos Oversize Rich Bitch Eater",
        category: "baju",
        price: 150000,
        image: "assets/rich.jpg",
        description: "Bahan tebal dan nyaman. Model oversize / loose fit. Lengan pendek cocok untuk daily outfit."
    },
    {
        id: 3,
        name: "Knitwear Dellave Cut Boxy",
        category: "baju",
        price: 249000,
        image: "assets/boxy.jpg",
        description: "Nyaman dan hangat. Cocok untuk pria maupun wanita (unisex)."
    },
    {
        id: 4,
        name: "Celana Jeans Jorts Pria",
        category: "celana",
        price: 200000,
        image: "assets/jeans.jpg",
        description: "Material Denim tebal dan kuat. Kantong depan dan kantong belakang fungsional."
    },
    {
        id: 5,
        name: "Celana Sweatpants (unisex)",
        category: "celana",
        price: 200000,
        image: "assets/sweat.jpg",
        description: "Nyaman dipakai dan mudah untuk styling"
    },
    {
        id: 6,
        name: "Celana Stripe pants formal Pria",
        category: "celana",
        price: 159000,
        image: "assets/stripe.jpg",
        description: "Memberikan kesan classic dan elegan. Mudah dipadukan dengan berbagai warna atasan."
    }
];

// State Management
let cart = [];
let selectedCategory = 'all';
let selectedProduct = null;
let selectedSize = 'M';
let selectedQuantity = 1;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const overlay = document.getElementById('overlay');
const searchInput = document.getElementById('searchInput');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Cart toggle
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', closeModals);

    // Modal close
    closeModal.addEventListener('click', closeProductModal);

    // Search
    searchInput.addEventListener('input', handleSearch);

    // Category navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            filterByCategory(category);
        });
    });

    // Quantity controls in modal
    document.getElementById('decreaseQty').addEventListener('click', () => {
        if (selectedQuantity > 1) {
            selectedQuantity--;
            document.getElementById('quantity').value = selectedQuantity;
        }
    });

    document.getElementById('increaseQty').addEventListener('click', () => {
        if (selectedQuantity < 10) {
            selectedQuantity++;
            document.getElementById('quantity').value = selectedQuantity;
        }
    });

    document.getElementById('quantity').addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 10) {
            selectedQuantity = value;
        } else {
            e.target.value = selectedQuantity;
        }
    });

    // Size selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedSize = e.target.dataset.size;
        });
    });

    // Add to cart from modal
    document.getElementById('addToCartModal').addEventListener('click', addToCartFromModal);
}

// Render Products
function renderProducts(productsToRender = products) {
    productsGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <p class="product-category">${product.category}</p>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
            <button class="add-to-cart" onclick="quickAddToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
            </button>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-to-cart') && !e.target.classList.contains('fas')) {
            showProductDetail(product);
        }
    });

    return card;
}

// Show Product Detail
function showProductDetail(product) {
    selectedProduct = product;
    selectedQuantity = 1;
    selectedSize = 'M';

    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalCategory').textContent = product.category.toUpperCase();
    document.getElementById('modalPrice').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('quantity').value = selectedQuantity;

    // Reset size selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.size === selectedSize) {
            btn.classList.add('selected');
        }
    });

    productModal.classList.add('active');
    overlay.classList.add('active');
}

// Close Product Modal
function closeProductModal() {
    productModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Quick Add to Cart
function quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        addToCart(product, 'M', 1);
    }
}

// Add to Cart from Modal
function addToCartFromModal() {
    if (selectedProduct) {
        addToCart(selectedProduct, selectedSize, selectedQuantity);
        closeProductModal();
    }
}

// Add to Cart
function addToCart(product, size, quantity) {
    const existingItem = cart.find(item =>
        item.id === product.id && item.size === size
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            size: size,
            quantity: quantity
        });
    }

    updateCartUI();
    showNotification('Produk berhasil ditambahkan ke keranjang!');
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Update Cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Keranjang belanja kosong</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-details">Ukuran: ${item.size} | Qty: ${item.quantity}</p>
                    <p class="cart-item-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Toggle Cart
function toggleCart() {
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Close Modals
function closeModals() {
    cartSidebar.classList.remove('active');
    productModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Filter by Category
function filterByCategory(category) {
    selectedCategory = category;

    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.category === category) {
            link.classList.add('active');
        }
    });

    // Filter products
    const filteredProducts = category === 'all'
        ? products
        : products.filter(p => p.category === category);

    renderProducts(filteredProducts);
}

// Handle Search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

document.head.appendChild(style);

// DOM Elements for Checkout
const checkoutPage = document.getElementById('checkoutPage');
const backToCart = document.getElementById('backToCart');
const checkoutForm = document.getElementById('checkoutForm');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const orderItems = document.getElementById('orderItems');
const orderSubtotal = document.getElementById('orderSubtotal');
const orderTotal = document.getElementById('orderTotal');
const successModal = document.getElementById('successModal');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');

// Setup Checkout Event Listeners
function setupCheckoutEventListeners() {
    // Checkout button in cart
    document.querySelector('.checkout-btn').addEventListener('click', showCheckout);

    // Back to cart button
    backToCart.addEventListener('click', hideCheckout);

    // Place order button
    placeOrderBtn.addEventListener('click', processOrder);

    // Continue shopping button
    continueShoppingBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Show Checkout Page
function showCheckout() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja kosong!');
        return;
    }

    // Hide cart and overlay
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');

    // Show checkout page
    checkoutPage.classList.add('active');

    // Render order summary
    renderOrderSummary();
}

// Hide Checkout Page
function hideCheckout() {
    checkoutPage.classList.remove('active');
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
}

// Render Order Summary
function renderOrderSummary() {
    // Render order items
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-info">
                <h4 class="order-item-title">${item.name}</h4>
                <p class="order-item-details">Ukuran: ${item.size} | Qty: ${item.quantity}</p>
                <p class="order-item-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</p>
            </div>
        </div>
    `).join('');

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 15000; // Fixed shipping cost
    const total = subtotal + shippingCost;

    // Update totals
    orderSubtotal.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    orderTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Process Order
function processOrder() {
    // Validate form
    const form = checkoutForm;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value
    };

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 15000;
    const total = subtotal + shippingCost;

    // Create order object
    const order = {
        id: Date.now(), // Simple order ID
        date: new Date().toISOString(),
        customer: formData,
        items: [...cart],
        subtotal: subtotal,
        shipping: shippingCost,
        total: total,
        status: 'Menunggu Pembayaran'
    };

    // In a real application, you would send this data to a server
    console.log('Order placed:', order);

    // Show success message
    showNotification('Pesanan berhasil dibuat! Kami akan menghubungi Anda segera.');

    // Clear cart
    cart = [];
    updateCartUI();

    // Reset form
    form.reset();

    // Hide checkout page and show success modal
    checkoutPage.classList.remove('active');
    successModal.classList.add('active');
    overlay.classList.add('active');

    // You could redirect to a success page or show a success modal here
}

// Update the initialize function to include checkout event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
    setupEventListeners();
    setupCheckoutEventListeners(); // Add this line
});