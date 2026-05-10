const level2 = "";
const level3 = "";
const level4 = "";
const level5 = "";
const level6 = "";

const plans = 
{
    2: { src: 'assets/level2.png', label: 'LEVEL 2 — FIRE EVACUATION PLAN' },
    3: { src: 'assets/level3.png', label: 'LEVEL 3 — FIRE EVACUATION PLAN' },
    4: { src: 'assets/level4.png', label: 'LEVEL 4 — FIRE EVACUATION PLAN' },
    5: { src: 'assets/level5.png', label: 'LEVEL 5 — FIRE EVACUATION PLAN' },
    6: { src: 'assets/level6.png', label: 'LEVEL 6 — FIRE EVACUATION PLAN' },
};

function openModal(level) 
{
    const p = plans[level];
    document.getElementById('modalTitle').textContent = p.label;
    document.getElementById('modalImg').src = p.src;
    document.getElementById('modalImg').alt = p.label;
    document.getElementById('modalDl').href = p.src;
    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() 
{
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

function handleOverlayClick(e) 
{
    if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function filterCards(level, btn) 
{
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.floor-card').forEach(card => 
    {
        card.style.display = (level === 'all' || card.dataset.level === level) ? 'flex' : 'none';
    });
}

document.addEventListener('keydown', e => 
{ 
    if (e.key === 'Escape') closeModal(); 
});