// User Profile Persistence Module - URL Parameter Only
(function() {
  'use strict';

  // Initialize on DOM ready
  $(document).ready(function() {
    updateAllLinks();
    setupLinkInterceptor();
  });

  // Get usergroup from URL
  function getUserGroupFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('usergroup');
  }

  // Update all internal links to include usergroup parameter
  function updateAllLinks() {
    var currentUserGroup = getUserGroupFromURL();

    if (currentUserGroup) {
      $('a[href^="/"], a[href^="' + window.location.origin + '"]').each(function() {
        var href = $(this).attr('href');

        // Skip anchors only
        if (href && !href.startsWith('#')) {
          try {
            var url = new URL(href, window.location.origin);

            // Only update internal links
            if (url.origin === window.location.origin) {
              // ALWAYS update the parameter (don't check if it exists)
              url.searchParams.set('usergroup', currentUserGroup);
              $(this).attr('href', url.toString());
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
    }
  }

  // Intercept all internal link clicks to maintain usergroup
  function setupLinkInterceptor() {
    $(document).on('click', 'a[href^="/"]', function(e) {
      var currentUserGroup = getUserGroupFromURL();

      if (currentUserGroup) {
        var href = $(this).attr('href');

        // Process all internal links (not just those without usergroup)
        if (href && !href.startsWith('#')) {
          e.preventDefault();

          try {
            var url = new URL(href, window.location.origin);

            if (url.origin === window.location.origin) {
              // ALWAYS update the parameter
              url.searchParams.set('usergroup', currentUserGroup);
              window.location.href = url.toString();
            }
          } catch (err) {
            // If URL parsing fails, proceed with original navigation
            window.location.href = href;
          }
        }
      }
    });
  }

  // Global API functions
  window.UserProfile = {
    // Get current user group from URL only
    getCurrentUserGroup: function() {
      return getUserGroupFromURL();
    },

    // Set user group by navigating with parameter
    setUserGroup: function(userGroup) {
      if (userGroup) {
        var url = new URL(window.location);
        url.searchParams.set('usergroup', userGroup);
        // Navigate immediately
        window.location.href = url.toString();
      }
    },

    // Clear user group by navigating without parameter
    clearUserGroup: function() {
      var url = new URL(window.location);
      url.searchParams.delete('usergroup');
      // Navigate immediately
      window.location.href = url.toString();
    },

    // Add usergroup parameter to any URL
    addUserGroupToURL: function(url) {
      var currentUserGroup = getUserGroupFromURL();

      if (currentUserGroup) {
        try {
          var fullURL = new URL(url, window.location.origin);
          fullURL.searchParams.set('usergroup', currentUserGroup);
          return fullURL.toString();
        } catch (e) {
          return url;
        }
      }

      return url;
    }
  };

  // Update links when new content is added dynamically
  $(document).on('DOMNodeInserted', function(e) {
    if ($(e.target).find('a').length > 0) {
      updateAllLinks();
    }
  });

})();
