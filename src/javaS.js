const level2 = "https://raw.githubusercontent.com/Hakuriyuo/Ruduino/main/assets/level2.png";
const level3 = "https://raw.githubusercontent.com/Hakuriyuo/Ruduino/main/assets/level3.png";
const level4 = "https://raw.githubusercontent.com/Hakuriyuo/Ruduino/main/assets/level4.png";
const level5 = "https://raw.githubusercontent.com/Hakuriyuo/Ruduino/main/assets/level5.png";
const level6 = "https://raw.githubusercontent.com/Hakuriyuo/Ruduino/main/assets/level6.png";

const plans = 
{
    2: { src: level2, label: 'LEVEL 2 — FIRE EVACUATION PLAN' },
    3: { src: level3, label: 'LEVEL 3 — FIRE EVACUATION PLAN' },
    4: { src: level4, label: 'LEVEL 4 — FIRE EVACUATION PLAN' },
    5: { src: level5, label: 'LEVEL 5 — FIRE EVACUATION PLAN' },
    6: { src: level6, label: 'LEVEL 6 — FIRE EVACUATION PLAN' },
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