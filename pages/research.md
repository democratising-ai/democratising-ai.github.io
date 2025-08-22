---
layout: page
title:
permalink: /research/
gallery: true
---

<script>
// Add class to body to indicate sidebar is present
document.body.classList.add('has-sidebar');
</script>

<h2>Browse</h2>
{% include search_box.html search='main' %}

<div id="active-filters" class="mb-4" style="display: none;">
  <h5>Active Filters:</h5>
  <div id="filter-badges"></div>
  <button id="clear-all-filters" class="btn btn-sm btn-outline-secondary">Clear All</button>
</div>

{% include gallery.html collection='posts' facet_by='user_group|technology|challenges' num_column=3 %}

<script>
// Parse URL parameters and check corresponding boxes
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

  // Check if any filters are actually active
  function hasActiveFilters() {
    return $('.user-group:checked, .technology:checked, .challenges:checked').length > 0;
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

    // Check for user group filter
    if (params.usergroup) {
      $('#' + params.usergroup).prop('checked', true).change();
    }

    // Check for technology filter
    if (params.tech) {
      $('#' + params.tech).prop('checked', true).change();
    }

    // Check for challenge filter
    if (params.challenge) {
      $('#' + params.challenge).prop('checked', true).change();
    }

    // Update visibility after applying filters
    updateActiveFiltersVisibility();
  }

  // Add a filter badge to the active filters section
  function addFilterBadge(type, value) {
    // Create more compact badge without type label
    var displayValue = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    var badge = $('<span class="badge badge-pill badge-primary filter-badge">' +
                  displayValue +
                  ' <button type="button" class="close" aria-label="Remove">&times;</button></span>');

    // Add click handler to remove the filter
    badge.find('.close').on('click', function() {
      // Find and uncheck the corresponding checkbox
      if (type === 'User Group') {
        $('#' + value).prop('checked', false).change();
      } else if (type === 'Technology') {
        $('#' + value).prop('checked', false).change();
      } else if (type === 'challenge') {
        $('#' + value).prop('checked', false).change();
      }

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

    // Check all user group checkboxes
    var userGroups = [];
    $('.user_group:checked').each(function() {
      userGroups.push($(this).attr('id'));
    });
    if (userGroups.length > 0) {
      params.push('usergroup=' + userGroups[0]); // Using only the first one for simplicity
    }

    // Check all technology checkboxes
    var technologies = [];
    $('.technology:checked').each(function() {
      technologies.push($(this).attr('id'));
    });
    if (technologies.length > 0) {
      params.push('tech=' + technologies[0]);
    }

    // Check all challenge checkboxes
    var challenges = [];
    $('.challenges:checked').each(function() {
      challenges.push($(this).attr('id'));
    });
    if (challenges.length > 0) {
      params.push('challenge=' + challenges[0]);
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

    // Add badges for selected filters
    var hasFilters = false;

    // User Group filters
    $('.user_group:checked').each(function() {
      addFilterBadge('User Group', $(this).attr('id'));
      hasFilters = true;
    });

    // Technology filters
    $('.technology:checked').each(function() {
      addFilterBadge('Technology', $(this).attr('id'));
      hasFilters = true;
    });

    // challenge filters
    $('.challenges:checked').each(function() {
      addFilterBadge('challenge', $(this).attr('id'));
      hasFilters = true;
    });

    // Show/hide active filters section based on actual selections
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

    // Force hide and update visibility
    $('#active-filters').hide().removeClass('show');
    updateActiveFiltersVisibility();

    // Update URL
    history.pushState({}, '', window.location.pathname);

    // Refresh gallery to show all items
    if (typeof refreshGallery === 'function') {
      refreshGallery();
    }
  });

  // Apply URL filters on page load
  applyUrlFilters();
});
</script>
