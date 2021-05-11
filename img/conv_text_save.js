if ( typeof(localStorage) == "object" )
{
    src_e = document.querySelector("#source");
    out_e = document.querySelector("#output");

    if ( localStorage.getItem("src_t") != undefined ) src_e.innerHTML = localStorage.getItem("src_t");
    if ( localStorage.getItem("out_t") != undefined ) out_e.innerHTML = localStorage.getItem("out_t");

    setInterval(
        function()
        {
            localStorage.setItem("src_t", src_e.innerText);
            localStorage.setItem("out_t", out_e.innerText);
        },
        1000
    );
}
