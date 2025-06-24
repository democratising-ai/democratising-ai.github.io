// Methods and jQuery UI for Wax search box
function excerptedString(str) {
  str = str || ''; // handle null > string
  if (str.length < 40) {
    return str;
  }
  else {
    return `${str.substring(0, 40)} ...`;
  }
}

function getThumbnail(item, url) {
  if ('thumbnail' in item) {
    return `<img class='sq-thumb-sm' src='${url}${item.thumbnail}'/>&nbsp;&nbsp;&nbsp;`
  }
  else {
    return '';
  }
}

function displayResult(item, fields, url) {
  // Create the individual post URL from the title
  var link = '{{ site.baseurl }}/posts/' + (item.title || 'untitled').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim() + '/';

  var title = item.title || 'Untitled';
  var thumb = getThumbnail(item, url); // optional, remove if no thumbnails

  return `<div class="result"><a href="${link}">${thumb}<p><span class="title">${title}</span></p></a></div>`;
}

function startSearchUI(fields, indexFile, url) {
  $.getJSON(indexFile, function(store) {
    var index  = new elasticlunr.Index;

    index.saveDocument(false);
    index.setRef('lunr_id');

    for (i in fields) { index.addField(fields[i]); }
    for (i in store)  { index.addDoc(store[i]); }

    $('input#search').on('keyup', function() {
      var results_div = $('#results');
      var query       = $(this).val().trim();

      // Clear results if search is empty
      if (query === '') {
        results_div.empty();
        return;
      }

      var results = index.search(query, { boolean: 'AND', expand: true });

      results_div.empty();

      // Only show results info if there are results to show
      if (results.length > 0) {
        results_div.append(`<p class="results-info show">Displaying ${results.length} results</p>`);

        for (var r in results) {
          var ref    = results[r].ref;
          var item   = store[ref];
          var result = displayResult(item, fields, url);

          results_div.append(result);
        }
      }
    });
  });
}