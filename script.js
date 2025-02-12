// Cart state
let cartData = null;
let itemToRemove = null;

// Format currency in Indian Rupees
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount / 100);
}

// Fetch cart data from API
async function fetchCartData() {
    try {
        const response = await fetch('https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889');
        cartData = await response.json();
        
        // Save to localStorage
        localStorage.setItem('cartData', JSON.stringify(cartData));
        
        renderCart();
    } catch (error) {
        console.error('Error fetching cart data:', error);
        // Try to load from localStorage if fetch fails
        const savedCart = localStorage.getItem('cartData');
        if (savedCart) {
            cartData = JSON.parse(savedCart);
            renderCart();
        }
    }
}

// Render cart items
function renderCart() {
    const cartContainer = document.getElementById('cartContainer');
    const loader = document.getElementById('loader');
    const cartItemsList = document.getElementById('cartItemsList');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');

    if (!cartData) return;

    // Hide loader and show cart
    loader.style.display = 'none';
    cartContainer.style.display = 'grid';

    // Render cart items
    cartItemsList.innerHTML = cartData.items.map(item => `
        <div class="cart-item">
            <div class="product-info">
                <img src="${item.image}" alt="${item.title}" class="product-image">
                <div>
                    <h3>${item.title}</h3>
                    
                </div>
            </div>
            <div>${formatCurrency(item.price)}</div>
            <div>
                <input type="number" 
                       value="${item.quantity}" 
                       min="1" 
                       class="quantity-input"
                       onchange="updateQuantity(${item.id}, this.value)">
            </div>
            <div>
                ${formatCurrency(item.final_line_price)}
                <button class="remove-btn" onclick="showRemoveConfirmation(${item.id})">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // Update totals
    subtotalElement.textContent = formatCurrency(cartData.original_total_price);
    totalElement.textContent = formatCurrency(cartData.original_total_price);
}

// Update item quantity
function updateQuantity(itemId, newQuantity) {
    if (!cartData) return;

    const item = cartData.items.find(item => item.id === itemId);
    if (!item) return;

    const quantity = parseInt(newQuantity);
    if (quantity < 1) return;

    
    item.quantity = quantity;
    item.final_line_price = item.price * quantity;

    // Recalculate total
    cartData.original_total_price = cartData.items.reduce((sum, item) => sum + item.final_line_price, 0);

    // Save to localStorage
    localStorage.setItem('cartData', JSON.stringify(cartData));

    renderCart();
}

// Show remove confirmation modal
function showRemoveConfirmation(itemId) {
    itemToRemove = itemId;
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
    itemToRemove = null;
}

// Confirm remove item
function confirmRemoveItem() {
    if (itemToRemove === null || !cartData) return;

    cartData.items = cartData.items.filter(item => item.id !== itemToRemove);
    cartData.original_total_price = cartData.items.reduce((sum, item) => sum + item.final_line_price, 0);

    // Save to localStorage
    localStorage.setItem('cartData', JSON.stringify(cartData));

    renderCart();
    closeModal();
}

// Handle checkout
function handleCheckout() {
    alert('Proceeding to checkout...');
    // Add checkout logic here
}

// Initialize cart
document.addEventListener('DOMContentLoaded', fetchCartData);

// Handle modal close on outside click
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
}