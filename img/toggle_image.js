function toggle_image()
{
    this.classList.toggle("fullsize");
}

var img_list = document.querySelectorAll("img");

if ( typeof(img_list) == "object" )
{
    for ( var i = img_list.length; i--; )
    {
        if ( ! img_list[i].classList.contains("toggle_image") ) continue;
        img_list[i].addEventListener("click", toggle_image);
    }
}
