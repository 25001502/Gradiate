document.addEventListener("DOMContentLoaded", function () {
    // Category Filtering
    const categoryTags = document.querySelectorAll(".category-tag");
    const articleCards = document.querySelectorAll(".article-card");

    categoryTags.forEach((tag) => {
        tag.addEventListener("click", function () {
            // Update active state
            categoryTags.forEach((t) => t.classList.remove("active"));
            this.classList.add("active");

            const category = this.dataset.category;

            // Filter articles
            articleCards.forEach((card) => {
                if (category === "all" || card.dataset.category === category) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // Search Functionality
    const searchInput = document.getElementById("blog-search");
    const searchButton = document.querySelector(".search-box button");

    function searchArticles() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === "") {
            // Show all articles if search is empty
            articleCards.forEach((card) => {
                card.style.display = "block";
            });
            return;
        }

        let foundResults = false;

        articleCards.forEach((card) => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            const excerpt = card
                .querySelector(".excerpt")
                .textContent.toLowerCase();
            const category = card
                .querySelector(".category-badge")
                .textContent.toLowerCase();

            if (
                title.includes(searchTerm) ||
                excerpt.includes(searchTerm) ||
                category.includes(searchTerm)
            ) {
                card.style.display = "block";
                foundResults = true;
            } else {
                card.style.display = "none";
            }
        });

        // Show message if no results found
        const noResults = document.getElementById("no-results");
        if (!foundResults) {
            if (!noResults) {
                const noResultsMsg = document.createElement("p");
                noResultsMsg.id = "no-results";
                noResultsMsg.textContent =
                    "No articles found matching your search. Try different keywords.";
                noResultsMsg.style.textAlign = "center";
                noResultsMsg.style.margin = "2rem 0";
                noResultsMsg.style.color = "var(--gray-text)";
                document
                    .querySelector(".blog-articles")
                    .appendChild(noResultsMsg);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    // Search on button click
    searchButton.addEventListener("click", searchArticles);

    // Search on Enter key
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchArticles();
        }
    });

    // Newsletter Form Submission
    const newsletterForm = document.querySelector(".newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (email) {
                // In a real app, you would send this to your backend
                alert(
                    `Thank you for subscribing with ${email}! You'll receive our next newsletter.`
                );
                emailInput.value = "";
            }
        });
    }

    // Pagination buttons (simulated)
    const paginationButtons = document.querySelectorAll(
        ".pagination button:not(.disabled)"
    );
    paginationButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // In a real app, this would load the next/previous page
            alert(
                "Pagination would load more articles in a real implementation"
            );
        });
    });
});
