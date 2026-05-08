// Инициализация слайдера
const swiper = new Swiper(".mySwiper", {
    loop: true,
    spaceBetween: 20,
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
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
    }
});

// Модальное окно
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.getElementById("close");

// Открытие при клике на фото в слайдере
document.querySelector('.swiper-wrapper').addEventListener("click", function (e) {
    if (e.target.tagName === 'IMG') {
        modal.style.display = "flex";
        modalImg.src = e.target.src;
        document.body.style.overflow = 'hidden'; // Запрет прокрутки при открытой модалке
    }
});

// Закрытие
const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = 'auto';
};

closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// Закрытие по кнопке Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});