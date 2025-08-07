document.addEventListener("DOMContentLoaded", function () {
    // Check authentication status (in a real app, this would come from your auth system)
    const isLoggedIn = checkAuthStatus(); // Implement this function based on your auth system

    // Set body class based on auth status
    document.body.classList.add(isLoggedIn ? "logged-in" : "guest");

    // Update auth buttons
    const authBtn = document.getElementById("auth-btn");
    const profileBtn = document.getElementById("profile-btn");

    if (isLoggedIn) {
        authBtn.textContent = "Log Out";
        authBtn.href = "#";
        authBtn.id = "logout-btn";
        profileBtn.style.display = "inline-block";
    } else {
        authBtn.textContent = "Log In";
        authBtn.href = "login.html";
        profileBtn.style.display = "none";
    }

    // Sample bursary data
    const bursariesData = {
        matched: [
            {
                name: "Computer Science Bursary",
                institution: "University of Johannesburg",
                funding: "Full tuition + R10,000 living allowance",
                deadline: "30 September 2025",
                location: "Gauteng",
                tags: ["Computer Science", "Undergraduate", "Full Funding"],
                matchPercentage: 92,
            },
            {
                name: "Engineering Scholarship",
                institution: "University of Cape Town",
                funding: "Full tuition + R15,000 living allowance",
                deadline: "15 October 2025",
                location: "Western Cape",
                tags: ["All Engineering", "Undergraduate", "Full Funding"],
                matchPercentage: 85,
            },
        ],
        all: [
            {
                name: "Medical Bursary",
                institution: "University of the Witwatersrand",
                funding: "Full tuition + accommodation",
                deadline: "10 October 2025",
                location: "Gauteng",
                tags: ["Medicine", "Undergraduate", "Full Funding"],
            },
            {
                name: "Business Leadership Scholarship",
                institution: "Stellenbosch University",
                funding: "50% tuition coverage",
                deadline: "5 December 2025",
                location: "Western Cape",
                tags: ["Business", "Postgraduate", "Partial Funding"],
            },
        ],
    };

    // Render bursaries if logged in
    if (isLoggedIn) {
        renderBursaries();

        // DOM Elements
        const searchInput = document.getElementById("bursary-search");
        const fieldFilter = document.getElementById("filter-field");
        const provinceFilter = document.getElementById("filter-province");

        // Search functionality
        searchInput.addEventListener("input", function () {
            filterBursaries();
        });

        // Filter functionality
        fieldFilter.addEventListener("change", filterBursaries);
        provinceFilter.addEventListener("change", filterBursaries);
    }

    // Logout functionality
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            // In a real app, you would call your logout API here
            logoutUser();
            window.location.href = "index.html";
        });
    }

    // Render bursary cards
    function renderBursaries() {
        const matchedGrid = document.getElementById("matched-bursaries-grid");
        const allGrid = document.getElementById("all-bursaries-grid");

        // Clear existing cards
        matchedGrid.innerHTML = "";
        allGrid.innerHTML = "";

        // Render matched bursaries
        bursariesData.matched.forEach((bursary) => {
            matchedGrid.appendChild(createBursaryCard(bursary, true));
        });

        // Render all bursaries
        bursariesData.all.forEach((bursary) => {
            allGrid.appendChild(createBursaryCard(bursary, false));
        });

        // Add event listeners to new buttons
        addButtonEventListeners();
    }

    // Create a bursary card element
    function createBursaryCard(bursary, isMatched) {
        const card = document.createElement("div");
        card.className = `bursary-card ${isMatched ? "matched" : ""}`;

        const tagsHTML = bursary.tags
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("");

        const matchBadge = isMatched
            ? `<div class="match-badge">
                <i class="fas fa-check-circle"></i> ${bursary.matchPercentage}% Match
            </div>`
            : "";

        card.innerHTML = `
            <div class="card-header">
                ${matchBadge}
                <h3>${bursary.name}</h3>
                <p class="institution">${bursary.institution}</p>
            </div>
            <div class="card-body">
                <div class="bursary-detail">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>${bursary.funding}</span>
                </div>
                <div class="bursary-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Closes: ${bursary.deadline}</span>
                </div>
                <div class="bursary-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${bursary.location}</span>
                </div>
                <div class="bursary-tags">
                    ${tagsHTML}
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary">
                    Apply Now
                </button>
                <button class="btn btn-outline save-btn">
                    <i class="far fa-bookmark"></i> Save
                </button>
            </div>
        `;

        return card;
    }

    // Add event listeners to buttons
    function addButtonEventListeners() {
        // Save bursary functionality
        document.querySelectorAll(".save-btn").forEach((button) => {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                const card = this.closest(".bursary-card");
                const bursaryName = card.querySelector("h3").textContent;

                if (this.classList.contains("saved")) {
                    this.innerHTML = '<i class="far fa-bookmark"></i> Save';
                    this.classList.remove("saved");
                    showToast(`Removed ${bursaryName} from saved bursaries`);
                } else {
                    this.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                    this.classList.add("saved");
                    showToast(`Saved ${bursaryName} to your profile`);
                }
            });
        });

        // Apply button functionality
        document
            .querySelectorAll(".btn-primary:not(#profile-btn):not(#auth-btn)")
            .forEach((button) => {
                button.addEventListener("click", function (e) {
                    e.preventDefault();
                    const card = this.closest(".bursary-card");
                    const bursaryName = card.querySelector("h3").textContent;
                    showToast(`Application started for ${bursaryName}`);
                });
            });
    }

    // Filter bursaries based on search and filters
    function filterBursaries() {
        const searchInput = document.getElementById("bursary-search");
        const fieldFilter = document.getElementById("filter-field");
        const provinceFilter = document.getElementById("filter-province");

        const searchTerm = searchInput.value.toLowerCase();
        const fieldValue = fieldFilter.value;
        const provinceValue = provinceFilter.value;

        document.querySelectorAll(".bursary-card").forEach((card) => {
            const name = card.querySelector("h3").textContent.toLowerCase();
            const institution = card
                .querySelector(".institution")
                .textContent.toLowerCase();
            const field = card
                .querySelector(".bursary-tags")
                .textContent.toLowerCase();
            const province = card
                .querySelector(".bursary-detail:last-child span")
                .textContent.toLowerCase();

            const matchesSearch =
                name.includes(searchTerm) || institution.includes(searchTerm);
            const matchesField =
                fieldValue === "all" || field.includes(fieldValue);
            const matchesProvince =
                provinceValue === "all" ||
                province.includes(provinceValue.toLowerCase());

            if (matchesSearch && matchesField && matchesProvince) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast-notification";
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 10);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Mock auth functions - replace with real auth logic
    function checkAuthStatus() {
        // In a real app, this would check cookies/localStorage/tokens
        return localStorage.getItem("isLoggedIn") === "true";
    }

    function logoutUser() {
        // In a real app, this would clear auth tokens
        localStorage.removeItem("isLoggedIn");
    }
});
