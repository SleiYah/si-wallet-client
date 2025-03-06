document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus("sign-in.html");
  
  loadSelectedWallet();
  
  const logoutBtn = document.querySelector('.login-btn');
  if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
          localStorage.removeItem('authToken');
          window.location.href = 'sign-in.html';
      });
  }
});



function loadSelectedWallet() {
  const authToken = localStorage.getItem('authToken');
  let selectedWalletId = localStorage.getItem('selectedWalletId');
  
  if (!authToken) {
      showMessage('Authentication required. Redirecting to login...', 'error');
      setTimeout(() => {
          window.location.href = 'sign-in.html';
      }, 1500);
      return;
  }
  
  if (!selectedWalletId) {
      
      
      axios.post(
          `${baseURL}/wallets/v1/get-wallet-byId.php`,
          {}, 
          {
              headers: {
                  'Authorization': `Bearer ${authToken}`
              }
          }
      )
      .then(function(response) {
          if (response.data.success && response.data.data && response.data.data.length > 0) {
              displaySelectedWallet(response.data.data);
              
              localStorage.setItem('selectedWalletId', response.data.data[0].wallet_id);
          } else {
              showMessage('No wallets found. Redirecting to wallets page...', 'error');
              setTimeout(() => {
                  window.location.href = 'wallets.html';
              }, 1500);
          }
      })
      .catch(function(error) {
          console.error('Error loading wallets:', error);
          
          if (error.response && error.response.status === 401) {
              showMessage('Your session has expired. Please login again.', 'error');
              localStorage.removeItem('authToken');
              setTimeout(() => {
                  window.location.href = 'sign-in.html';
              }, 1500);
          } else {
              showMessage('An error occurred while loading your wallets. Redirecting...', 'error');
              setTimeout(() => {
                  window.location.href = 'wallets.html';
              }, 1500);
          }
      });
      return;
  }
  
  
  axios.post(
      `${baseURL}wallets/v1/get-wallet-byId.php`,
      { wallet_id: selectedWalletId },
      {
          headers: {
              'Authorization': `Bearer ${authToken}`
          }
      }
  )
  .then(function(response) {
      if (response.data.success) {
          displaySelectedWallet(response.data.data);
      } else {
          console.error('API returned error:', response.data);
          showMessage(response.data.message || 'Failed to load wallet', 'error');
          loadAllWallets(authToken);
      }
  })
  .catch(function(error) {
      console.error('Error loading wallet:', error);
      
      if (error.response && error.response.status === 401) {
          showMessage('Your session has expired. Please login again.', 'error');
          localStorage.removeItem('authToken');
          setTimeout(() => {
              window.location.href = 'sign-in.html';
          }, 1500);
      } else {
          console.error('Error details:', error.response || error.message);
          showMessage('An error occurred while loading your wallet.', 'error');
          loadAllWallets(authToken);
      }
  });
}

function displaySelectedWallet(walletData) {
  if (!walletData || walletData.length === 0) {
      showMessage('Wallet data not found', 'error');
      return;
  }
  
  const wallet = walletData[0]; 
  const cardNumber = wallet.card_number;
  const last4 = cardNumber.slice(-4);
  const maskedNumber = `**** **** **** ${last4}`;
  
  const walletContainer = document.querySelector('.wallets-container div');
  
  walletContainer.innerHTML = `
      <p class="card-number" onclick="toggleCardDetails(this)" data-number="${cardNumber}">${maskedNumber}</p>
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
      </div>
  `;
  
  document.body.dataset.currentWalletId = wallet.wallet_id;
}

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

function loadAllWallets(authToken) {
  axios.post(
      `${baseURL}/wallets/v1/get-wallet-byId.php`,
      {}, 
      {
          headers: {
              'Authorization': `Bearer ${authToken}`
          }
      }
  )
  .then(function(response) {
      if (response.data.success && response.data.data && response.data.data.length > 0) {
          displaySelectedWallet(response.data.data);
          
          localStorage.setItem('selectedWalletId', response.data.data[0].wallet_id);
      } else {
          showMessage('No wallets found. Redirecting to wallets page...', 'error');
          setTimeout(() => {
              window.location.href = 'wallets.html';
          }, 1500);
      }
  })

}

async function getUserWalletId(username) {
  try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
          showMessage('Authentication token not found', 'error');
          return null;
      }
      
      const response = await axios.post(
          `${baseURL}/wallets/v1/get-wallet-byUsername.php`,
          { username: username },
          {
              headers: {
                  'Authorization': `Bearer ${authToken}`
              }
          }
      );
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
          return response.data.data[0].wallet_id;
      } else {
          showMessage(response.data.message || 'User wallet not found', 'error');
          return null;
      }
  } catch (error) {
      console.error('Error fetching user wallet:', error);
      showMessage('Error fetching recipient wallet information', 'error');
      return null;
  }
}

function showTransferForm(formType) {
  document.querySelectorAll(".transfer-form").forEach((form) => {
      form.classList.add("disp-none");
  });

  document
      .getElementById(formType + "-form")
      .classList.remove("disp-none");
  event.target.classList.remove("disp-none");
}

function showP2POption(option) {
  document.querySelectorAll(".p2p-form").forEach((form) => {
      form.classList.add("disp-none");
  });

  document.getElementById("p2p-" + option).classList.remove("disp-none");
  event.target.classList.remove("disp-none");
}

function toggleSchedule(checkbox) {
  const form = checkbox.closest("form");
  const scheduleContainer = form.querySelector(".schedule-container");

  if (checkbox.checked) {
      scheduleContainer.style.display = "flex";
  } else {
      scheduleContainer.style.display = "none";
  }
}

function submitTransfer(type) {
    const authToken = localStorage.getItem('authToken');
    const walletId = document.body.dataset.currentWalletId;
    
    if (!authToken) {
        showMessage('Authentication token not found. Please login again.', 'error');
        return;
    }
    
    if (!walletId) {
        showMessage('No wallet selected', 'error');
        return;
    }

    let transferData = {
        wallet_id: walletId,
        transaction_type: type
    };
    
    if (type === 'withdraw') {
        transferData.amount = document.getElementById('withdraw-amount').value;
        transferData.note = document.getElementById('withdraw-note').value || '';
    } else if (type === 'deposit') {
        transferData.amount = document.getElementById('deposit-amount').value;
        transferData.note = document.getElementById('deposit-note').value || '';
    } else if (type === 'p2p') {
        const usernameForm = document.getElementById('p2p-username');
        const qrForm = document.getElementById('p2p-qr');
        
        if (!usernameForm.classList.contains('disp-none')) {
            const amount = usernameForm.querySelector('#p2p-amount').value;
            const note = usernameForm.querySelector('#p2p-note').value || '';
            const recipientUsername = usernameForm.querySelector('#p2p-recipient').value;
            const recipientId = usernameForm.querySelector('#recepient-id').value;
            
            if (!recipientUsername) {
                showMessage('Please enter a recipient username', 'error');
                return;
            }
            
            const scheduleTransfer = usernameForm.querySelector('#schedule-transfer:checked');
            
            transferData.amount = amount;
            transferData.note = note;
            transferData.recipient_username = recipientUsername;
            transferData.to_wallet_id = recipientId;
            
            if (scheduleTransfer) {
                const scheduleDate = usernameForm.querySelector('#schedule-date').value;
                if (!scheduleDate) {
                    showMessage('Please select a date for scheduled transfer', 'error');
                    return;
                }
                transferData.schedule_date = scheduleDate;
            }
        }
    }
    
    if (!transferData.amount || isNaN(parseFloat(transferData.amount)) || parseFloat(transferData.amount) <= 0) {
        showMessage('Please enter a valid amount', 'error');
        return;
    }
    
    axios.post(
        `${baseURL}/transactions/v1/add-transaction.php`,
        transferData,
        {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        }
    )
    .then(function(response) {
        
        if (response.data.success) {
            showMessage(response.data.message || 'Transaction completed successfully', 'success');
            
            if (response.data.new_balance !== undefined) {
                document.querySelector('.card-balance').textContent = `Balance: $${parseFloat(response.data.new_balance).toFixed(2)}`;
            }
            
            clearFormFields(type);
        } else {
            showMessage(response.data.message || 'Transaction failed', 'error');
        }
    })
    .catch(function(error) {
        console.error('Error processing transaction:', error);
        if (error.response && error.response.data && error.response.data.message) {
            showMessage(error.response.data.message, 'error');
        } else {
            showMessage('An error occurred while processing your transaction.', 'error');
        }
    });
}

function clearFormFields(type) {
  if (type === 'withdraw') {
      document.getElementById('withdraw-amount').value = '';
      document.getElementById('withdraw-note').value = '';
  } else if (type === 'deposit') {
      document.getElementById('deposit-amount').value = '';
      document.getElementById('deposit-note').value = '';
  } else if (type === 'p2p') {
      const forms = document.querySelectorAll('.p2p-form');
      forms.forEach(form => {
          form.querySelectorAll('input[type="text"]').forEach(input => {
              input.value = '';
          });
          
          const scheduleCheckbox = form.querySelector('#schedule-transfer');
          if (scheduleCheckbox) {
              scheduleCheckbox.checked = false;
          }
          
          const scheduleContainer = form.querySelector('.schedule-container');
          if (scheduleContainer) {
              scheduleContainer.style.display = 'none';
          }
      });
  }
}