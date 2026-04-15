// ==UserScript==
// @name         Google Tasks - Scroll inteligente (horizontal fora, vertical nos cards)
// @version      1.0
// @description  Scroll inteligente para o Google Tasks
// @author       alessandro
// @match        *://tasks.google.com/*
// @match        *://mail.google.com/*
// @match        *://calendar.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const SPEED = 5;
    const SMOOTH = true;

    function isTypingTarget(el) {
        return el &&
            (
                el.tagName === 'INPUT' ||
                el.tagName === 'TEXTAREA' ||
                el.isContentEditable
            );
    }

    function hasVerticalScroll(el) {
        while (el && el !== document.body) {
            const style = getComputedStyle(el);
            const canScrollY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;

            if (canScrollY) return true;
            el = el.parentElement;
        }
        return false;
    }

    function findHorizontalScroller() {
        const candidates = [...document.querySelectorAll('div')];
        return candidates.find(el =>
            el.scrollWidth > el.clientWidth &&
            el.clientWidth > 200
        );
    }

    document.addEventListener('wheel', function (e) {
        if (e.ctrlKey || e.shiftKey) return;
        if (isTypingTarget(e.target)) return;

        // ✅ NOVO: se estiver em área com scroll vertical (cards), não interfere
        if (hasVerticalScroll(e.target)) return;
        const scroller = findHorizontalScroller();
        if (!scroller) return;
        const delta = e.deltaY * SPEED;
        e.preventDefault();
        
        if (SMOOTH) {
            scroller.scrollBy({
                left: delta,
                behavior: 'smooth'
            });
        } else {
            scroller.scrollLeft += delta;
        }
    }, { passive: false });
})();
