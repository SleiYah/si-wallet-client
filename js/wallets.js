function openAddWalletModal() {
    document.getElementById("addWalletModal").style.display = "flex";
}

function closeAddWalletModal() {
    document.getElementById("addWalletModal").style.display = "none";
}
function openDeleteModal(walletId) {
    walletToDelete = walletId;
    document.getElementById("deleteWalletModal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("deleteWalletModal").style.display = "none";
    walletToDelete = null;
}

window.onclick = function(event) {
    const addModal  = document.getElementById("addWalletModal");
    const deleteModal = document.getElementById("deleteWalletModal");

    if (event.target === addModal) {
        closeAddWalletModal();
    } else if (event.target === deleteModal) {
        closeDeleteModal();
    }
};

function toggleCardDetails(element) {
    const isCardNumber = element.classList.contains('card-number');
    const isCVV = element.classList.contains('cvv-value');

    if (isCardNumber) {
        const fullNumber = element.dataset.number;
        const isHidden = element.innerHTML.includes('****');

        if (isHidden) {
            element.innerHTML = fullNumber;
        } else {
            const lastFour = fullNumber.slice(-4);
            element.innerHTML = `**** **** **** ${lastFour}`;
            element.style.color = "";
        }
    } else if (isCVV) {
        const cvv = element.dataset.cvv;
        const isHidden = element.innerHTML === '***';

        if (isHidden) {
            element.innerHTML = cvv;
        } else {
            element.innerHTML = '***';
            element.style.color = "";
        }
    }
}





function loadWallets() {
    const authToken = localStorage.getItem('authToken');
    console.log(authToken)
    
    if (!authToken) {
        showMessage('Authentication token not found. Please login again.', 'error');
        window.location.href = 'sign-in.html';
        return;
    }
    
    axios.post(
        baseURL+'/wallets/v1/get-wallet-byId.php',
        {},
        {
            headers: {
                'Authorization':`Bearer ${authToken}`
            }
        }
    )
    .then(function(response) {
        console.log(response.data.data)
        if (response.data.success) {
            displayWallets(response.data.data);
            updateTotalBalance(response.data.data);
        } else {
            showMessage(response.data.message || 'Failed to load wallets', 'error');
        }
    })
    .catch(function(error) {
        console.error('Error loading wallets:', error);
        
        if (error.response && error.response.status === 401) {
            showMessage('Your session has expired. Please login again.', 'error');
            localStorage.removeItem('authToken');
            setTimeout(function() {
                window.location.href = 'sign-in.html';
            }, 1500);
        } else {
            showMessage('An error occurred while loading your wallets.', 'error');
        }
    });
}

function displayWallets(wallets) {
    const container = document.querySelector('.wallets-container');
    console.log(wallets);  
    
    if (!wallets || wallets.length === 0) {
        container.innerHTML = '<div class="no-wallets">You don\'t have any wallets yet. Add one to get started!</div>';
        return;
    }
    
    container.innerHTML = '';
    
    wallets.forEach(function(wallet) {
        const cardNumber = wallet.card_number;
        const last4 = cardNumber.slice(-4);
        const maskedNumber = `**** **** **** ${last4}`;
        
        const walletCard = document.createElement('div');
        walletCard.innerHTML = `
            <p class="card-number" onclick="toggleCardDetails(this)" data-number="${cardNumber}">${maskedNumber}</p>
              <button class="delete-wallet-btn" onclick="openDeleteModal(${wallet.wallet_id})">
                    <i class="fa fa-trash"></i>
                </button>
            <p class="card-balance">Balance: $${parseFloat(wallet.balance).toFixed(2)}</p>
            <div class="card-details">
                <div class="card-holder">
                    <span class="card-label">Card Holder</span>
                    <span class="value">${wallet.first_name || ''} ${wallet.last_name || ''}</span>
                </div>
                <div class="card-expires">
                    <span class="card-label">Expires</span>
                    <span class="value">${wallet.expiry_date}</span>
                </div>
                <div class="cvv">
                    <span class="card-label">CVV</span>
                    <span class="cvv-value" onclick="toggleCardDetails(this)" data-cvv="${wallet.cvv}">***</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="wallet-id">ID: ${wallet.wallet_id}</div>
                <div class="card-type">${wallet.card_type || 'CARD'}</div>
                <button class="transfer-btn" onclick="openTransferWebPage(${wallet.wallet_id})">Transfer Money</button>
            </div>
        `;
        
        container.appendChild(walletCard);
    });
}

function updateTotalBalance(wallets) {
    const totalBalanceElement = document.querySelector('.total-balance');
    
    if (!wallets || wallets.length === 0) {
        totalBalanceElement.textContent = '$0.00';
        return;
    }
    
    const total = wallets.reduce(function(sum, wallet) {
        return sum + parseFloat(wallet.balance);
    }, 0);
    
    totalBalanceElement.textContent = `$${total.toFixed(2)}`;
}

function addNewWallet() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        showMessage('Authentication token not found. Please login again.', 'error');
        localStorage.removeItem('authToken');

        return;
    }
    
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardType = document.getElementById('card-type').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    console.log("cardType",cardType)
    if (!cardNumber || !cardType || !expiryDate || !cvv) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (cardNumber.length < 15 || cardNumber.length > 16) {
        showMessage('Please enter a valid card number', 'error');
        return;
    }
    
    if (cvv.length < 3) {
        showMessage('Please enter a valid CVV', 'error');
        return;
    }
    
    const walletData = {
        card_number: cardNumber,
        card_type: cardType,
        expiry_date: expiryDate,
        cvv: cvv
    };
    
    axios.post(baseURL+'/wallets/v1/add-update-wallet.php', walletData, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(function(response) {
        if (response.data.success) {
            showMessage('Wallet created successfully!', 'success');
            closeAddWalletModal();
            
            document.getElementById('card-number').value = '';
            document.getElementById('expiry-date').value = '';
            document.getElementById('cvv').value = '';
            
            loadWallets();
        } else {
            showMessage(response.data.message || 'Failed to create wallet', 'error');
        }
    })
  
}


document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus("sign-in.html");
    loadWallets();
    
 
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 16) {
                value = value.substr(0, 16);
            }
            
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            this.value = formattedValue;
        });
    }
    
    const expiryInput = document.getElementById('expiry-date');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 4) {
                value = value.substr(0, 4);
            }
            
            if (value.length > 2) {
                this.value = value.substr(0, 2) + '/' + value.substr(2);
            } else {
                this.value = value;
            }
        });
    }
});

function deleteWallet() {
    if (!walletToDelete) {
        showMessage('Error: No wallet selected for deletion', 'error');
        return;
    }
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        showMessage('Authentication token not found. Please login again.', 'error');
        return;
    }
    
    axios.post(
        baseURL+'/wallets/v1/delete-wallet.php',
        { wallet_id: walletToDelete },
        {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
    .then(function(response) {
        if (response.data.success) {
            showMessage(response.data.message, 'success');
            closeDeleteModal();
            loadWallets();
        } else {
            showMessage(response.data.message || 'Failed to delete wallet', 'error');
        }
    })
   
}


function openTransferWebPage(walletId) {
    localStorage.setItem('selectedWalletId', walletId);
    window.location.href = 'transfer-page.html';
}
