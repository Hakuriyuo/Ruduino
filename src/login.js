let mode = 'login';

function toggleMode() 
{
    mode = (mode === 'login') ? 'register' : 'login';
    const isReg = mode === 'register';

    document.getElementById('modeInput').value = mode;
    document.getElementById('formTitle').firstChild.nodeValue = isReg ? 'REGISTER' : 'SIGN IN';
    document.getElementById('modeIndicator').textContent = isReg ? 'New account' : 'Existing account';
    document.getElementById('submitBtn').textContent = isReg ? '→ Create Account' : '→ Sign In';
    document.getElementById('toggleHint').textContent = isReg ? 'Have an account?' : 'No account?';
    document.getElementById('toggleBtn').textContent = isReg ? 'Sign in here' : 'Register here';

    document.getElementById('register-fields').style.display = isReg ? 'block' : 'none';
    document.getElementById('confirm-field').style.display = isReg ? 'block' : 'none';

    document.getElementById('formAlert').className = 'form-alert';
    document.getElementById('formAlert').textContent = '';
}

document.getElementById('authForm').addEventListener('submit', function (e) 
{
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const alert = document.getElementById('formAlert');

    clearErrors();

    if (!username || !password) {
        showError('Please fill in all required fields.');
        e.preventDefault(); return;
    }

    if (mode === 'register') {
        const email = document.getElementById('email').value.trim();
        const confirm = document.getElementById('confirm_password').value;
        if (!email) { showError('Email address is required.'); e.preventDefault(); return; }
        if (password !== confirm) { showError('Passwords do not match.'); e.preventDefault(); return; }
        if (password.length < 8) { showError('Password must be at least 8 characters.'); e.preventDefault(); return; }
    }
});

function showError(msg) 
{
    const el = document.getElementById('formAlert');
    el.textContent = msg;
    el.className = 'form-alert error';
}

function clearErrors() 
{
    const el = document.getElementById('formAlert');
    el.className = 'form-alert';
}

const params = new URLSearchParams(window.location.search);
if (params.get('error')) {
    const el = document.getElementById('formAlert');
    el.textContent = decodeURIComponent(params.get('error'));
    el.className = 'form-alert error';
}
if (params.get('success')) {
    const el = document.getElementById('formAlert');
    el.textContent = decodeURIComponent(params.get('success'));
    el.className = 'form-alert success';
}
if (params.get('mode') === 'register') toggleMode();