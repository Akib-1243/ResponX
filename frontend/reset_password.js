const resetForm = document.getElementById('reset-form');
const resetMessage = document.getElementById('reset-message');
const newPasswordInput = document.getElementById('new-password');

// Simple password reset - no token required
resetMessage.innerText = 'Enter your email and new password to reset.';

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value;
    const newPassword = newPasswordInput.value;

    if (!email || !newPassword) {
        resetMessage.style.color = 'red';
        resetMessage.innerText = 'Please fill in all fields';
        return;
    }

    try {
        resetMessage.style.color = '#333';
        resetMessage.innerText = 'Updating password...';

        const res = await fetch('http://localhost:5000/api/auth/reset-password-direct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });

        const data = await res.json();
        if (res.ok) {
            resetMessage.style.color = 'green';
            resetMessage.innerText = 'Password updated. Redirecting...';
            if (data.token) localStorage.setItem('token', data.token);

            setTimeout(() => {
                window.location.href = 'login_register.html';
            }, 1000);
        } else {
            resetMessage.style.color = 'red';
            resetMessage.innerText = data.message || 'Failed to reset password';
        }
    } catch (err) {
        resetMessage.style.color = 'red';
        resetMessage.innerText = 'Failed to connect to the server';
    }
});

