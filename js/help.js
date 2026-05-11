function toggleFAQ(btn) 
{
    const group = btn.parentElement;
    const answer = group.querySelector('.faq-a');
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q.open').forEach(b => {
        b.classList.remove('open');
        b.parentElement.querySelector('.faq-a').classList.remove('open');
    });
    if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
    }
}

function filterFAQ() 
{
    const query = document.getElementById('helpSearch').value.toLowerCase().trim();
    const groups = document.querySelectorAll('.faq-group[data-tags]');
    let visibleCount = 0;

    groups.forEach(group => 
        {
        const tags = group.dataset.tags || '';
        const text = group.innerText.toLowerCase();
        const match = !query || tags.includes(query) || text.includes(query);
        group.style.display = match ? '' : 'none';
        if (match) visibleCount++;
    });

    document.getElementById('faqNoResults').style.display = visibleCount === 0 ? 'block' : 'none';
}