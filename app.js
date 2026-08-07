/* =====================================================
   MOBILE MENU
===================================================== */

const menuButton = document.getElementById("menuButton");

const navMenu = document.querySelector(".nav-menu");


menuButton.addEventListener("click", function () {

    navMenu.classList.toggle("active");

});



/* =====================================================
   CLOSE MOBILE MENU AFTER CLICK
===================================================== */

const navLinks = document.querySelectorAll(".nav-menu a");


navLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        navMenu.classList.remove("active");

    });

});



/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealElements = document.querySelectorAll(
    ".research-card, .project, .timeline-item, .gallery-item, .about-content"
);


const observer = new IntersectionObserver(

    function(entries) {

        entries.forEach(function(entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    },

    {
        threshold: 0.12
    }

);


revealElements.forEach(function(element) {

    element.classList.add("reveal");

    observer.observe(element);

});



/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", function() {

    let current = "";

    sections.forEach(function(section) {

        const sectionTop = section.offsetTop - 200;

        if (window.scrollY >= sectionTop) {

            current = section.getAttribute("id");

        }

    });


    navLinks.forEach(function(link) {

        link.classList.remove("active");

        if (
            link.getAttribute("href") === "#" + current
        ) {

            link.classList.add("active");

        }

    });

});
