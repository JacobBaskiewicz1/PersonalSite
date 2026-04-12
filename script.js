var audioUnlocked = false;

var blipSources = [
    'Assets/Sound/Blip/blipSelect.wav',
    'Assets/Sound/Blip/blipSelect(1).wav',
    'Assets/Sound/Blip/blipSelect(2).wav',
    'Assets/Sound/Blip/blipSelect(3).wav',
    'Assets/Sound/Blip/blipSelect(4).wav',
    'Assets/Sound/Blip/blipSelect(5).wav',
    'Assets/Sound/Blip/blipSelect(6).wav'
];

var bloopSource = "Assets/Sound/Other/bloop.wav";

var hasBeenActivated = false;

var settings = {
    scanlines: true,
    chromatic: true,
    sound: true
};

function loadSettings() {
    var saved = localStorage.getItem('crtSettings');
    if (saved) {
        try {
            var parsed = JSON.parse(saved);
            settings.scanlines = parsed.scanlines !== undefined ? parsed.scanlines : true;
            settings.chromatic = parsed.chromatic !== undefined ? parsed.chromatic : true;
            settings.sound = parsed.sound !== undefined ? parsed.sound : true;
        } catch (e) {
            console.log('Could not load settings');
        }
    }
}

function saveSettings() {
    localStorage.setItem('crtSettings', JSON.stringify(settings));
}

function applySettings() {
    var scanlines = document.getElementById('crt-scanlines');
    if (scanlines) {
        if (settings.scanlines) {
            scanlines.classList.remove('disabled');
        } else {
            scanlines.classList.add('disabled');
        }
    }

    if (settings.chromatic) {
        document.body.classList.add('chromatic-on');
    } else {
        document.body.classList.remove('chromatic-on');
    }

    var scanlineCheck = document.getElementById('toggle-scanlines');
    var chromaticCheck = document.getElementById('toggle-chromatic');
    var soundCheck = document.getElementById('toggle-sound');

    if (scanlineCheck) scanlineCheck.checked = settings.scanlines;
    if (chromaticCheck) chromaticCheck.checked = settings.chromatic;
    if (soundCheck) soundCheck.checked = settings.sound;
}

function unlockAudio() {
    if (audioUnlocked) return;
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var buf = ctx.createBuffer(1, 1, 22050);
        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        audioUnlocked = true;
    } catch (e) {}
}

function playSound(src, volume) {
    if (!settings.sound) return;
    try {
        var audio = new Audio(src);
        audio.volume = volume || 0.2;
        audio.play().catch(function() {});
    } catch (e) {}
}

function playBlip() {
    if (!settings.sound) return;
    var i = Math.floor(Math.random() * blipSources.length);
    playSound(blipSources[i], 0.2);
}

function playMenuBlip() {
    if (!settings.sound) return;
    playSound(blipSources[0], 0.25);
}

function playBloop() {
    if (!settings.sound) return;
    playSound(bloopSource, 0.4);
}

// crt effects
function createCRTEffects() {
    if (!document.getElementById('crt-scanlines')) {
        var scanlines = document.createElement('div');
        scanlines.id = 'crt-scanlines';
        document.body.appendChild(scanlines);
    }

    if (!document.querySelector('.settings-container')) {
        var container = document.createElement('div');
        container.className = 'settings-container';
        container.innerHTML =
            '<button class="settings-btn" id="settings-btn" aria-label="Settings">' +
                '<span class="gear-icon">⚙</span>' +
            '</button>' +
            '<div class="settings-panel" id="settings-panel">' +
                '<h4>▸ CRT SETTINGS</h4>' +
                '<label class="toggle-item">' +
                    '<input type="checkbox" id="toggle-scanlines">' +
                    '<span class="toggle-box"></span>' +
                    '<span class="toggle-label">Scanlines</span>' +
                '</label>' +
                '<label class="toggle-item">' +
                    '<input type="checkbox" id="toggle-chromatic">' +
                    '<span class="toggle-box"></span>' +
                    '<span class="toggle-label">RGB Shift</span>' +
                '</label>' +
                '<label class="toggle-item">' +
                    '<input type="checkbox" id="toggle-sound">' +
                    '<span class="toggle-box"></span>' +
                    '<span class="toggle-label">Sound FX</span>' +
                '</label>' +
            '</div>';
        document.body.appendChild(container);

        var settingsBtn = document.getElementById('settings-btn');
        var settingsPanel = document.getElementById('settings-panel');

        settingsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            unlockAudio();
            settingsBtn.classList.toggle('open');
            settingsPanel.classList.toggle('open');
            playMenuBlip();
        });

        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                settingsBtn.classList.remove('open');
                settingsPanel.classList.remove('open');
            }
        });

        document.getElementById('toggle-scanlines').addEventListener('change', function() {
            settings.scanlines = this.checked;
            applySettings();
            saveSettings();
            playMenuBlip();
        });

        document.getElementById('toggle-chromatic').addEventListener('change', function() {
            settings.chromatic = this.checked;
            applySettings();
            saveSettings();
            playMenuBlip();
        });

        document.getElementById('toggle-sound').addEventListener('change', function() {
            settings.sound = this.checked;
            saveSettings();
            if (this.checked) playMenuBlip();
        });
    }

    applySettings();
}

// scanline
function playScanlineWipe() {
    document.body.classList.add('loading-wipe');
    var wipe = document.createElement('div');
    wipe.className = 'scanline-wipe';
    document.body.appendChild(wipe);
    setTimeout(function() {
        document.body.classList.remove('loading-wipe');
        wipe.classList.add('complete');
        setTimeout(function() {
            if (wipe.parentNode) wipe.parentNode.removeChild(wipe);
        }, 100);
    }, 600);
}

// navbar
function setupArcadeNavbar() {
    var navLinks = document.querySelectorAll('.navbar > a:not([target="_blank"])');
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === currentPage) link.classList.add('active');

        link.addEventListener('mouseenter', function() {
            unlockAudio();
            playMenuBlip();
        });

        link.addEventListener('touchstart', function() {
            unlockAudio();
        }, { passive: true });
    });

    document.querySelectorAll('.project-tab').forEach(function(tab) {
        tab.addEventListener('mouseenter', function() {
            unlockAudio();
            playMenuBlip();
        });
    });
}

// chess game
var chessGame = null;
var chessBoard = null;
var chessBlobbertThinking = false;

function initChessGame() {
    var boardEl = document.getElementById('chessBoard');
    if (!boardEl) return;

    if (typeof Chess === 'undefined' || typeof Chessboard === 'undefined') {
        console.log('Chess libraries not loaded.');
        console.log('Chess:', typeof Chess);
        console.log('Chessboard:', typeof Chessboard);
        return;
    }

    chessGame = new Chess();

    var config = {
        draggable: true,
        position: 'start',
        onDragStart: onChessDragStart,
        onDrop: onChessDrop,
        onSnapEnd: onChessSnapEnd,
        pieceTheme: 'Assets/chesspieces/{piece}.png'
    };

    chessBoard = Chessboard('chessBoard', config);

    // Force a resize after a short delay to fix any layout issues
    setTimeout(function() {
        if (chessBoard) chessBoard.resize();
    }, 50);

    window.addEventListener('resize', function() {
        if (chessBoard) chessBoard.resize();
    });

    var newGameBtn = document.getElementById('chessNewGame');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            unlockAudio();
            playMenuBlip();
            resetChessGame();
        });
    }

    var undoBtn = document.getElementById('chessUndoMove');
    if (undoBtn) {
        undoBtn.addEventListener('click', function() {
            unlockAudio();
            playMenuBlip();
            undoChessMove();
        });
    }

    updateChessStatus();
}

function showChessGame() {
    var preGame = document.getElementById('chessPreGame');
    var activeGame = document.getElementById('chessActiveGame');

    if (preGame) preGame.style.display = 'none';
    if (activeGame) {
        activeGame.style.display = 'flex';

        requestAnimationFrame(function() {
            setTimeout(function() {
                initChessGame();
            }, 150);
        });
    }
}

function onChessDragStart(source, piece, position, orientation) {
    // Don't pick up pieces if game is over
    if (chessGame.game_over()) return false;
    // Don't pick up during Blobbert's turn
    if (chessBlobbertThinking) return false;
    // Only pick up white pieces (player is white)
    if (piece.search(/^b/) !== -1) return false;
    // Only allow moves on white's turn
    if (chessGame.turn() !== 'w') return false;
}

function onChessDrop(source, target) {
    // Try the move
    var move = chessGame.move({
        from: source,
        to: target,
        promotion: 'q'  // always promote to queen for simplicity
    });

    // If illegal, snap back
    if (move === null) return 'snapback';

    playMenuBlip();
    updateChessStatus();

    // blobbert move
    if (!chessGame.game_over()) {
        chessBlobbertThinking = true;
        updateChessStatus();
        var thinkTime = 400 + Math.floor(Math.random() * 800);
        setTimeout(makeBlobbertMove, thinkTime);
    }
}

function onChessSnapEnd() {
    chessBoard.position(chessGame.fen());
}

function makeBlobbertMove() {
    var moves = chessGame.moves();
    if (moves.length === 0) {
        chessBlobbertThinking = false;
        updateChessStatus();
        return;
    }

    var randomIndex = Math.floor(Math.random() * moves.length);
    chessGame.move(moves[randomIndex]);
    chessBoard.position(chessGame.fen());

    playBlip();
    chessBlobbertThinking = false;
    updateChessStatus();
}

function updateChessStatus() {
    var statusEl = document.getElementById('chessStatus');
    if (!statusEl) return;

    var status = '';

    if (chessGame.in_checkmate()) {
        if (chessGame.turn() === 'b') {
            status = '♔ Checkmate! You win!';
            statusEl.className = 'chess-status checkmate';
        } else {
            status = '♚ Checkmate! Blobbert wins!? How?!';
            statusEl.className = 'chess-status checkmate';
        }
    } else if (chessGame.in_stalemate()) {
        status = 'Stalemate — it\'s a draw!';
        statusEl.className = 'chess-status draw';
    } else if (chessGame.in_draw()) {
        status = 'Draw!';
        statusEl.className = 'chess-status draw';
    } else if (chessGame.in_threefold_repetition()) {
        status = 'Draw by repetition!';
        statusEl.className = 'chess-status draw';
    } else if (chessBlobbertThinking) {
        status = 'Blobbert is thinking...';
        statusEl.className = 'chess-status';
    } else if (chessGame.turn() === 'w') {
        status = 'Your move!';
        if (chessGame.in_check()) {
            status = 'Check! ' + status;
        }
        statusEl.className = 'chess-status';
    } else {
        status = 'Blobbert\'s turn...';
        statusEl.className = 'chess-status';
    }

    statusEl.textContent = status;
}

function resetChessGame() {
    chessGame.reset();
    chessBoard.start();
    chessBlobbertThinking = false;
    updateChessStatus();
}

function undoChessMove() {
    if (chessGame.game_over()) return;
    if (chessBlobbertThinking) return;

    if (chessGame.turn() === 'w') {
        chessGame.undo(); 
        chessGame.undo(); 
    } else {
        chessGame.undo();
    }

    chessBoard.position(chessGame.fen());
    updateChessStatus();
}

function createStatBar(percent) {
    var totalSegments = 10;
    var filledSegments = Math.round(percent / 10);
    var container = document.createElement('div');
    container.className = 'stat-bar-container';

    for (var i = 0; i < totalSegments; i++) {
        var segment = document.createElement('div');
        segment.className = 'stat-segment';
        segment.setAttribute('data-index', i);
        segment.setAttribute('data-filled', i < filledSegments ? 'true' : 'false');
        if (i < filledSegments) {
            segment.classList.add('level-' + (i + 1));
        }
        container.appendChild(segment);
    }

    var label = document.createElement('span');
    label.className = 'stat-label';
    label.textContent = percent + '%';
    container.appendChild(label);

    return container;
}

function createSkillRow(skillName, percent) {
    var row = document.createElement('div');
    row.className = 'skill-row';
    row.setAttribute('data-percent', percent);

    var name = document.createElement('span');
    name.className = 'skill-name';
    name.textContent = skillName;
    row.appendChild(name);

    row.appendChild(createStatBar(percent));
    return row;
}

function initSkillBars() {
    var skillsContainer = document.querySelector('.about-skills-dense');
    if (!skillsContainer) return;

    var headers = skillsContainer.querySelectorAll('h2');

    headers.forEach(function(header) {
        var headerText = header.textContent.toLowerCase();

        if (headerText.includes('education') ||
            headerText.includes('certification') ||
            headerText.includes('award') ||
            headerText.includes('work history')) {
            return;
        }

        var nextElement = header.nextElementSibling;

        while (nextElement && nextElement.tagName !== 'TABLE' && nextElement.tagName !== 'H2' && nextElement.tagName !== 'H1') {
            nextElement = nextElement.nextElementSibling;
        }

        if (nextElement && nextElement.tagName === 'TABLE') {
            var table = nextElement;
            var rows = table.querySelectorAll('tr');
            var skillsGrid = document.createElement('div');
            skillsGrid.className = 'skills-grid';

            rows.forEach(function(row, rowIndex) {
                if (rowIndex === 0) return;
                var cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    var skillName = cells[0].textContent.trim();
                    var proficiency = cells[1].textContent.trim().toLowerCase();
                    var percent = 50;
                    if (proficiency.includes('advanced')) percent = 90;
                    else if (proficiency.includes('intermediate')) percent = 60;
                    else if (proficiency.includes('beginner')) percent = 30;
                    skillsGrid.appendChild(createSkillRow(skillName, percent));
                }
            });

            if (skillsGrid.children.length > 0) {
                table.parentNode.replaceChild(skillsGrid, table);
            }
        }
    });

    observeSkillBars();
}

function observeSkillBars() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var segments = entry.target.querySelectorAll('.stat-segment[data-filled="true"]');
                segments.forEach(function(segment, index) {
                    setTimeout(function() {
                        segment.classList.add('filled', 'animated');
                    }, index * 60);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-row').forEach(function(row) {
        observer.observe(row);
    });
}

var workHistory = [
    {
        role: 'AI Data Trainer',
        company: 'Data Annotations',
        dates: 'March 2026 - Present',
        description: 'Provide feedback and factuality checks for frontier AI models. Create system prompts, analyze code generation, develop success criteria and stress test models to further develop new models.'
    },
    {
        role: 'Team Lead',
        company: 'Cascading Story Games - Voices of the Zibe',
        dates: 'August 2025 - December 2025',
        description: 'Led a team of 4 to develop an educational story game for the Chicago Maritime Museum using Twine and Figma.'
    },
    {
        role: 'Level Design Lead',
        company: 'Andromeda Entertainment - Solar Black',
        dates: 'March 2022 - June 2023',
        description: 'Led level design for the virtual reality rhythm game Solar Black. Produced consistent weekly deliverables and integrated iterative feedback from playtests to refine level quality and engagement.'
    },
    {
        role: 'Mapping Commissions',
        company: 'Beat Saber Community',
        dates: 'January 2022 - Present',
        description: 'Completed 35+ professionally made commissioned Beat Saber maps with 100% positive customer reviews.'
    },
    {
        role: 'Ranking & QA Team Member',
        company: 'ScoreSaber',
        dates: 'January 2021 - March 2026',
        description: 'Completed 500+ map checks ensuring quality and rankability standards for the competitive Beat Saber community.'
    }
];

function createTimeline() {
    var skillsPage = document.querySelector('.about-skills-dense');
    if (!skillsPage) return;
    if (document.querySelector('.timeline-section')) return;

    var section = document.createElement('div');
    section.className = 'timeline-section';

    var title = document.createElement('h2');
    title.textContent = '◢ WORK HISTORY ◣';
    section.appendChild(title);

    var timeline = document.createElement('div');
    timeline.className = 'timeline';

    workHistory.forEach(function(job) {
        var entry = document.createElement('div');
        entry.className = 'timeline-entry';
        entry.innerHTML =
            '<h3 class="timeline-role">' + job.role + '</h3>' +
            '<p class="timeline-company">' + job.company + '</p>' +
            '<p class="timeline-dates">' + job.dates + '</p>' +
            '<p class="timeline-description">' + job.description + '</p>';
        timeline.appendChild(entry);
    });

    section.appendChild(timeline);

    var certHeader = null;
    var allH1s = skillsPage.querySelectorAll('h1');
    for (var i = 0; i < allH1s.length; i++) {
        if (allH1s[i].textContent.toLowerCase().includes('certification')) {
            certHeader = allH1s[i];
            break;
        }
    }

    if (certHeader) {
        skillsPage.insertBefore(section, certHeader);
    } else {
        skillsPage.appendChild(section);
    }
}

(function(){
    var unlockEvents = ['click', 'touchstart', 'keydown', 'mousemove'];
    function handleFirstInteraction() {
        unlockAudio();
        unlockEvents.forEach(function(eventType) {
            document.removeEventListener(eventType, handleFirstInteraction);
        });
    }
    unlockEvents.forEach(function(eventType) {
        document.addEventListener(eventType, handleFirstInteraction, { passive: true });
    });

    document.addEventListener('DOMContentLoaded', function(){
        loadSettings();
        createCRTEffects();
        playScanlineWipe();
        setupArcadeNavbar();
        initSkillBars();
        createTimeline();
        initGallery();

        document.querySelectorAll('.about, .project-section, .topbar .text').forEach(function(el) {
            el.classList.add('chromatic-target');
        });

        // chess
        var yesBtn = document.getElementById('blobbertChess');
        var speechImg = document.getElementById('speechImg');
        var speechTxt = document.getElementById('speechText');

        if (yesBtn && speechImg && speechTxt) {
            yesBtn.addEventListener('click', function(){
                unlockAudio();
                if (hasBeenActivated) return;
                playBloop();
                hasBeenActivated = true;

                speechImg.classList.remove('hidden');
                speechTxt.classList.remove('hidden');

                var text = "I don't know how to play chess! But let's try anyway!";
                typeText(speechTxt, text, function() {
                    // After typing finishes, wait a moment then show the real board
                    setTimeout(function() {
                        var blobbert = document.getElementById('blobbert');
                        if (blobbert) {
                            blobbert.classList.add('spin');
                            setTimeout(function(){ blobbert.classList.remove('spin'); }, 2000);
                        }
                        // Transition to real chess game
                        setTimeout(showChessGame, 1500);
                    }, 800);
                });
            });
        }

        var projectTabs = document.querySelectorAll('.project-tab');
        var projectSections = document.querySelectorAll('.project-section');
        if (projectTabs.length && projectSections.length) {
            var activateTab = function(targetId){
                projectTabs.forEach(function(tab){
                    var isActive = tab.dataset.target === targetId;
                    if (isActive) {
                        tab.classList.add('active');
                        tab.setAttribute('aria-selected', 'true');
                    } else {
                        tab.classList.remove('active');
                        tab.setAttribute('aria-selected', 'false');
                    }
                });
                projectSections.forEach(function(section){
                    if (section.id === targetId) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });
                playMenuBlip();
            };

            projectTabs.forEach(function(tab){
                tab.addEventListener('click', function(){
                    unlockAudio();
                    activateTab(tab.dataset.target);
                });
                tab.addEventListener('keydown', function(event){
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        unlockAudio();
                        activateTab(tab.dataset.target);
                    }
                });
            });

            var initialTarget = window.location.hash.replace('#', '');
            if (initialTarget) {
                setTimeout(function() { activateTab(initialTarget); }, 100);
            }
        }

        // carousels
        var playplaceImage = document.getElementById('playplaceCarouselImage');
        var playplacePrev = document.getElementById('playplacePrev');
        var playplaceNext = document.getElementById('playplaceNext');
        if (playplaceImage && playplacePrev && playplaceNext) {
            var playplaceImages = [
                'Assets/Playplace/1.png', 'Assets/Playplace/2.png',
                'Assets/Playplace/3.png', 'Assets/Playplace/4.png',
                'Assets/Playplace/5.png'
            ];
            var playplaceIndex = 0;
            playplacePrev.addEventListener('click', function(){
                unlockAudio();
                playplaceIndex = (playplaceIndex - 1 + playplaceImages.length) % playplaceImages.length;
                playplaceImage.src = playplaceImages[playplaceIndex];
                playMenuBlip();
            });
            playplaceNext.addEventListener('click', function(){
                unlockAudio();
                playplaceIndex = (playplaceIndex + 1) % playplaceImages.length;
                playplaceImage.src = playplaceImages[playplaceIndex];
                playMenuBlip();
            });
        }

        var unauthorizedImage = document.getElementById('unauthorizedCarouselImage');
        var unauthorizedPrev = document.getElementById('unauthorizedPrev');
        var unauthorizedNext = document.getElementById('unauthorizedNext');
        if (unauthorizedImage && unauthorizedPrev && unauthorizedNext) {
            var unauthorizedImages = [
                'Assets/Unauthorized/1.jpg', 'Assets/Unauthorized/2.png',
                'Assets/Unauthorized/3.png', 'Assets/Unauthorized/4.png'
            ];
            var unauthorizedIndex = 0;
            unauthorizedPrev.addEventListener('click', function(){
                unlockAudio();
                unauthorizedIndex = (unauthorizedIndex - 1 + unauthorizedImages.length) % unauthorizedImages.length;
                unauthorizedImage.src = unauthorizedImages[unauthorizedIndex];
                playMenuBlip();
            });
            unauthorizedNext.addEventListener('click', function(){
                unlockAudio();
                unauthorizedIndex = (unauthorizedIndex + 1) % unauthorizedImages.length;
                unauthorizedImage.src = unauthorizedImages[unauthorizedIndex];
                playMenuBlip();
            });
        }
        var parametricImage = document.getElementById('parametricCarouselImage');
        var parametricPrev = document.getElementById('parametricPrev');
        var parametricNext = document.getElementById('parametricNext');
        if (parametricImage && parametricPrev && parametricNext) {
            var parametricImages = [
                'Assets/pp1.png', 'Assets/pp2.png',
                'Assets/pp3.png', 'Assets/pp4.png',
                'Assets/pp5.png', 'Assets/pp6.png'
            ];
            var parametricIndex = 0;
            parametricPrev.addEventListener('click', function(){
                unlockAudio();
                parametricIndex = (parametricIndex - 1 + parametricImages.length) % parametricImages.length;
                parametricImage.src = parametricImages[parametricIndex];
                playMenuBlip();
            });
            parametricNext.addEventListener('click', function(){
                unlockAudio();
                parametricIndex = (parametricIndex + 1) % parametricImages.length;
                parametricImage.src = parametricImages[parametricIndex];
                playMenuBlip();
            });
        }
    });
})();

// gallery
function shuffleGallery() {
    var grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    var items = Array.from(grid.children);

    for (var i = items.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = items[i];
        items[i] = items[j];
        items[j] = temp;
    }

    items.forEach(function(item) {
        grid.appendChild(item);
    });
}

function initGallery() {
    shuffleGallery();

    var galleryItems = document.querySelectorAll('.gallery-item');
    var lightbox = document.getElementById('galleryLightbox');
    var lightboxImage = document.getElementById('lightboxImage');
    var lightboxVideo = document.getElementById('lightboxVideo');
    var lightboxTitle = document.getElementById('lightboxTitle');
    var lightboxClose = document.getElementById('lightboxClose');

    if (!galleryItems.length) return;

    var galleryObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var item = entry.target;
                var allItems = Array.from(document.querySelectorAll('.gallery-item'));
                var itemIndex = allItems.indexOf(item);
                var row = Math.floor(itemIndex / 4);
                var col = itemIndex % 4;
                var delay = (row * 100) + (col * 50);

                setTimeout(function() {
                    item.classList.add('visible');
                }, delay);

                galleryObserver.unobserve(item);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    galleryItems.forEach(function(item) {
        galleryObserver.observe(item);
    });

    // Click handlers
    galleryItems.forEach(function(item) {
        item.addEventListener('click', function() {
            unlockAudio();
            playMenuBlip();

            var link = item.getAttribute('data-link');
            var isPopup = item.getAttribute('data-popup') === 'true';
            var videoSrc = item.getAttribute('data-video');
            var isVideo = item.classList.contains('gallery-video') && videoSrc;

            if (link && !isPopup && !isVideo) {
                // Navigate to project page
                window.location.href = link;
            } else if (isVideo) {
                // Open video in lightbox
                var title = item.getAttribute('data-title') || 'Video';

                if (lightbox && lightboxVideo && lightboxTitle) {
                    // Set to video mode
                    lightbox.classList.add('video-mode');
                    
                    // Set video source
                    var source = lightboxVideo.querySelector('source');
                    if (source) {
                        source.src = videoSrc;
                    } else {
                        lightboxVideo.src = videoSrc;
                    }
                    lightboxVideo.load();
                    
                    lightboxTitle.textContent = title;
                    lightbox.classList.add('open');
                    document.body.style.overflow = 'hidden';
                    
                    // Auto-play video after a short delay
                    setTimeout(function() {
                        lightboxVideo.play().catch(function(e) {
                            console.log('Video autoplay prevented:', e);
                        });
                    }, 300);
                }
            } else if (isPopup || !link) {
                // Open image in lightbox
                var img = item.querySelector('img');
                var title = item.getAttribute('data-title') || item.getAttribute('data-project') || 'Image';

                if (img && lightbox && lightboxImage && lightboxTitle) {
                    // Set to image mode
                    lightbox.classList.remove('video-mode');
                    
                    lightboxImage.src = img.src;
                    lightboxImage.alt = img.alt;
                    lightboxTitle.textContent = title;
                    lightbox.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });

    // Close lightbox
    function closeLightbox() {
        playMenuBlip();
        if (lightbox) {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
            
            // Stop and reset video if it was playing
            if (lightboxVideo) {
                lightboxVideo.pause();
                lightboxVideo.currentTime = 0;
            }
            
            // Small delay before removing video-mode to allow fade out
            setTimeout(function() {
                if (!lightbox.classList.contains('open')) {
                    lightbox.classList.remove('video-mode');
                }
            }, 300);
        }
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeLightbox();
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });
}

function typeText(element, text, callback) {
    var speed = 70;
    element.textContent = '';
    var index = 0;

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
            playBlip();
        } else if (callback) {
            callback();
        }
    }

    type();
}