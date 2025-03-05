
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - sign-in.js initialized');
    
    
    
    
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    
    console.log('Login form found:', !!loginForm);
    console.log('Login button found:', !!loginButton);
    
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            console.log('Form submit event triggered');
            event.preventDefault();
            handleLogin();
        });
    }
    
    
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            console.log('Login button clicked');
            event.preventDefault();
            handleLogin();
        });
    }
});

function handleLogin() {
    console.log('handleLogin function called');
    
    const usernameOrEmail = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Username/Email field found:', !!document.getElementById('username'));
    console.log('Password field found:', !!document.getElementById('password'));
    
    if (!usernameOrEmail || !password) {
        showMessage('Please enter both username/email and password', 'error');
        return;
    }
    
    const isEmail = usernameOrEmail.includes('@');
    
    const loginData = {
        password: password
    };
    
    if (isEmail) {
        loginData.email = usernameOrEmail;
    } else {
        loginData.username = usernameOrEmail;
    }
    
    console.log('Sending login request with data:', JSON.stringify(loginData));
    
    axios.post(baseURL +'/users/v1/user-login.php', loginData)
        .then(function(response) {
            console.log('Login response received:', response.data);
            
            if (response.data.success) {
                localStorage.setItem('authToken', response.data.token);
                
                showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(function() {
                    window.location.href = 'wallets.html';
                }, 1000);
            } else {
                console.log('Login failed:', response.data.message);
                showMessage(response.data.message || 'Login failed', 'error');
            }
        })
        
}

