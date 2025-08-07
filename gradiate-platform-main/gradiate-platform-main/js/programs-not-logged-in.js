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

    // Sample program data
    const programsData = {
        recommended: [
            {
                name: "BSc Computer Science",
                institution: "University of Johannesburg",
                level: "Undergraduate Degree (3 years)",
                deadline: "30 September 2025",
                location: "Gauteng • On-campus",
                fees: "Estimated fees: R45,000/year",
                tags: ["STEM", "Accredited", "NSFAS Eligible"],
                matchPercentage: 92,
            },
            {
                name: "BEng Electrical Engineering",
                institution: "University of Cape Town",
                level: "Undergraduate Degree (4 years)",
                deadline: "31 July 2025",
                location: "Western Cape • On-campus",
                fees: "Estimated fees: R60,000/year",
                tags: ["Engineering", "ECSA Accredited", "Competitive"],
                matchPercentage: 88,
            },
        ],
        all: [
            {
                name: "BA Psychology",
                institution: "University of Pretoria",
                level: "Undergraduate Degree (3 years)",
                deadline: "30 September 2025",
                location: "Gauteng • Hybrid",
                fees: "Estimated fees: R35,000/year",
                tags: ["Social Sciences", "Flexible"],
            },
            {
                name: "BCom Accounting",
                institution: "Stellenbosch University",
                level: "Undergraduate Degree (3 years)",
                deadline: "31 August 2025",
                location: "Western Cape • On-campus",
                fees: "Estimated fees: R50,000/year",
                tags: ["SAICA Accredited", "High Demand"],
            },
            {
                name: "MSc Data Science",
                institution: "University of KwaZulu-Natal",
                level: "Postgraduate Degree (2 years)",
                deadline: "15 October 2025",
                location: "KwaZulu-Natal • Online",
                fees: "Estimated fees: R40,000/year",
                tags: ["Tech", "Remote", "Research"],
            },
        ],
    };

    // Render programs if logged in
    if (isLoggedIn) {
        renderPrograms();

        // DOM Elements
        const searchInput = document.getElementById("program-search");
        const fieldFilter = document.getElementById("filter-field");
        const levelFilter = document.getElementById("filter-level");
        const provinceFilter = document.getElementById("filter-province");

        // Search functionality
        searchInput.addEventListener("input", function () {
            filterPrograms();
        });

        // Filter functionality
        fieldFilter.addEventListener("change", filterPrograms);
        levelFilter.addEventListener("change", filterPrograms);
        provinceFilter.addEventListener("change", filterPrograms);
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

    // Render program cards
    function renderPrograms() {
        const recommendedGrid = document.getElementById(
            "recommended-programs-grid"
        );
        const allGrid = document.getElementById("all-programs-grid");

        // Clear existing cards
        recommendedGrid.innerHTML = "";
        allGrid.innerHTML = "";

        // Render recommended programs
        programsData.recommended.forEach((program) => {
            recommendedGrid.appendChild(createProgramCard(program, true));
        });

        // Render all programs
        programsData.all.forEach((program) => {
            allGrid.appendChild(createProgramCard(program, false));
        });

        // Add event listeners to new buttons
        addButtonEventListeners();
    }

    // Create a program card element
    function createProgramCard(program, isRecommended) {
        const card = document.createElement("div");
        card.className = `program-card ${isRecommended ? "recommended" : ""}`;

        const tagsHTML = program.tags
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("");

        const matchBadge = isRecommended
            ? `<div class="match-badge">${program.matchPercentage}% Match</div>`
            : "";

        card.innerHTML = `
            <div class="card-header">
                ${matchBadge}
                <h3>${program.name}</h3>
                <p class="institution">${program.institution}</p>
            </div>
            <div class="card-body">
                <div class="program-detail">
                    <i class="fas fa-graduation-cap"></i>
                    <span>${program.level}</span>
                </div>
                <div class="program-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Applications close: ${program.deadline}</span>
                </div>
                <div class="program-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${program.location}</span>
                </div>
                <div class="program-detail">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>${program.fees}</span>
                </div>
                <div class="program-tags">
                    ${tagsHTML}
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-outline save-btn">
                    <i class="far fa-bookmark"></i> Save
                </button>
                <button class="btn btn-primary">
                    View Program
                </button>
            </div>
        `;

        return card;
    }

    // Add event listeners to buttons
    function addButtonEventListeners() {
        // Save program functionality
        document.querySelectorAll(".save-btn").forEach((button) => {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                const card = this.closest(".program-card");
                const programName = card.querySelector("h3").textContent;

                if (this.classList.contains("saved")) {
                    this.innerHTML = '<i class="far fa-bookmark"></i> Save';
                    this.classList.remove("saved");
                    showToast(`Removed ${programName} from saved programs`);
                } else {
                    this.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                    this.classList.add("saved");
                    showToast(`Saved ${programName} to your profile`);
                }
            });
        });

        // View program button functionality
        document
            .querySelectorAll(".btn-primary:not(#profile-btn):not(#auth-btn)")
            .forEach((button) => {
                button.addEventListener("click", function (e) {
                    e.preventDefault();
                    const card = this.closest(".program-card");
                    const programName = card.querySelector("h3").textContent;
                    showToast(`Loading details for ${programName}`);
                    // In a real app, this would redirect to program details page
                });
            });
    }

    // Filter programs based on search and filters
    function filterPrograms() {
        const searchInput = document.getElementById("program-search");
        const fieldFilter = document.getElementById("filter-field");
        const levelFilter = document.getElementById("filter-level");
        const provinceFilter = document.getElementById("filter-province");

        const searchTerm = searchInput.value.toLowerCase();
        const fieldValue = fieldFilter.value;
        const levelValue = levelFilter.value;
        const provinceValue = provinceFilter.value;

        document.querySelectorAll(".program-card").forEach((card) => {
            const name = card.querySelector("h3").textContent.toLowerCase();
            const institution = card
                .querySelector(".institution")
                .textContent.toLowerCase();
            const field = card
                .querySelector(".program-tags")
                .textContent.toLowerCase();
            const level = card
                .querySelector(".program-detail:first-child span")
                .textContent.toLowerCase();
            const province = card
                .querySelector(".program-detail:nth-child(3) span")
                .textContent.toLowerCase();

            const matchesSearch =
                name.includes(searchTerm) || institution.includes(searchTerm);
            const matchesField =
                fieldValue === "all" || field.includes(fieldValue);
            const matchesLevel =
                levelValue === "all" || level.includes(levelValue);
            const matchesProvince =
                provinceValue === "all" ||
                province.includes(provinceValue.toLowerCase());

            if (
                matchesSearch &&
                matchesField &&
                matchesLevel &&
                matchesProvince
            ) {
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
