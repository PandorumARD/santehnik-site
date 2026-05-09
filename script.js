/* ─── Swiper ─── */
const swiper = new Swiper(".mySwiper", {
    loop: true,
    spaceBetween: 20,
    grabCursor: true,

    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

    breakpoints: {
        320: { slidesPerView: 1 },
        640: { slidesPerView: 1.5 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
    },

    // Pause videos when slide changes
    on: {
        slideChange() {
            document.querySelectorAll(".work-video").forEach(v => v.pause());
        },
    },
});

/* ─── Modal (photo lightbox) ─── */
const modal    = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.getElementById("close");

const openModal = (src) => {
    modalImg.src = src;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
};

const closeModal = () => {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    // Small delay so image stays while animation plays
    setTimeout(() => { modalImg.src = ""; }, 200);
};

document.querySelector(".swiper-wrapper").addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
        openModal(e.target.src);
    }
});

closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

/* Touch swipe to close modal on mobile */
let touchStartX = 0;
modal.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
modal.addEventListener("touchend",   (e) => {
    if (Math.abs(e.changedTouches[0].clientX - touchStartX) > 60) closeModal();
}, { passive: true });

/* ─── Sticky nav + scroll tracking ─── */
const nav        = document.getElementById("stickyNav");
const sections   = document.querySelectorAll("section[id], footer[id]");
const navLinks   = document.querySelectorAll(".nav-link");
const scrollTopBtn = document.getElementById("scrollTop");

const onScroll = () => {
    // Nav background
    if (window.scrollY > 60) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }

    // Scroll-to-top button
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add("visible");
    } else {
        scrollTopBtn.classList.remove("visible");
    }

    // Active nav link highlight
    let current = "";
    sections.forEach((sec) => {
        if (window.scrollY >= sec.offsetTop - 120) {
            current = sec.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
};

window.addEventListener("scroll", onScroll, { passive: true });

/* ─── Scroll to top button ─── */
scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ─── Reveal on scroll ─── */
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el, i) => {
    // Stagger cards and steps slightly
    el.style.transitionDelay = `${Math.min(i % 4 * 80, 240)}ms`;
    revealObserver.observe(el);
});

/* ─── Phone mask + validation ─── */
const phoneInput = document.getElementById("phoneInput");
const phoneError = document.getElementById("phoneError");

if (phoneInput) {
    // Auto-format as user types
    phoneInput.addEventListener("input", (e) => {
        let value = phoneInput.value.replace(/\D/g, "");

        // Russian numbers: trim to 11 digits
        if (value.startsWith("8")) value = "7" + value.slice(1);
        if (value.length > 11) value = value.slice(0, 11);

        // Format: +7 (XXX) XXX-XX-XX
        let formatted = "";
        if (value.length >= 1)  formatted  = "+7";
        if (value.length > 1)   formatted += " (" + value.slice(1, 4);
        if (value.length > 4)   formatted += ") " + value.slice(4, 7);
        if (value.length > 7)   formatted += "-" + value.slice(7, 9);
        if (value.length > 9)   formatted += "-" + value.slice(9, 11);

        phoneInput.value = formatted;
        phoneInput.classList.remove("error");
        phoneError.classList.remove("show");
    });
}

/* ─── Callback form → Telegram ─── */
const callbackForm = document.getElementById("callbackForm");
const TG_TOKEN    = "8762237958:AAF9zKHhbHXd4rt-1YTDDziVWmRAcgBF7Yo";
const TG_CHAT_ID  = "776148667";

const isValidPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11;
};

const sendToTelegram = async (phone) => {
    const text = `📞 Новая заявка с сайта!\n\nНомер клиента: ${phone}\n\nПерезвоните как можно скорее.`;
    const url  = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML" }),
    });

    return res.ok;
};

if (callbackForm) {
    const submitBtn = callbackForm.querySelector("button[type=submit]");

    callbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const phone = phoneInput.value.trim();

        if (!isValidPhone(phone)) {
            phoneInput.classList.add("error");
            phoneError.classList.add("show");
            phoneInput.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляем...";

        const ok = await sendToTelegram(phone);

        if (ok) {
            submitBtn.textContent = "✓ Заявка отправлена!";
            submitBtn.style.background = "#22c55e";
            callbackForm.reset();
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = "Обратный звонок";
                submitBtn.style.background = "";
            }, 4000);
        } else {
            submitBtn.textContent = "Ошибка, попробуйте ещё раз";
            submitBtn.style.background = "#ef4444";
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = "Обратный звонок";
                submitBtn.style.background = "";
            }, 3000);
        }
    });
}