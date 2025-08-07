document.addEventListener("DOMContentLoaded", function () {
    // FAQ Accordion Functionality
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach((question) => {
        question.addEventListener("click", function () {
            // Toggle active class on question
            this.classList.toggle("active");

            // Toggle answer visibility
            const answer = this.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }

            // Close other open answers
            faqQuestions.forEach((otherQuestion) => {
                if (
                    otherQuestion !== question &&
                    otherQuestion.classList.contains("active")
                ) {
                    otherQuestion.classList.remove("active");
                    otherQuestion.nextElementSibling.style.maxHeight = null;
                }
            });
        });
    });

    // Video Play Button
    const playButton = document.querySelector(".play-button");
    if (playButton) {
        playButton.addEventListener("click", function () {
            // In a real implementation, this would launch a video modal
            alert(
                "This would play an explainer video in a real implementation"
            );
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                });
            }
        });
    });
});
