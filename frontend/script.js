const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Registration API Logic
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });
        const data = await res.json();
        
        if (res.ok) {
            registerMessage.style.color = 'green';
            registerMessage.innerText = `Registration successful! Role: ${data.role}. Redirecting...`;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            registerMessage.style.color = 'red';
            registerMessage.innerText = data.message || 'Error occurred';
        }
    } catch (err) {
        registerMessage.style.color = 'red';
        registerMessage.innerText = 'Failed to connect to the server';
    }
});

// Login API Logic
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

// Show social-login error messages (passed via ?error=...)
const params = new URLSearchParams(window.location.search);
const error = params.get('error');
if (error && loginMessage) {
    loginMessage.style.color = 'red';
    const msgMap = {
        google_not_configured: 'Google OAuth not configured. Add GOOGLE_CLIENT_ID/SECRET in backend/.env.',
        facebook_not_configured: 'Facebook OAuth not configured. Add FACEBOOK_CLIENT_ID/SECRET in backend/.env.',
        github_not_configured: 'GitHub OAuth not configured. Add GITHUB_CLIENT_ID/SECRET in backend/.env.',
        linkedin_not_configured: 'LinkedIn OAuth not configured. Add LINKEDIN_CLIENT_ID/SECRET in backend/.env.',
    };
    loginMessage.innerText = msgMap[error] || `Login failed: ${error}`;
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            loginMessage.style.color = 'green';
            loginMessage.innerText = `Login successful! Role: ${data.role}. Redirecting...`;
            
            // Store the JWT token and user data securely so future API calls can use it!
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            loginMessage.style.color = 'red';
            loginMessage.innerText = data.message || 'Invalid credentials';
        }
    } catch (err) {
        loginMessage.style.color = 'red';
        loginMessage.innerText = 'Failed to connect to the server';
    }
});