// Saves options to chrome.storage
function save_options() {
  var site = document.getElementById('rating-site').value;
  chrome.storage.sync.set({
    ratingSite: site,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    ratingSite: 'IMDB',
  }, function(items) {
    document.getElementById('rating-site').value = items.ratingSite;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);