document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('#header-nav li');
    const sections = document.querySelectorAll('.section-content');
    const terminalLabel = document.getElementById('terminal-label');
    const healthResponse = document.getElementById('health-response');
    const extensionsResponse = document.getElementById('extensions-response');
    const ejectResponse = document.getElementById('eject-response');
    const menuList = document.getElementById('menu-list');
    const bgVideo = document.getElementById('bg-video');
    const muteBtn = document.getElementById('mute-btn');
    
    let currentMenuIndex = 0;
    let menuItems = [];
    let isMuted = localStorage.getItem('musicMuted') === 'true';

    const videoId = 'MYW0TgV67RE';
    const iframeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1`;
    
    bgVideo.innerHTML = `<iframe width="100%" height="100%" src="${iframeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="opacity: 0; position: absolute;"></iframe>`;

    const updateMuteButton = () => {
        const iframe = bgVideo.querySelector('iframe');
        if (isMuted) {
            muteBtn.textContent = '.sound';
            muteBtn.classList.add('muted');
            if (iframe) {
                iframe.style.opacity = '0';
                iframe.style.pointerEvents = 'none';
            }
        } else {
            muteBtn.textContent = '.mute';
            muteBtn.classList.remove('muted');
            if (iframe) {
                iframe.style.opacity = '1';
                iframe.style.pointerEvents = 'auto';
            }
        }
        localStorage.setItem('musicMuted', isMuted);
    };

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        updateMuteButton();
    });

    const initializeMenu = () => {
        menuItems = document.querySelectorAll('.menu-item');
        if (menuItems.length > 0) {
            menuItems.forEach((item, idx) => {
                if (idx === 0) item.classList.add('selected');
                else item.classList.remove('selected');
            });
            currentMenuIndex = 0;
        }
    };

    const updateMenuSelection = () => {
        menuItems.forEach((item, idx) => {
            if (idx === currentMenuIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    };

    const showSection = (sectionId) => {
        sections.forEach(s => s.classList.remove('active'));
        navItems.forEach(n => n.classList.remove('active'));

        const section = document.getElementById(sectionId);
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);

        if (section) section.classList.add('active');
        if (navItem) navItem.classList.add('active');

        healthResponse.style.display = 'none';
        extensionsResponse.style.display = 'none';
        ejectResponse.style.display = 'none';

        if (sectionId === 'health') {
            healthResponse.style.display = 'block';
            terminalLabel.textContent = 'backend://scope9.ctl';
        } else if (sectionId === 'extensions') {
            extensionsResponse.style.display = 'block';
            terminalLabel.textContent = 'ext://loaded';
            initializeMenu();
        } else if (sectionId === 'eject') {
            ejectResponse.style.display = 'block';
            terminalLabel.textContent = 'sys://control';
        }
    };

    const handleKeyPress = (e) => {
        const extensionsSection = document.getElementById('extensions');
        const isExtensionsActive = extensionsSection.classList.contains('active');

        if (!isExtensionsActive) return;

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentMenuIndex = (currentMenuIndex - 1 + menuItems.length) % menuItems.length;
            updateMenuSelection();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentMenuIndex = (currentMenuIndex + 1) % menuItems.length;
            updateMenuSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selected = menuItems[currentMenuIndex];
            if (selected) {
                const extensionPath = selected.getAttribute('data-path');
                extensionsResponse.textContent = `> Running extension: ${extensionPath}`;
                extensionsResponse.style.display = 'block';
            }
        }
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            showSection(item.getAttribute('data-section'));
        });
    });

    document.addEventListener('keydown', handleKeyPress);

    updateMuteButton();
    showSection('health');
});
