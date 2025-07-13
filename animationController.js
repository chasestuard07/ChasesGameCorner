// Wait for the whole page to load first
document.addEventListener("DOMContentLoaded", function () {
    
    // Get all elements that should animate on scroll
    const animatedItems = document.querySelectorAll(".animateUp");

    // Create an intersection observer to watch for when elements appear in the viewport
    const observer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                // When the item is visible on screen, add the 'visible' class
                entry.target.classList.add("visible");

                // Stop watching this element (optional but better for performance)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5 // Start the animation when 10% of the item is visible
    });

    // Tell the observer to watch each animated item
    animatedItems.forEach(function (item) {
        observer.observe(item);
    });
});
