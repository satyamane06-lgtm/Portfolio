/* Portfolio functionality: scrollspy nav + working contact form */
(function () {
    'use strict';

    var sections = ['introduction', 'projects', 'skills', 'education', 'certificate', 'contact'];
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('#navbar .nav-link'));
    var middle = document.querySelector('.middle');

    function scrollIndex() {
        if (middle && (middle.scrollHeight - middle.clientHeight) > 2) {
            return middle.scrollTop;
        }
        return window.scrollY;
    }

    function onScroll() {
        var scroll = Math.max(scrollIndex(), 0);
        var pos = scroll + 180;
        var current = sections[0];
        for (var i = 0; i < sections.length; i++) {
            var el = document.getElementById(sections[i]);
            if (el) {
                var top = el.getBoundingClientRect().top + scroll;
                if (top <= pos) current = sections[i];
            }
        }
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (middle) middle.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = link.getAttribute('href');
            if (!href || href.length < 2) return;
            var target = document.getElementById(href.slice(1));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    var form = document.querySelector('#contact form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var status = document.getElementById('form-status');
            if (status) status.textContent = '';

            var name = form.elements['name'];
            var email = form.elements['email'];
            var message = form.elements['message'];

            if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
                if (status) status.textContent = 'Please fill in your name, email and message.';
                return;
            }
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
                if (status) status.textContent = 'Please enter a valid email address.';
                return;
            }

            var data = new URLSearchParams();
            data.append('form-name', 'contact');
            data.append('name', name.value.trim());
            data.append('email', email.value.trim());
            data.append('message', message.value.trim());

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data.toString()
            })
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    if (status) status.textContent = 'Message sent successfully';
                    form.reset();
                })
                .catch(function () {
                    if (status) status.textContent = 'Could not send your message. This form works when the site is deployed on Netlify.';
                });
        });
    }
})();

/* TinyFingers-style background animation */
(function () {
    'use strict';

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bgCanvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const EMOJIS = ['✨', '⭐', '🌈', '🎈', '🎉', '🚀', '🦄', '🍀', '💙', '💜', '🧡', '💫', '⚡', '🌻', '🎨', '🫧', '🌟', '🔥'];
    const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'heart'];
    const COLORS = ['#0ff', '#ff5c8a', '#ffd166', '#a06bff', '#7dff82', '#ff9f68', '#7cf7ff', '#f78cff'];

    let W = 0, H = 0, DPR = 1;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = arr => arr[(Math.random() * arr.length) | 0];

    const items = [];
    const MAX_ITEMS = 180;

    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function makeItem(x, y, o) {
        o = o || {};
        const roll = Math.random();
        const emoji = roll < 0.35;
        const letter = !emoji && roll < 0.7;
        return {
            x: x !== undefined ? x : rnd(0, W),
            y: y !== undefined ? y : H + 20,
            vx: o.vx !== undefined ? o.vx : rnd(-12, 12),
            vy: o.vy !== undefined ? o.vy : -rnd(35, 100),
            rot: rnd(-Math.PI, Math.PI),
            rotV: rnd(-1.8, 1.8),
            base: o.scale !== undefined ? o.scale : rnd(12, 22),
            dur: o.dur !== undefined ? o.dur : rnd(1.8, 3.6),
            t: 0,
            sway: rnd(35, 80),
            phase: rnd(0, Math.PI * 2),
            color: pick(COLORS),
            emoji: emoji,
            dot: !emoji && !letter,
            text: emoji ? pick(EMOJIS) : (o.letter || pick(LETTERS)),
            shape: letter && Math.random() < 0.4 ? pick(SHAPES) : null
        };
    }

    function addBurst(x, y, n, letter) {
        for (let i = 0; i < n; i++) {
            if (items.length >= MAX_ITEMS) break;
            const a = rnd(0, Math.PI * 2);
            const sp = rnd(30, 150);
            items.push(makeItem(x, y, {
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp - 40,
                scale: rnd(12, 26),
                dur: rnd(0.9, 2),
                letter: letter
            }));
        }
    }

    function sparkle(x, y) {
        items.push(makeItem(x, y, {
            vx: rnd(-8, 8),
            vy: rnd(-12, 4),
            scale: rnd(6, 12),
            dur: 0.7
        }));
    }

    function drawShape(kind, size) {
        ctx.beginPath();
        switch (kind) {
            case 'circle':
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                break;
            case 'square':
                ctx.rect(-size / 2, -size / 2, size, size);
                break;
            case 'triangle':
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                break;
            case 'diamond':
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(size / 2, 0);
                ctx.lineTo(0, size / 2);
                ctx.lineTo(-size / 2, 0);
                ctx.closePath();
                break;
            case 'heart':
                ctx.moveTo(0, size * 0.3);
                ctx.bezierCurveTo(-size, -size * 0.35, -size * 0.5, -size, 0, -size * 0.5);
                ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.35, 0, size * 0.3);
                ctx.closePath();
                break;
        }
    }

    let last = performance.now();
    let idleAcc = 0;
    let lastMove = 0;

    function frame(now) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        ctx.clearRect(0, 0, W, H);

        idleAcc += dt;
        if (idleAcc > 1.1 && items.length < MAX_ITEMS) {
            idleAcc = 0;
            items.push(makeItem());
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const it = items[i];
            it.t += dt;
            if (it.t >= it.dur || it.y < -70) {
                items.splice(i, 1);
                continue;
            }

            it.x += it.vx * dt + Math.sin(now / 900 + it.phase) * it.sway * dt;
            it.y += it.vy * dt;
            it.vy *= 1 - 0.5 * dt;
            it.rot += it.rotV * dt;

            const p = it.t / it.dur;
            const alpha = 0.8 * (1 - p) * Math.min(1, p * 8);
            const size = it.base * (0.5 + 0.75 * p);

            ctx.save();
            ctx.globalAlpha = Math.max(alpha, 0);
            ctx.translate(it.x, it.y);
            ctx.rotate(it.rot);

            if (it.dot) {
                ctx.fillStyle = it.color;
                ctx.shadowColor = it.color;
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (it.shape) {
                ctx.fillStyle = it.color;
                drawShape(it.shape, size);
                ctx.fill();
            } else {
                ctx.fillStyle = it.color;
                ctx.font = size + "px 'Poppins','Segoe UI Emoji','Apple Color Emoji',sans-serif";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(it.text, 0, 0);
            }
            ctx.restore();
        }

        requestAnimationFrame(frame);
    }

    for (let i = 0; i < 10; i++) items.push(makeItem());
    requestAnimationFrame(frame);

    document.addEventListener('keydown', function (e) {
        if (e.repeat) return;
        const el = e.target;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
        const letter = e.key.length === 1 ? e.key.toUpperCase() : pick(LETTERS);
        for (let i = 0; i < 10; i++) {
            if (items.length >= MAX_ITEMS) break;
            items.push(makeItem(rnd(0, W), H + 20, {
                vx: rnd(-30, 30),
                vy: -rnd(80, 220),
                scale: rnd(16, 30),
                dur: rnd(1.2, 2.4),
                letter: letter
            }));
        }
    }, { passive: true });

    document.addEventListener('pointerdown', function (e) {
        addBurst(e.clientX, e.clientY, 16);
    }, { passive: true });

    document.addEventListener('pointermove', function (e) {
        const now = performance.now();
        if (now - lastMove > 45 && items.length < MAX_ITEMS) {
            lastMove = now;
            sparkle(e.clientX, e.clientY);
        }
    }, { passive: true });
})();