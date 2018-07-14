function add_hover_listeners(titles){
  /* Adding mouseenter listeners for all the slider cards */
  for (var i=0; i < titles.length; i++) {
    (function() {
      var netflix_title = titles[i];
      netflix_title.addEventListener('mouseenter', function(){
        var title = this.getElementsByClassName('ptrack-content')[0].textContent;
        if (lock_titles.indexOf(title) < 0) {
          lock_titles.push(title);
          chrome.storage.sync.get('ratingSite', function(data) {
            rating_site = data.ratingSite;
            if (rating_site == "IMDB") {
              // Convert title to imdb search query string
              var query_string = title.toLowerCase().replace(/^\s*/,"").replace(/[ ]+/g,"_")
                        .replace(/[Ã Ã€Ã¡ÃÃ¢Ã‚Ã£ÃƒÃ¤Ã„Ã¥Ã…Ã¦Ã†]/g,"a").replace(/[Ã§Ã‡]/g,"c").replace(/[Ã¨ÃˆÃ©Ã‰ÃªÃŠÃ«Ã‹]/g,"e")
                        .replace(/[Ã¬ÃÃ­ÃÃ®ÃŽÃ¯Ã]/g,"i").replace(/[Ã°Ã]/g,"d").replace(/[Ã±Ã‘]/g,"n").replace(/[Ã²Ã’Ã³Ã“Ã´Ã”ÃµÃ•Ã¶Ã–Ã¸Ã˜]/g,"o")
                        .replace(/[Ã¹Ã™ÃºÃšÃ»Ã›Ã¼Ãœ]/g,"u").replace(/[Ã½ÃÃ¿]/g,"y").replace(/[Ã¾Ãž]/g,"t").replace(/[ÃŸ]/g,"ss").replace(/[\W]/g,"");
              var query_url = "https://v2.sg.media-imdb.com/titles/" + query_string[0] + "/" + query_string + ".json"

              // Search API
              var xhttp_imdb_1 = new XMLHttpRequest();
              xhttp_imdb_1.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                  var response = JSON.parse(this.responseText.slice(6 + query_string.length, -1));
                  if (response.d.length > 0) {

                    var title_result = response.d[0]
                    // Search for exact match of the title.
                    for (var i=0; i < response.d.length; i++) {
                      if (response.d[i].l.trim() == title.trim()){
                        title_result = response.d[i];
                        break;
                      }
                    }
                    console.log(query_string + " | " + title_result.l + " | " + title_result.id);

                    var imdb_url = "https://www.imdb.com/title/" + title_result.id
                    // Parse the imdb page to fetch rating
                    var xhttp_imdb_2 = new XMLHttpRequest();
                    xhttp_imdb_2.onreadystatechange = function() {
                      if (this.readyState == 4 && this.status == 200) {
                        var parser = new DOMParser();
                        var imdb_document = parser.parseFromString(this.responseText, "text/html");

                        var imdb_rating = imdb_document.getElementsByClassName('ratingValue')[0].innerText.trim();

                        // Create a span element on the title card to display rating
                        var rating_span = document.createElement('span');
                        var rating_split = imdb_rating.split("/");
                        rating_span.innerHTML = '<a href="' + imdb_url +'"><span class="imdb-rating-value">' +
                                                rating_split[0] + '</span>' +
                                                '<span class="imdb-best-rating">/' +
                                                rating_split[1] + '</a>'

                        rating_span.className = "imdb-rating";
                        var bob_card_rating = rating_span.cloneNode(true);
                        netflix_title.insertBefore(rating_span, netflix_title.firstChild);
                        var bob_card_span = netflix_title.getElementsByTagName('span')[1];

                        // Observer for the bob card
                        // Copy the rating span to bob card once it is open.
                        var observer = new MutationObserver(function(mutations) {
                          mutations.forEach(function(mutation) {
                          var nodes = Array.prototype.slice.call(mutation.addedNodes);
                          nodes.forEach(function(node) {
                            if (node.parentElement.getAttribute('data-reactid') != null) {
                            node.insertBefore(bob_card_rating, node.firstChild)
                            }
                          });
                          });
                        });
                        observer.observe(netflix_title, {
                          childList: true,
                          subtree: true,
                          attributes: false,
                          characterData: false,
                        });

                      }
                      // Remove the title from lock since the imdb call failed. May want to refetch again.
                      else if (this.readyState == 4 && this.status != 200) {
                        index_to_remove = lock_titles.indexOf(title);
                        lock_titles.splice(index_to_remove, 1);
                      }
                    }
                  }
                  xhttp_imdb_2.open("GET", imdb_url, true);
                  xhttp_imdb_2.send();
                }
                else if (this.readyState == 4 && this.status != 200) {
                  index_to_remove = lock_titles.indexOf(title);
                  lock_titles.splice(index_to_remove, 1);
                }
              };
              xhttp_imdb_1.open("GET", query_url, true);
              xhttp_imdb_1.send();
            }
            else if (rating_site == "Rotten Tomatoes") {
              // Convert title to imdb search query string
              var query_url = "https://www.rottentomatoes.com/api/private/v2.0/search/?limit=2&q=" + title

              // Search API
              var xhttp_rottentomatoes = new XMLHttpRequest();
              xhttp_rottentomatoes.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                  var response = JSON.parse(this.responseText);
                  if (response.movieCount > 0 || response.tvCount > 0) {
                    var title_result = null
                    
                    // Search for exact match of the title.
                    for (var i=0; i < response.movies.length; i++) {
                      if (response.movies[i].name.trim() == title.trim()){
                        title_result = {
                          'name': response.movies[i].name,
                          'meterClass': response.movies[i].meterClass,
                          'meterScore': response.movies[i].meterScore
                        }
                        break;
                      }
                    }
                    if (title_result == null) {
                      for (var i=0; i < response.tvSeries.length; i++) {
                        if (response.tvSeries[i].title.trim() == title.trim()){
                          title_result = {
                            'name': response.tvSeries[i].title,
                            'meterClass': response.tvSeries[i].meterClass,
                            'meterScore': response.tvSeries[i].meterScore
                          }
                          break;
                        }
                      }
                    }
                    // If searching for exact match didn't give any result, 
                    // use the first result as title
                    if (title_result == null) {
                      if (response.movieCount > 0) {
                        title_result = {
                          'name': response.movies[0].name,
                          'meterClass': response.movies[0].meterClass,
                          'meterScore': response.movies[0].meterScore
                        }
                      }
                      else {
                        title_result = {
                          'name': response.tvSeries[0].title,
                          'meterClass': response.tvSeries[0].meterClass,
                          'meterScore': response.tvSeries[0].meterScore
                        }
                      }
                    }
                    console.log(title + " | " + title_result.name);

                    if (title_result.meterScore == undefined) {
                        title_result.meterScore = "-";
                    }

                    // Create a span element on the title card to display rating
                    var rating_span = document.createElement('span')
                    rating_span.innerHTML = title_result.meterScore + '%';
                    rating_span.className = "rt-rating " + title_result.meterClass;
                    var bob_card_rating = rating_span.cloneNode(true);
                    netflix_title.insertBefore(rating_span, netflix_title.firstChild);
                    var bob_card_span = netflix_title.getElementsByTagName('span')[1];

                    // Observer for the bob card
                    // Copy the rating span to bob card once it is open.
                    var observer = new MutationObserver(function(mutations) {
                      mutations.forEach(function(mutation) {
                      var nodes = Array.prototype.slice.call(mutation.addedNodes);
                      nodes.forEach(function(node) {
                        if (node.parentElement.getAttribute('data-reactid') != null) {
                        node.insertBefore(bob_card_rating, node.firstChild)
                        }
                      });
                      });
                    });
                    observer.observe(netflix_title, {
                      childList: true,
                      subtree: true,
                      attributes: false,
                      characterData: false,
                    });
                  }
                }
                else if (this.readyState == 4 && this.status != 200) {
                  index_to_remove = lock_titles.indexOf(title);
                  lock_titles.splice(index_to_remove, 1);
                }
              };
              xhttp_rottentomatoes.open("GET", query_url, true);
              xhttp_rottentomatoes.send();
            }
          });
        }
      });
    }());
  }
}

var netflix_titles = document.getElementsByClassName('title-card');
title_count = netflix_titles.length
add_hover_listeners(netflix_titles)

// variable to lock titles and avoid duplicates
lock_titles = [];

window.addEventListener("scroll", function() {
  var all_netflix_titles = Array.from(document.getElementsByClassName('title-card'));
  var new_netflix_titles = all_netflix_titles.slice(title_count);
  add_hover_listeners(new_netflix_titles);
  title_count += new_netflix_titles.length;
});
