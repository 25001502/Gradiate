document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const searchInput = document.getElementById("bursary-search");
    const fieldFilter = document.getElementById("filter-field");
    const provinceFilter = document.getElementById("filter-province");
    const saveButtons = document.querySelectorAll(".save-btn");
    const applyButtons = document.querySelectorAll(".btn-primary");

    // Search functionality
    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        filterBursaries();
    });

    // Filter functionality
    fieldFilter.addEventListener("change", filterBursaries);
    provinceFilter.addEventListener("change", filterBursaries);

    // Save bursary functionality
    saveButtons.forEach((button) => {
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
    applyButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            const card = this.closest(".bursary-card");
            const bursaryName = card.querySelector("h3").textContent;
            showToast(`Application started for ${bursaryName}`);
        });
    });

    // Filter bursaries based on search and filters
    function filterBursaries() {
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
                provinceValue === "all" || province.includes(provinceValue);

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
});
