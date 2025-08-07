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

    // Search functionality
    const helpSearch = document.getElementById("help-search");
    const searchButton = document.querySelector(".search-box button");

    function searchHelp() {
        const searchTerm = helpSearch.value.toLowerCase();

        if (searchTerm.trim() === "") {
            // Show all FAQ items if search is empty
            document.querySelectorAll(".faq-item").forEach((item) => {
                item.style.display = "block";
            });
            return;
        }

        let foundResults = false;

        // Search through FAQ questions and answers
        document.querySelectorAll(".faq-item").forEach((item) => {
            const question = item
                .querySelector(".faq-question")
                .textContent.toLowerCase();
            const answer = item
                .querySelector(".faq-answer")
                .textContent.toLowerCase();

            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = "block";
                foundResults = true;

                // Expand matching questions
                item.querySelector(".faq-question").classList.add("active");
                item.querySelector(".faq-answer").style.maxHeight =
                    item.querySelector(".faq-answer").scrollHeight + "px";
            } else {
                item.style.display = "none";
            }
        });

        // Show message if no results found
        const noResults = document.getElementById("no-results");
        if (!foundResults) {
            if (!noResults) {
                const noResultsMsg = document.createElement("p");
                noResultsMsg.id = "no-results";
                noResultsMsg.textContent =
                    "No results found. Try different keywords.";
                noResultsMsg.style.textAlign = "center";
                noResultsMsg.style.margin = "2rem 0";
                noResultsMsg.style.color = "var(--gray-text)";
                document
                    .querySelector(".faq-section")
                    .appendChild(noResultsMsg);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    // Search on button click
    searchButton.addEventListener("click", searchHelp);

    // Search on Enter key
    helpSearch.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchHelp();
        }
    });

    // Live chat button functionality
    const liveChatBtn = document.querySelector(".contact-card .btn-primary");
    if (liveChatBtn) {
        liveChatBtn.addEventListener("click", function () {
            alert(
                "Our live chat service is currently available Monday-Friday, 8am-5pm. Please try again during these hours or use our email support."
            );
        });
    }
});
