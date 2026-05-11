function submitContact() 
{
    const name = document.getElementById('c-name').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const subject = document.getElementById('c-subject').value;
    const message = document.getElementById('c-message').value.trim();
    const alert = document.getElementById('contactAlert');

    alert.className = 'form-alert';
    alert.textContent = '';

    if (!name || !email || !subject || !message) 
        {
        alert.textContent = 'Please fill in all fields.';
        alert.className = 'form-alert error';
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert.textContent = 'Please enter a valid email address.';
        alert.className = 'form-alert error';
        return;
    }

    const btn = document.getElementById('contactSubmit');
    btn.textContent = '... Sending';
    btn.disabled = true;

    fetch('https://formspree.io/f/mlgzaljg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                alert.textContent = "Message sent. We'll get back to you within 1–2 business days.";
                alert.className = 'form-alert success';
                document.getElementById('c-name').value = '';
                document.getElementById('c-email').value = '';
                document.getElementById('c-subject').value = '';
                document.getElementById('c-message').value = '';
            } else {
                alert.textContent = data.error || 'Failed to send. Please try again.';
                alert.className = 'form-alert error';
            }
        })
        .catch(() => {
            alert.textContent = 'Network error. Please check your connection and try again.';
            alert.className = 'form-alert error';
        })
        .finally(() => {
            btn.textContent = '→ Send Message';
            btn.disabled = false;
        });
}