function add_hover_listeners(titles){
    for (var i=0; i < titles.length; i++) {
        (function() {
            var netflix_title = titles[i];
            netflix_title.addEventListener('mouseenter', function(){
                if (netflix_title.getElementsByClassName('rating').length < 1){
                    var imdb_rating = get_imdb_rating(this.getElementsByClassName('video-preload-title-label')[0].textContent);
                    var rating_span = document.createElement('span')
                    rating_span.innerHTML = imdb_rating;
                    rating_span.className = "rating";
                    netflix_title.insertBefore(rating_span, netflix_title.firstChild);
                }
            });
        }());
    }
}

function get_imdb_rating(title) {
    var query_string = title.toLowerCase().replace(/^\s*/,"").replace(/[ ]+/g,"_")
                        .replace(/[Ã Ã€Ã¡ÃÃ¢Ã‚Ã£ÃƒÃ¤Ã„Ã¥Ã…Ã¦Ã†]/g,"a").replace(/[Ã§Ã‡]/g,"c").replace(/[Ã¨ÃˆÃ©Ã‰ÃªÃŠÃ«Ã‹]/g,"e")
                        .replace(/[Ã¬ÃÃ­ÃÃ®ÃŽÃ¯Ã]/g,"i").replace(/[Ã°Ã]/g,"d").replace(/[Ã±Ã‘]/g,"n").replace(/[Ã²Ã’Ã³Ã“Ã´Ã”ÃµÃ•Ã¶Ã–Ã¸Ã˜]/g,"o")
                        .replace(/[Ã¹Ã™ÃºÃšÃ»Ã›Ã¼Ãœ]/g,"u").replace(/[Ã½ÃÃ¿]/g,"y").replace(/[Ã¾Ãž]/g,"t").replace(/[ÃŸ]/g,"ss").replace(/[\W]/g,"");
    var query_url = "https://v2.sg.media-imdb.com/titles/" + query_string[0] + "/" + query_string + ".json"
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", query_url, false);  // TODO: change this to async
    xhttp.send();
    var response = JSON.parse(xhttp.responseText.slice(6 + query_string.length, -1));
    console.log(query_string + " | " + response.d[0].l + " | " + response.d[0].id);
    var imdb_url = "https://www.imdb.com/title/" + response.d[0].id
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", imdb_url, false);
    xhttp.send();
    var imdb_html = document.createElement('html');
    imdb_html.innerHTML = xhttp.responseText;
    return imdb_html.getElementsByClassName('ratingValue')[0].innerText.trim();
}

var netflix_titles = document.getElementsByClassName('title-card');
title_count = netflix_titles.length
add_hover_listeners(netflix_titles)

window.addEventListener("scroll", function() {
    var all_netflix_titles = Array.from(document.getElementsByClassName('title-card'));
    var new_netflix_titles = all_netflix_titles.slice(title_count);
    add_hover_listeners(new_netflix_titles);
    title_count += new_netflix_titles.length;
});
