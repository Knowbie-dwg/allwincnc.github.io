do {
    var el = document.querySelectorAll(".menu a");
    if ( !el ) break;
    for ( var i = el.length; i--; )
    {
        if ( window.location.href.search(el[i].href) >= 0 )
        {
            el[i].classList.add("active");
        }
    }
} while (0);
