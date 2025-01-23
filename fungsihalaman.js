import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDMcax3DSMbwCdf6ilMStGr7-wL3GVf8-Q",
    authDomain: "codingkan.firebaseapp.com",
    databaseURL: "https://codingkan-default-rtdb.firebaseio.com",
    projectId: "codingkan",
    storageBucket: "codingkan.firebasestorage.app",
    messagingSenderId: "753036437410",
    appId: "1:753036437410:android:babfafdcad76fd566234fb"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const cardsContainer = document.getElementById('cards');
const loadingDiv = document.getElementById('loading');
const refreshBtn = document.getElementById('refresh-btn');
const messagesRef = ref(db, 'messages');

// Fungsi untuk memuat data
const loadData = () => {
    loadingDiv.style.display = 'block';
    cardsContainer.style.display = 'none';
    cardsContainer.innerHTML = '';
    onValue(messagesRef, (snapshot) => {
        loadingDiv.style.display = 'none';
        cardsContainer.style.display = 'block';
        const data = snapshot.val();
        if (data) {
            Object.entries(data).forEach(([key, msg]) => {
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('card');
                cardDiv.innerHTML = `
                    <div class="card-header">Pesan dari: ${msg.deviceId || 'Anonim'}</div>
                    <div class="card-content">
                        <p><strong>Pesan:</strong> ${msg.message}</p>
                        <p><strong>Waktu:</strong> ${new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="card-actions">
                       <button class="action-btn btn-delete" data-id="${key}">
                            <span class="material-icons-round">delete</span> Hapus
                        </button>
                
                 <button class="action-btn btn-show" data-id="${key}" data-device="${msg.deviceId}" data-message="${msg.message}" data-timestamp="${msg.timestamp}">
                            <span class="material-icons-round">visibility</span> Lihat
                        </button>
                        
                    </div>
                `;
                cardsContainer.appendChild(cardDiv);
            });

            // Tambahkan event listener ke tombol tampilkan
            document.querySelectorAll('.btn-show').forEach((button) => {
                button.addEventListener('click', (e) => {
                    const deviceId = e.target.closest('.btn-show').dataset.device;
                    const message = e.target.closest('.btn-show').dataset.message;
                    const timestamp = e.target.closest('.btn-show').dataset.timestamp;

                    // Simpan data ke localStorage untuk halaman berikutnya
                    localStorage.setItem('deviceId', deviceId);
                    localStorage.setItem('message', message);
                    localStorage.setItem('timestamp', timestamp);

                    // Arahkan ke halaman kartu
                    window.location.href = 'card.html';
                });
            });

            // Tambahkan event listener ke tombol hapus
            document.querySelectorAll('.btn-delete').forEach((button) => {
                button.addEventListener('click', (e) => {
                    const id = e.target.closest('.btn-delete').dataset.id;
                    remove(ref(db, `messages/${id}`))
                        .then(() => {
                            Swal.fire('Berhasil', 'Pesan berhasil dihapus.', 'success');
                            loadData(); // Refresh data otomatis
                        })
                        .catch((error) => {
                            Swal.fire('Gagal', `Pesan gagal dihapus: ${error.message}`, 'error');
                        });
                });
            });
        } else {
            cardsContainer.innerHTML = '<p class="loading">Tidak ada pesan.</p>';
        }
    });
};

// Event listener untuk tombol refresh
refreshBtn.addEventListener('click', loadData);

// Muat data pertama kali
loadData();