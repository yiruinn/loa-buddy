up.compiler('a', function(link) {
    link.addEventListener('click', function(event) {
        console.log('Link clicked:', link.href);
    });
});
