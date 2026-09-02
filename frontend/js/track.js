const API_BASE = 'http://127.0.0.1:5000/api';

// Toast Notifications helper
const toastContainer = document.getElementById('toast-container');
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

document.addEventListener('DOMContentLoaded', () => {
    renderOrderHistory();

    const trackSubmitBtn = document.getElementById('track-submit-btn');
    trackSubmitBtn.addEventListener('click', () => {
        const orderId = document.getElementById('track-order-input').value.trim();
        if (orderId) {
            fetchAndDisplayOrder(orderId);
        } else {
            showToast('Please enter a valid Order ID.');
        }
    });

    // Check if URL has order query parameter (e.g. track.html?id=3)
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    if (queryId) {
        document.getElementById('track-order-input').value = queryId;
        fetchAndDisplayOrder(queryId);
    }
});

function renderOrderHistory() {
    const listContainer = document.getElementById('order-history-list');
    const history = JSON.parse(localStorage.getItem('bakery_order_history') || '[]');
    
    if (history.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--color-muted); font-style: italic; font-size: 0.95rem;">No recent orders recorded on this device.</p>`;
        return;
    }

    listContainer.innerHTML = history.map(id => `
        <div style="background: #fffdf9; padding: 1rem 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
            <span style="font-weight: 600; color: var(--color-primary);">Order #${id}</span>
            <button class="btn" style="background: var(--color-primary); color: white; border: none; padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" onclick="fetchAndDisplayOrder(${id})">View Progress</button>
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
