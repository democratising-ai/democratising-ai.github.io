$(document).ready(function() {
  // Parse URL parameters
  function getUrlParams() {
    var params = {};
    var search = window.location.search.substring(1);
    if (search) {
      var pairs = search.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1] || '');
        params[key] = value;
      }
    }
    return params;
  }

  // Get all available facet types dynamically
  function getAvailableFacets() {
    var facets = [];
    $('#facets fieldset').each(function() {
      var fieldsetId = $(this).attr('id');
      if (fieldsetId) {
        var facetName = fieldsetId.replace('-set', '');
        facets.push(facetName);
      }
    });
    return facets;
  }

  // Check if any filters are actually active
  function hasActiveFilters() {
    return $('#facets :checkbox:checked').length > 0;
  }

  // Show/hide active filters section based on actual filter state
  function updateActiveFiltersVisibility() {
    var $activeFilters = $('#active-filters');
    if (hasActiveFilters() && $('.filter-badge').length > 0) {
      $activeFilters.show().addClass('show');
    } else {
      $activeFilters.hide().removeClass('show');
    }
  }

  // Apply URL parameters to checkboxes
  function applyUrlFilters() {
    var params = getUrlParams();

    // For each URL parameter, try to find and check the corresponding checkbox
    for (var param in params) {
      var checkboxId = params[param];
      var $checkbox = $('#' + checkboxId);

      if ($checkbox.length > 0) {
        $checkbox.prop('checked', true).change();
      }
    }

    // Update visibility after applying filters
    updateActiveFiltersVisibility();
  }

  // Add a filter badge to the active filters section
  function addFilterBadge(facetName, value) {
    // Create nice display text
    var displayValue = value.replace(/-/g, ' ').replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    var badge = $('<span class="badge badge-pill badge-primary filter-badge">' +
                  displayValue +
                  ' <button type="button" class="close" aria-label="Remove">&times;</button></span>');

    // Add click handler to remove the filter
    badge.find('.close').on('click', function() {
      // Find and uncheck the corresponding checkbox
      $('#' + value).prop('checked', false).change();
      badge.remove();

      // Update visibility based on remaining filters
      updateActiveFiltersVisibility();

      // Update URL
      updateUrl();
    });

    $('#filter-badges').append(badge);
  }

  // Update URL with current filters
  function updateUrl() {
    var params = [];
    var availableFacets = getAvailableFacets();

    // Get current usergroup from main URL if exists (for profile persistence)
    var currentUserGroup = new URLSearchParams(window.location.search).get('usergroup');
    var hasUserGroupCheckbox = false;

    // Process each available facet
    availableFacets.forEach(function(facetName) {
      var checkedBoxes = $('.' + facetName + ':checked');

      if (checkedBoxes.length > 0) {
        // Use the facet name directly as the URL parameter
        // Just normalize it to remove underscores/hyphens
        var paramName = facetName.replace(/-/g, '').replace(/_/g, '');

        checkedBoxes.each(function(index) {
          if (index === 0) { // Take first value for simplicity
            params.push(paramName + '=' + $(this).attr('id'));
          }
        });

        if (paramName === 'usergroup') {
          hasUserGroupCheckbox = true;
        }
      }
    });

    // Keep usergroup from profile selector if no checkbox is checked
    if (currentUserGroup && !hasUserGroupCheckbox) {
      params.push('usergroup=' + currentUserGroup);
    }

    // Update URL
    var newUrl = window.location.pathname;
    if (params.length > 0) {
      newUrl += '?' + params.join('&');
    }

    history.pushState({}, '', newUrl);
  }

  // Handle checkbox changes to update the active filters
  $('#facets :checkbox').change(function() {
    // Clear existing badges
    $('#filter-badges').empty();

    // Get all available facets dynamically
    var availableFacets = getAvailableFacets();

    // Process each facet type
    availableFacets.forEach(function(facetName) {
      $('.' + facetName + ':checked').each(function() {
        addFilterBadge(facetName, $(this).attr('id'));
      });
    });

    // Show/hide active filters section
    updateActiveFiltersVisibility();

    // Update URL
    updateUrl();
  });

  // Clear all filters button
  $('#clear-all-filters').click(function() {
    // Uncheck all checkboxes
    $('#facets :checkbox').prop('checked', false).change();

    // Clear badges
    $('#filter-badges').empty();

    // Hide active filters
    $('#active-filters').hide().removeClass('show');
    updateActiveFiltersVisibility();

    // Keep usergroup if it exists
    var currentUserGroup = new URLSearchParams(window.location.search).get('usergroup');
    var newUrl = window.location.pathname;
    if (currentUserGroup) {
      newUrl += '?usergroup=' + currentUserGroup;
    }

    history.pushState({}, '', newUrl);

    // Refresh gallery to show all items
    if (typeof refreshGallery === 'function') {
      refreshGallery();
    }
  });

  // Apply URL filters on page load
  applyUrlFilters();
});
