/**
 * Initialize the testimonial carousel functionality
 */
document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const testimonials = document.querySelectorAll(".testimonial");
    const dotsContainer = document.querySelector(".carousel-dots");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    let currentIndex = 0;

    // Create navigation dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToTestimonial(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".dot");

    /**
     * Navigate to a specific testimonial
     * @param {number} index - Index of the testimonial to show
     */
    function goToTestimonial(index) {
        testimonials.forEach((testimonial) =>
            testimonial.classList.remove("active")
        );
        dots.forEach((dot) => dot.classList.remove("active"));

        currentIndex = index;
        testimonials[currentIndex].classList.add("active");
        dots[currentIndex].classList.add("active");
    }

    // Navigation functions
    function nextTestimonial() {
        const newIndex = (currentIndex + 1) % testimonials.length;
        goToTestimonial(newIndex);
    }

    function prevTestimonial() {
        const newIndex =
            (currentIndex - 1 + testimonials.length) % testimonials.length;
        goToTestimonial(newIndex);
    }

    // Event listeners
    nextBtn.addEventListener("click", nextTestimonial);
    prevBtn.addEventListener("click", prevTestimonial);

    // Auto-rotate testimonials every 5 seconds
    setInterval(nextTestimonial, 5000);

    // Search functionality placeholder
    const searchBtn = document.querySelector(".search-container button");
    searchBtn.addEventListener("click", function () {
        const searchTerm = document.querySelector(
            ".search-container input"
        ).value;
        alert(
            "Search functionality coming soon! You searched for: " + searchTerm
        );
    });
});
