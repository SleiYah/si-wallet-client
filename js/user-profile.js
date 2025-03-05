let isVerifying = false;

function showProfileSection(sectionId) {
  document.querySelectorAll(".profile-section").forEach((section) => {
    section.classList.add("disp-none");
  });

  document.getElementById(sectionId + "-section").classList.remove("disp-none");
}

function loadUserProfile() {
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    showMessage('Authentication token not found. Please login again.', 'error');
    window.location.href = 'sign-in.html';
    return;
  }
  
  axios.post(
    baseURL+'/users/v1/get-users-byId.php',
    {},
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  )
  .then(function(response) {
    if (response.data.success) {
      const userData = response.data.data;
      document.getElementById('username').value = userData.username || '';
      document.getElementById('first_name').value = userData.first_name || '';
      document.getElementById('last_name').value = userData.last_name || '';
      document.getElementById('email').value = userData.email || '';
      
      updateEmailVerificationStatus(userData);
    } else {
      showMessage(response.data.message || 'Failed to load user data', 'error');
    }
  })
  .catch(function(error) {
    console.error('Error loading user data:', error);
    
    if (error.response && error.response.status === 401) {
      showMessage('Your session has expired. Please login again.', 'error');
      localStorage.removeItem('authToken');
      setTimeout(function() {
        window.location.href = 'sign-in.html';
      }, 1500);
    } else {
      showMessage('An error occurred while loading your profile.', 'error');
    }
  });
}

function updateEmailVerificationStatus(userData) {
  const statusElement = document.getElementById('email-verification-status');
  
  if (userData.tier > 1) {
    statusElement.textContent = `Your email (${userData.email}) is verified.`;
    statusElement.style.color = '#57ff65';
    
    const verifyButton = document.getElementById('verify-email-btn');
    verifyButton.disabled = true;
    verifyButton.style.opacity = '0.5';
    verifyButton.textContent = 'Already Verified';
  } else {
    statusElement.textContent = `Your email (${userData.email}) is not verified. Please verify your email to unlock basic features.`;
    statusElement.style.color = '#ff6347';
  }
}

function sendVerificationEmail() {
  if (isVerifying) return;
  
  isVerifying = true;
  const verifyButton = document.getElementById('verify-email-btn');
  verifyButton.disabled = true;
  verifyButton.textContent = 'Sending...';
  
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    showMessage('Authentication token not found. Please login again.', 'error');
    verifyButton.disabled = false;
    verifyButton.textContent = 'Verify Email';
    isVerifying = false;
    return;
  }
  
  axios.post(
    baseURL+'/verification/v1/send-verification-email.php', 
    {}, 
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  )
  .then(function(response) {
    console.log("response", response)
    if (response.data.success) {
      showMessage('Verification email sent! Please check your inbox.', 'success');
      document.getElementById('email-verification-status').textContent = 
        'Verification email sent. Please check your inbox and click the verification link.';
      document.getElementById('email-verification-status').style.color = '#add8e6';
    } else {
      showMessage(response.data.message || 'Failed to send verification email', 'error');
    }
  })
  .catch(function(error) {
    console.error('Error sending verification email:', error);
    
    if (error.response && error.response.status === 401) {
      showMessage('Your session has expired. Please login again.', 'error');
      localStorage.removeItem('authToken');
      setTimeout(function() {
        window.location.href = 'sign-in.html';
      }, 1500);
    } else {
      showMessage('An error occurred while sending the verification email.', 'error');
    }
  })
  .finally(function() {
    verifyButton.disabled = false;
    verifyButton.textContent = 'Verify Email';
    isVerifying = false;
  });
}

// USER INFORMATION UPDATE
function updateUserProfile(event) {
  event.preventDefault();
  
  const updateButton = event.target.querySelector('.submit-btn');
  updateButton.disabled = true;
  
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    showMessage('Authentication token not found. Please login again.', 'error');
    updateButton.disabled = false;
    updateButton.textContent = 'Save Changes';
    return;
  }
  
  const userData = {
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    operation: "update"
  };
  
  if (!userData.first_name || !userData.last_name || !userData.username || !userData.email) {
    showMessage('All fields are required', 'error');
    updateButton.disabled = false;
    updateButton.textContent = 'Save Changes';
    return;
  }
  console.log("userData",userData)
  axios.post(
    baseURL+'/users/v1/add-update-user.php',
    userData,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  )
  .then(function(response) {
    if (response.data.success) {
      showMessage('Profile updated successfully!', 'success');
    } else {
      showMessage(response.data.message || 'Failed to update profile', 'error');
    }
  })
  .catch(function(error) {
    console.error('Error updating profile:', error);
    
    if (error.response && error.response.status === 401) {
      showMessage('Your session has expired. Please login again.', 'error');
      localStorage.removeItem('authToken');
      setTimeout(function() {
        window.location.href = 'sign-in.html';
      }, 1500);
    } else {
      showMessage('An error occurred while updating your profile.', 'error');
    }
  })

}
// UPDATE PASSWORD FUNCTION
function updatePassword(event) {
  event.preventDefault();
  
  const updateButton = event.target.querySelector('.submit-btn');

  
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    showMessage('Authentication token not found. Please login again.', 'error');
    updateButton.disabled = false;
    updateButton.textContent = 'Change Password';
    return;
  }
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showMessage('All password fields are required', 'error');
    updateButton.disabled = false;
    updateButton.textContent = 'Change Password';
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showMessage('New passwords do not match', 'error');
    updateButton.disabled = false;
    updateButton.textContent = 'Change Password';
    return;
  }
  
  axios.post(
    baseURL+'/users/v1/update-password.php',
    {
      current_password: currentPassword,
      new_password: newPassword
    },
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  )
  .then(function(response) {
    if (response.data.success) {
      showMessage('Password updated successfully!', 'success');
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
    } else {
      showMessage(response.data.message || 'Failed to update password', 'error');
    }
  })
  .catch(function(error) {
    console.error('Error updating password:', error);
    
    if (error.response && error.response.status === 401) {
      showMessage('Your session has expired. Please login again.', 'error');
      localStorage.removeItem('authToken');
      setTimeout(function() {
        window.location.href = 'sign-in.html';
      }, 1500);
    } else {
      showMessage('An error occurred while updating your password.', 'error');
    }
  })
 
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('User profile page loaded');
  
  checkAuthStatus("sign-in.html");
  
  loadUserProfile();
  
  const personalForm = document.querySelector('#personal-section form');
  if (personalForm) {
    personalForm.addEventListener('submit', updateUserProfile);
  }
  
  const securityForm = document.querySelector('#security-section form');
  if (securityForm) {
    securityForm.addEventListener('submit', updatePassword);
  }
  
  const verifyEmailBtn = document.getElementById('verify-email-btn');
  if (verifyEmailBtn) {
    verifyEmailBtn.addEventListener('click', sendVerificationEmail);
  }
  
  const logoutBtn = document.querySelector('.login-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});