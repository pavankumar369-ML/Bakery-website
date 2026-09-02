const API_BASE = 'http://127.0.0.1:5000/api';

// State Management
let products = [];
let cart = JSON.parse(localStorage.getItem('bakery_cart')) || [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartModal = document.getElementById('cart-modal');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const trackOrderBtn = document.getElementById('track-order-btn');
const checkoutModalOverlay = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');

// Initialize Toast Container
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'normal') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-bell'}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();

    cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
    closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('active');
    });

    // Checkout modal listeners
    closeCheckoutBtn.addEventListener('click', () => checkoutModalOverlay.classList.remove('active'));
    checkoutModalOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutModalOverlay) checkoutModalOverlay.classList.remove('active');
    });

    checkoutForm.addEventListener('submit', submitOrder);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            fetchProducts(e.target.dataset.category);
        });
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Your basket is empty!');
            return;
        }
        cartModal.classList.remove('active');
        checkoutModalOverlay.classList.add('active');
    });

    // Track Order Modal Listeners
    const trackModal = document.getElementById('track-modal');
    const closeTrackBtn = document.getElementById('close-track-modal');
    const trackSubmitBtn = document.getElementById('track-submit-btn');

    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', () => {
            trackModal.style.display = 'flex';
            renderOrderHistory();
        });
    }

    if (closeTrackBtn) {
        closeTrackBtn.addEventListener('click', () => {
            trackModal.style.display = 'none';
        });
    }

    if (trackModal) {
        trackModal.addEventListener('click', (e) => {
            if (e.target === trackModal) trackModal.style.display = 'none';
        });
    }

    if (trackSubmitBtn) {
        trackSubmitBtn.addEventListener('click', () => {
            const orderId = document.getElementById('track-order-input').value;
            if (orderId) {
                fetchAndDisplayOrder(orderId);
            } else {
                showToast('Please enter a valid Order ID.');
            }
        });
    }
});


// 1. Fetch Products from Flask API
async function fetchProducts(category = 'all') {
    productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">Baking fresh options for you...</p>`;
    try {
        const response = await fetch(`${API_BASE}/products?category=${category}`);
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Failed to fetch products:', error);
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-accent);">Unable to connect to bakery server. Make sure Flask is running!</p>`;
    }
}

// Render Products Grid
function renderProducts() {
    productGrid.innerHTML = '';
    if (products.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">No delicious items found in this category.</p>`;
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${product.image_url}" alt="${product.name}" class="product-img">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn" onclick="addToCart(${product.id})"><i class="fa-solid fa-plus"></i> Add</button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// 2. Cart Logic
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${product.name} to your basket!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('bakery_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;

    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--color-muted); margin-top: 3rem;">Your basket is empty.</p>`;
        cartTotalPrice.textContent = '$0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <h4 style="color: var(--color-primary); font-size: 1rem;">${item.name}</h4>
                <small style="color: var(--color-muted);">$${item.price.toFixed(2)} x ${item.quantity}</small>
            </div>
            <div style="display: flex; gap: 0.6rem; align-items: center;">
                <button class="btn btn-outline" style="padding: 0.2rem 0.6rem; border-radius: 4px;" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="btn btn-outline" style="padding: 0.2rem 0.6rem; border-radius: 4px;" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn" style="background: var(--color-accent); padding: 0.3rem 0.6rem; border-radius: 4px;" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}

// 3. Checkout Submission & Order History Storage
async function submitOrder(e) {
    e.preventDefault();
    
    const address = document.getElementById('checkout-address').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const paymentMethod = document.getElementById('payment-method').value;

    if (!address || !phone) {
        showToast('Please fill in all delivery details.');
        return;
    }

    const orderPayload = {
        user_id: 1,
        delivery_address: `${address} (Phone: ${phone})`,
        delivery_time: 'Today in 45 mins',
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
    };

    try {
        const response = await fetch(`${API_BASE}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();
        if (response.ok) {
            showToast(`Payment successful! Order #${data.order_id} placed.`, 'success');
            
            // Save order ID to local history
            saveOrderToHistory(data.order_id);

            cart = [];
            saveCart();
            updateCartUI();
            checkoutModalOverlay.classList.remove('active');
            checkoutForm.reset();
            
            // Open tracking modal and display new order
            document.getElementById('track-modal').style.display = 'flex';
            fetchAndDisplayOrder(data.order_id);
            renderOrderHistory();
        } else {
            showToast(`Checkout failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('An error occurred during payment processing.');
    }
}

// 4. Order History & Tracking Functions
function saveOrderToHistory(orderId) {
    let history = JSON.parse(localStorage.getItem('bakery_order_history') || '[]');
    if (!history.includes(orderId)) {
        history.unshift(orderId);
        localStorage.setItem('bakery_order_history', JSON.stringify(history));
    }
}

function renderOrderHistory() {
    const listContainer = document.getElementById('order-history-list');
    const history = JSON.parse(localStorage.getItem('bakery_order_history') || '[]');
    
    if (!listContainer) return;

    if (history.length === 0) {
        listContainer.innerHTML = `<p class="empty-history" style="color: #8c7a6b; font-style: italic;">No recent orders found on this device.</p>`;
        return;
    }

    listContainer.innerHTML = history.map(id => `
        <div class="history-item">
            <span>Order #${id}</span>
            <button onclick="fetchAndDisplayOrder(${id})">View Progress</button>
        </div>
    `).join('');
}

async function fetchAndDisplayOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`);
        if (!response.ok) {
            showToast('Order not found!');
            return;
        }
        const order = await response.json();

        document.getElementById('res-order-id').innerText = order.order_id;
        document.getElementById('res-order-status').innerText = order.status;
        document.getElementById('track-result-container').style.display = 'block';

        // Update progress bar steps
        const steps = ['Order Received', 'Baking / Preparing', 'Out for Delivery', 'Delivered'];
        const currentStatusIndex = steps.indexOf(order.status);

        document.querySelectorAll('.progress-step').forEach((stepEl, idx) => {
            stepEl.classList.remove('active', 'completed');
            if (idx < currentStatusIndex) {
                stepEl.classList.add('completed');
            } else if (idx === currentStatusIndex) {
                stepEl.classList.add('active');
            }
        });
    } catch (err) {
        console.error('Error fetching order:', err);
        showToast('Failed to retrieve order status.');
    }
}
