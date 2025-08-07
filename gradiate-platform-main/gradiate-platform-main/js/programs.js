document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const searchInput = document.getElementById("program-search");
    const fieldFilter = document.getElementById("filter-field");
    const levelFilter = document.getElementById("filter-level");
    const provinceFilter = document.getElementById("filter-province");
    const saveButtons = document.querySelectorAll(".save-btn");
    const viewButtons = document.querySelectorAll(".btn-primary");

    // Search functionality
    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        filterPrograms();
    });

    // Filter functionality
    fieldFilter.addEventListener("change", filterPrograms);
    levelFilter.addEventListener("change", filterPrograms);
    provinceFilter.addEventListener("change", filterPrograms);

    // Save program functionality
    saveButtons.forEach((button) => {
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
    viewButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            const card = this.closest(".program-card");
            const programName = card.querySelector("h3").textContent;
            showToast(`Loading details for ${programName}`);
            // In a real app, this would redirect to program details page
        });
    });

    // Filter programs based on search and filters
    function filterPrograms() {
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
                provinceValue === "all" || province.includes(provinceValue);

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
});
