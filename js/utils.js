
const baseURL = "siwalletbackend.zapto.org/SI-Wallet/Wallet-Server"

document.addEventListener('DOMContentLoaded', function() {
  
  const burger = document.querySelector('.burger-menu');
  const nav = document.querySelector('nav ul');
  
  if (burger && nav) {
      console.log('Burger menu found, adding click listener');
      burger.addEventListener('click', function() {
          nav.classList.toggle('active');
      });
  }
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
      console.log('Logout button found, adding click listener');
      logoutBtn.addEventListener('click', logout);
  }

  showUserElements()
});

function showMessage(message, type = 'info') {
  console.log(`Showing message: "${message}" with type: ${type}`);
  const messageContainer = document.getElementById('message-container');
  const messageText = document.getElementById('message-text');
  
  if (messageContainer && messageText) {
      messageContainer.classList.remove('message-info', 'message-success', 'message-error');
      messageContainer.classList.add(`message-${type}`);
      messageText.textContent = message;
      messageContainer.style.display = 'block';
      
      setTimeout(function() {
          messageContainer.style.display = 'none';
      }, 3000);
  } else {
      console.warn('Message container or text element not found in the DOM');
  }
}

function logout() {
  localStorage.removeItem('authToken');
  window.location.href = 'sign-in.html';
}


function checkAuthStatus(page_name) {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
      window.location.href = page_name;
  }
}

function showUserElements() {
  const authToken = localStorage.getItem('authToken');

  const loggedInElements = document.querySelectorAll(".signed-in"); 
  const authButtons = document.querySelectorAll(".auth-buttons"); 

  if (authToken) {
    loggedInElements.forEach(el => el.style.display = "normal");
    authButtons.forEach(el => el.style.display = "none");
  } else {
    loggedInElements.forEach(el => el.style.display = "none");
    authButtons.forEach(el => el.style.display = "normal");
  }
}
