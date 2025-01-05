$((function () {

    const startGame = $('#start-game');

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
        $('#mobile-message').removeClass('hidden'); // Show the message
    }

    $('#close-message').on('click', function () {
        $('#mobile-message').addClass('hidden'); // Hide the message
    });

    startGame.on('click', function () {
        if (isMobile) {
            alert('This game is only available on PC. Please visit us on a desktop for the full experience.');
            return;
        }

        window.location.href = 'path_to_your_game.html'; // Redirect to the game page
    });

    startGame.on('click', function () {
        window.location.href = '../game';
    });

    $('#theme-toggle').on('click', function () {
        $('body').toggleClass('dark-theme');
    });

    $('#language-toggle').on('click', function () {
        $('.page').each(function () {
            const sectionId = $(this).attr('id');

            if (sectionId === 'home') {
                const heading = $(this).find('h2');
                const paragraph = $(this).find('p');
                if (heading.text() === 'Welcome to the Durak Game Guide') {
                    heading.text('Bienvenido a la Guía del Juego Durak');
                    paragraph.text('Descubre las reglas, estrategias y variaciones del clásico juego de cartas Durak.');
                } else {
                    heading.text('Welcome to the Durak Game Guide');
                    paragraph.text('Discover the rules, strategies, and variations of the classic card game Durak.');
                }
            } else if (sectionId === 'rules') {
                const heading = $(this).find('h2');
                heading.text(heading.text() === 'Rules of Durak' ? 'Reglas de Durak' : 'Rules of Durak');
            } else if (sectionId === 'variations') {
                const heading = $(this).find('h2');
                heading.text(heading.text() === 'Game Variations' ? 'Variaciones del Juego' : 'Game Variations');
            } else if (sectionId === 'contact') {
                const heading = $(this).find('h2');
                heading.text(heading.text() === 'Contact Us' ? 'Contáctenos' : 'Contact Us');
            }
        });
    });

    $('nav ul li a').on('click', function (e) {
        e.preventDefault();
        $('.page').removeClass('active');

        const targetSection = $($(this).attr('href'));
        targetSection.addClass('active');
    });

    $('#home').addClass('active');
}));
