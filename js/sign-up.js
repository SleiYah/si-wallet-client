document.addEventListener('DOMContentLoaded', function() {
    
    const signupBtn = document.getElementById('signup-page-btn');
    const signupForm = document.getElementById('signup-form');
    const login_page_btn = document.getElementById('login-page-btn');

    
    if (signupBtn) {
        signupBtn.addEventListener('click', function(event) {
            event.preventDefault(); 
            handleSignup();
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            handleSignup();
        });
    }
    if (login_page_btn) {
        login_page_btn.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'sign-in.html';
        });
    }
});



function handleSignup() {
    console.log('handleSignup function called');
    
    const firstName = document.getElementById('firstname').value.trim();
    const lastName = document.getElementById('lastname').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('First name field found:', !!document.getElementById('firstname'));
    console.log('Last name field found:', !!document.getElementById('lastname'));
    console.log('Email field found:', !!document.getElementById('email'));
    console.log('Username field found:', !!document.getElementById('username'));
    console.log('Password field found:', !!document.getElementById('password'));
    
    if (!firstName || !lastName || !email || !username || !password) {
        showMessage('All fields are required', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    
    const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: username,
        password: password,
        operation:"add"
    };
    
    
    
    axios.post(`${baseURL}/users/v1/add-update-user.php`, userData, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    
        .then(function(response) {
            console.log('Signup response received:', response.data);
            const data = response.data;
            
            if (data.success) {
                showMessage(data.message || 'Account created successfully!', 'success');
                
                setTimeout(function() {
                    window.location.href = 'sign-in.html';
                }, 1000);
            } else {
                showMessage(data.message || 'Failed to create account', 'error');
            }
        })
       
}