let cart = [];
const toastElement = document.getElementById('actionToast');
const toast = new bootstrap.Toast(toastElement, { delay: 2500 });

// Format Angka ke Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(number);
}

function showNotification(message) {
    document.getElementById('toastMessage').innerHTML = `<i class="bi bi-check-circle-fill text-success me-2"></i> ${message}`;
    toast.show();
}

// Filter Kategori Menu
function filterMenu(category, buttonElement) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if(buttonElement) {
        buttonElement.classList.add('active');
    }

    const items = document.querySelectorAll('.menu-item-col');
    items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'semua' || itemCategory === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Menambahkan Item ke Keranjang
function addToCart(name, price, img) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            img: img,
            qty: 1
        });
    }
    updateCartUI();
    showNotification(`${name} ditambahkan ke keranjang!`);
}

// Ubah Kuantitas
function changeQty(index, delta) {
    if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
}

// Hapus Item dari Keranjang
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Update Tampilan Keranjang
function updateCartUI() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartCheckoutBox = document.getElementById('cartCheckoutBox');
    const badgeCounters = document.querySelectorAll('.cart-count-badge');
            
    // Hitung total kuantitas
    const totalItemsCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
    badgeCounters.forEach(badge => badge.innerText = totalItemsCount);

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-cart-x fs-1 mb-2 d-block" style="color: var(--color-rose);"></i>
                <p>Keranjang belanja masih kosong.<br>Pilih kue lezat favoritmu sekarang!</p>
                <a href="#menu" class="btn btn-sm btn-custom-rose mt-2" data-bs-dismiss="offcanvas">Lihat Menu</a>
            </div>
            `;
        cartCheckoutBox.style.display = 'none';
        return;
    }

    // Render list item
    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        html += `
            <div class="cart-item-card d-flex align-items-center gap-3">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold small" style="color: var(--color-dark);">${item.name}</h6>
                    <div class="text-muted small">${formatRupiah(item.price)}</div>
                    <div class="d-flex align-items-center gap-2 mt-2">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span class="fw-bold small px-1">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        <span class="ms-auto fw-bold small" style="color: var(--color-rose);">${formatRupiah(itemTotal)}</span>
                    </div>
                </div>
                <button class="btn btn-link text-danger p-0 border-0 ms-1" onclick="removeFromCart(${index})" title="Hapus">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            `;
    });

    cartItemsList.innerHTML = html;
    document.getElementById('cartSubtotal').innerText = formatRupiah(subtotal);
    document.getElementById('cartTotal').innerText = formatRupiah(subtotal);
    cartCheckoutBox.style.display = 'block';
}

function checkoutWhatsApp() {
    if (cart.length === 0) return;

    const name = document.getElementById('custName').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const date = document.getElementById('custDate').value.trim();

    if (!name) {
        alertCustom('Silakan isi Nama Pemesan terlebih dahulu.');
        return;
    }

    let total = 0;
    let orderText = `*PESANAN BARU - DÉLICE BAKERY*\n`;
    orderText += `--------------------------------------\n`;
    orderText += `*Nama Pemesan:* ${name}\n`;
    if (address) orderText += `*Alamat/Catatan:* ${address}\n`;
    if (date) orderText += `*Waktu Kirim/Ambil:* ${date}\n`;
    orderText += `--------------------------------------\n`;
    orderText += `*Detail Menu:*\n`;

    cart.forEach((item, index) => {
    const sub = item.price * item.qty;
    total += sub;
    orderText += `${index + 1}. ${item.name} x${item.qty} = ${formatRupiah(sub)}\n`;
    });

    orderText += `--------------------------------------\n`;
    orderText += `*TOTAL PEMBAYARAN: ${formatRupiah(total)}*\n\n`;
    orderText += `Halo admin, mohon konfirmasi ketersediaan dan nomor rekening pembayarannya ya. Terima kasih!`;

    const waNumber = "6281234567890";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(orderText)}`;
            
    window.open(waUrl, '_blank');
}

function handleContactSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const topic = document.getElementById('contactTopic').value;
    const message = document.getElementById('contactMessage').value.trim();

    let text = `*PERTANYAAN PELANGGAN - DÉLICE BAKERY*\n\n`;
    text += `*Nama:* ${name}\n`;
    text += `*No. WA:* ${phone}\n`;
    text += `*Topik:* ${topic}\n\n`;
    text += `*Pesan:* \n"${message}"`;

    const waNumber = "6281234567890";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
}

function alertCustom(msg) {
    showNotification(msg);
}