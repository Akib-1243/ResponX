const resetForm = document.getElementById('reset-form');
const resetMessage = document.getElementById('reset-message');
const newPasswordInput = document.getElementById('new-password');

const token = new URLSearchParams(window.location.search).get('token');

if (!token) {
    resetMessage.style.color = 'red';
    resetMessage.innerText = 'Reset token is missing from the URL.';
} else {
    resetMessage.innerText = 'Enter a new password and click Update.';
}

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!token) return;

    const newPassword = newPasswordInput.value;

    try {
        resetMessage.style.color = '#333';
        resetMessage.innerText = 'Updating password...';

        const res = await fetch('http://localhost:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
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

