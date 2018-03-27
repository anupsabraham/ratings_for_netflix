function add_hover_listeners(titles){
    for (var i=0; i < titles.length; i++) {
        (function() {
            var netflix_title = titles[i];
            netflix_title.addEventListener('mouseenter', function(){
                if (netflix_title.getElementsByClassName('rating').length < 1){
                    var title = this.getElementsByClassName('video-preload-title-label')[0].textContent;

                    var query_string = title.toLowerCase().replace(/^\s*/,"").replace(/[ ]+/g,"_")
                                        .replace(/[Ã Ã€Ã¡ÃÃ¢Ã‚Ã£ÃƒÃ¤Ã„Ã¥Ã…Ã¦Ã†]/g,"a").replace(/[Ã§Ã‡]/g,"c").replace(/[Ã¨ÃˆÃ©Ã‰ÃªÃŠÃ«Ã‹]/g,"e")
                                        .replace(/[Ã¬ÃÃ­ÃÃ®ÃŽÃ¯Ã]/g,"i").replace(/[Ã°Ã]/g,"d").replace(/[Ã±Ã‘]/g,"n").replace(/[Ã²Ã’Ã³Ã“Ã´Ã”ÃµÃ•Ã¶Ã–Ã¸Ã˜]/g,"o")
                                        .replace(/[Ã¹Ã™ÃºÃšÃ»Ã›Ã¼Ãœ]/g,"u").replace(/[Ã½ÃÃ¿]/g,"y").replace(/[Ã¾Ãž]/g,"t").replace(/[ÃŸ]/g,"ss").replace(/[\W]/g,"");
                    var query_url = "https://v2.sg.media-imdb.com/titles/" + query_string[0] + "/" + query_string + ".json"
                    var xhttp_imdb_1 = new XMLHttpRequest();
                    xhttp_imdb_1.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            var response = JSON.parse(this.responseText.slice(6 + query_string.length, -1));
                            console.log(query_string + " | " + response.d[0].l + " | " + response.d[0].id);
                            var imdb_url = "https://www.imdb.com/title/" + response.d[0].id
                            var xhttp_imdb_2 = new XMLHttpRequest();
                            xhttp_imdb_2.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200) {
                                    var parser = new DOMParser();
                                    var imdb_document = parser.parseFromString(this.responseText, "text/html");

                                    var imdb_rating = imdb_document.getElementsByClassName('ratingValue')[0].innerText.trim();

                                    var rating_span = document.createElement('span')
                                    rating_span.innerHTML = imdb_rating;
                                    rating_span.className = "rating";
                                    netflix_title.insertBefore(rating_span, netflix_title.firstChild);
                                }
                            }

                            xhttp_imdb_2.open("GET", imdb_url, true);
                            xhttp_imdb_2.send();
                        }
                    };
                    xhttp_imdb_1.open("GET", query_url, true);
                    xhttp_imdb_1.send();
                }
            });
        }());
    }
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
