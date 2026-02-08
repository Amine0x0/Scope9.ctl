document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('#header-nav li');
    const sections = document.querySelectorAll('.section-content');
    const terminalLabel = document.getElementById('terminal-label');
    const healthResponse = document.getElementById('health-response');
    const extensionsResponse = document.getElementById('extensions-response');
    const ejectResponse = document.getElementById('eject-response');
    const statsDisplay = document.getElementById('stats-display');
    const healthDisplay = document.getElementById('health-display');
    const menuList = document.getElementById('menu-list');
    const bgVideo = document.getElementById('bg-video');
    const muteBtn = document.getElementById('mute-btn');

    let currentMenuIndex = 0;
    let menuItems = [];
    let isMuted = localStorage.getItem('musicMuted') === 'true';
    let statsRefreshInterval = null;

    const videoId = 'MYW0TgV67RE';
    bgVideo.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="opacity:0;position:absolute;"></iframe>`;

    const BACKEND_URL = (window.location.port && window.location.port !== '80' && window.location.port !== '443')
        ? 'http://localhost:5000' : '';

    const fmt = {
        bytes: (b) => {
            if (!b) return '0 B';
            const i = Math.floor(Math.log(b) / Math.log(1024));
            return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i];
        },
        time: (ms) => (ms / 1000).toFixed(2) + 's'
    };

    const renderStats = (d) => `
        <div class="stats-grid">
            <div class="stat-section">
                <p class="stat-title">Process</p>
                <p class="stat-line"><span class="stat-label">Name</span><span class="stat-value">${d.process?.name || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">PID</span><span class="stat-value">${d.process?.id || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">Threads</span><span class="stat-value">${d.process?.threads || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">Handles</span><span class="stat-value">${d.process?.handleCount || '—'}</span></p>
            </div>
            <div class="stat-section">
                <p class="stat-title">Memory</p>
                <p class="stat-line"><span class="stat-label">Working Set</span><span class="stat-value">${fmt.bytes(d.memory?.workingSet)}</span></p>
                <p class="stat-line"><span class="stat-label">Private</span><span class="stat-value">${fmt.bytes(d.memory?.privateBytes)}</span></p>
                <p class="stat-line"><span class="stat-label">Virtual</span><span class="stat-value">${fmt.bytes(d.memory?.virtualBytes)}</span></p>
                <p class="stat-line"><span class="stat-label">Peak</span><span class="stat-value">${fmt.bytes(d.memory?.peakWorkingSet)}</span></p>
            </div>
            <div class="stat-section">
                <p class="stat-title">CPU</p>
                <p class="stat-line"><span class="stat-label">Total</span><span class="stat-value">${fmt.time(d.cpu?.totalMs || 0)}</span></p>
                <p class="stat-line"><span class="stat-label">User</span><span class="stat-value">${fmt.time(d.cpu?.userMs || 0)}</span></p>
                <p class="stat-line"><span class="stat-label">Kernel</span><span class="stat-value">${fmt.time(d.cpu?.kernelMs || 0)}</span></p>
                <p class="stat-line"><span class="stat-label">Priority</span><span class="stat-value">${d.cpu?.priority || '—'}</span></p>
            </div>
            <div class="stat-section">
                <p class="stat-title">Runtime</p>
                <p class="stat-line"><span class="stat-label">Framework</span><span class="stat-value">${d.runtime?.framework || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">OS</span><span class="stat-value">${d.runtime?.os || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">Arch</span><span class="stat-value">${d.runtime?.architecture || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">CPUs</span><span class="stat-value">${d.runtime?.processorCount || '—'}</span></p>
            </div>
            <div class="stat-section">
                <p class="stat-title">Assembly</p>
                <p class="stat-line"><span class="stat-label">Name</span><span class="stat-value">${d.assembly?.name || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">Version</span><span class="stat-value">${d.assembly?.version || '—'}</span></p>
            </div>
            <div class="stat-section">
                <p class="stat-title">Environment</p>
                <p class="stat-line"><span class="stat-label">Machine</span><span class="stat-value">${d.environment?.machineName || '—'}</span></p>
                <p class="stat-line"><span class="stat-label">User</span><span class="stat-value">${d.environment?.userName || '—'}</span></p>
            </div>
        </div>`;

    const fetchBackendStats = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/stat`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            statsDisplay.innerHTML = renderStats(data);
            healthDisplay.innerHTML = `<p class="section-text info">Connected: <span class="accent">${data.assembly?.name}</span> v<span class="accent">${data.assembly?.version}</span></p>`;
        } catch {
            statsDisplay.innerHTML = '<p class="stat-error">Backend not responding</p>';
            healthDisplay.innerHTML = '<p class="section-text info">Backend connection failed</p>';
        }
    };

    const updateMuteButton = () => {
        const iframe = bgVideo.querySelector('iframe');
        isMuted ? muteBtn.classList.add('muted') : muteBtn.classList.remove('muted');
        muteBtn.textContent = isMuted ? '.sound' : '.mute';
        if (iframe) {
            iframe.style.opacity = isMuted ? '0' : '1';
            iframe.style.pointerEvents = isMuted ? 'none' : 'auto';
        }
        localStorage.setItem('musicMuted', isMuted);
    };

    muteBtn.addEventListener('click', () => { isMuted = !isMuted; updateMuteButton(); });

    const loadExtensions = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/extensions`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            renderExtensionsMenu(data.extensions);
        } catch {
            extensionsResponse.innerHTML = '<p class="stat-error">Failed to load extensions</p>';
        }
    };

    const renderExtensionsMenu = (extensions) => {
        menuList.innerHTML = '';

        const renderNode = (ext, depth = 0) => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.setAttribute('data-path', ext.path);
            item.setAttribute('data-type', 'dir');

            const hasChildren = ext.children && ext.children.length > 0;
            const prefix = depth > 0 ? '  '.repeat(depth) + '├─ ' : '';
            const icon = hasChildren ? '▸' : '◆';

            item.innerHTML = `<span class="menu-prefix">${prefix}</span><span class="menu-icon">${icon}</span><span class="menu-text">${ext.name}</span>${ext.hasEntry ? '<span class="entry-badge">entry</span>' : ''}`;
            menuList.appendChild(item);

            if (ext.files && ext.files.length > 0) {
                ext.files.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'menu-item menu-file';
                    fileItem.setAttribute('data-path', `${ext.path}/${file}`);
                    fileItem.setAttribute('data-type', 'file');
                    const fPrefix = '  '.repeat(depth + 1) + (hasChildren ? '│  ' : '   ');
                    const fIcon = file.endsWith('.lua') ? '◇' : '·';
                    fileItem.innerHTML = `<span class="menu-prefix">${fPrefix}</span><span class="menu-icon">${fIcon}</span><span class="menu-text">${file}</span>`;
                    menuList.appendChild(fileItem);
                });
            }

            if (hasChildren) {
                ext.children.forEach(child => renderNode(child, depth + 1));
            }
        };

        extensions.forEach(ext => renderNode(ext));
        initializeMenu();
    };

    const initializeMenu = () => {
        menuItems = document.querySelectorAll('.menu-item');
        currentMenuIndex = 0;
        if (menuItems.length > 0) menuItems[0].classList.add('selected');
    };

    const updateMenuSelection = () => {
        menuItems.forEach((item, i) => {
            item.classList.toggle('selected', i === currentMenuIndex);
            if (i === currentMenuIndex) item.scrollIntoView({ block: 'nearest' });
        });
    };

    const loadEjectScripts = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/eject/available`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            const scriptList = document.getElementById('script-list');
            scriptList.innerHTML = '';
            data.scripts.forEach(name => {
                const btn = document.createElement('button');
                btn.className = 'script-btn';
                btn.textContent = name;
                btn.addEventListener('click', () => executeScript(name));
                scriptList.appendChild(btn);
            });
        } catch {
            ejectResponse.innerHTML = '<p class="stat-error">Failed to load scripts</p>';
        }
    };

    const executeScript = async (name) => {
        ejectResponse.innerHTML = `<p class="terminal-text">> Executing ${name}...</p>`;
        try {
            const res = await fetch(`${BACKEND_URL}/api/eject/${name}`, { method: 'POST' });
            const data = await res.json();
            ejectResponse.innerHTML = `<p class="terminal-text">> ${name} [exit: ${data.exitCode}]</p>${data.output ? `<pre class="terminal-output">${data.output}</pre>` : ''}${data.errors ? `<pre class="terminal-output error">${data.errors}</pre>` : ''}`;
        } catch {
            ejectResponse.innerHTML = `<p class="stat-error">Failed to execute ${name}</p>`;
        }
    };

    const showSection = (sectionId) => {
        sections.forEach(s => s.classList.remove('active'));
        navItems.forEach(n => n.classList.remove('active'));

        document.getElementById(sectionId)?.classList.add('active');
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        healthResponse.style.display = 'none';
        extensionsResponse.style.display = 'none';
        ejectResponse.style.display = 'none';

        if (statsRefreshInterval) clearInterval(statsRefreshInterval);

        if (sectionId === 'health') {
            healthResponse.style.display = 'block';
            terminalLabel.textContent = 'backend://scope9.ctl';
            fetchBackendStats();
            statsRefreshInterval = setInterval(fetchBackendStats, 3000);
        } else if (sectionId === 'extensions') {
            extensionsResponse.style.display = 'block';
            terminalLabel.textContent = 'ext://loaded';
            loadExtensions();
        } else if (sectionId === 'eject') {
            ejectResponse.style.display = 'block';
            terminalLabel.textContent = 'sys://control';
            loadEjectScripts();
        }
    };

    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('extensions')?.classList.contains('active')) return;
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
            const sel = menuItems[currentMenuIndex];
            if (sel) extensionsResponse.textContent = `> Selected: ${sel.getAttribute('data-path')}`;
        }
    });

    navItems.forEach(item =>
        item.addEventListener('click', () => showSection(item.getAttribute('data-section')))
    );

    updateMuteButton();
    showSection('health');
});
