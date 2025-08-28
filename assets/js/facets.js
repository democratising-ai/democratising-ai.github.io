$(document).ready(function () {
    // Toggle facet expansion when clicking the header
    $(".facet-bn").click(function (event) {
        event.preventDefault();

        var fieldset = $(this).closest('fieldset');
        var collapseElement = fieldset.find('.collapse');
        var chevron = $(this).find('.facets-chevron');

        // Use Bootstrap's collapse methods
        collapseElement.collapse('toggle');

        // Update chevron state
        collapseElement.on('shown.bs.collapse', function () {
            chevron.removeClass('facets-chevron-bottom').addClass('facets-chevron-top');
            fieldset.addClass("active");
        });

        collapseElement.on('hidden.bs.collapse', function () {
            chevron.removeClass('facets-chevron-top').addClass('facets-chevron-bottom');
            fieldset.removeClass("active");
        });
    });

    // Facet filtering functionality
    var facets = {};
    var setIds = [];

    // Collect all fieldset IDs
    $("fieldset").each(function (i, e) {
        setIds.push(e.id);
    });

    var numberFacets = setIds.length;

    // Initialize facets object with empty arrays
    for (var i = 0; i < numberFacets; i++) {
        facets[setIds[i]] = [];
    }

    // Handle checkbox changes
    $("#facets :checkbox").change(function () {
        // Use data-facet attribute instead of class
        var facetName = $(this).data('facet') || $(this).attr('data-facet');
        var fieldsetId = facetName + "-set";

        // Get the checkbox ID
        var valueId = this.id;

        // Update facets object based on checkbox state
        if (this.checked) {
            if (!facets[fieldsetId]) {
                facets[fieldsetId] = [];
            }
            facets[fieldsetId].push(valueId);
        } else {
            if (facets[fieldsetId]) {
                facets[fieldsetId] = facets[fieldsetId].filter(function (value) {
                    return value != valueId;
                });
            }
        }

        // Apply filters
        refreshGallery();

        // Update available options in other facets
        updateAvailableFacets();
    });

    function refreshGallery() {
        // Check if we have any active filters
        var anyActiveFilters = false;
        for (var i = 0; i < numberFacets; i++) {
            if (facets[setIds[i]] && facets[setIds[i]].length > 0) {
                anyActiveFilters = true;
                break;
            }
        }

        // Get all gallery items
        var allItems = $(".gallery-item-facets");

        // If no active filters, show all items
        if (!anyActiveFilters) {
            allItems.show();
            return;
        }

        // Start by hiding all items
        allItems.hide();

        // Loop through each gallery item
        allItems.each(function() {
            var item = $(this);
            var shouldShow = true;

            // Check this item against each facet type
            for (var i = 0; i < numberFacets; i++) {
                var facetId = setIds[i];

                // Skip facets with no active filters
                if (!facets[facetId] || facets[facetId].length === 0) {
                    continue;
                }

                // For this facet type, check if the item matches ANY of the selected values
                var matchesAnyValue = false;
                var itemClasses = item.attr('class');

                for (var j = 0; j < facets[facetId].length; j++) {
                    var facetValue = facets[facetId][j];
                    // Check if the item has this class
                    if (itemClasses.indexOf(facetValue) !== -1 &&
                        // Make sure it's a full word, not part of another word
                        (itemClasses.indexOf(facetValue + ' ') !== -1 ||
                         itemClasses.indexOf(' ' + facetValue) !== -1 ||
                         itemClasses === facetValue)) {
                        matchesAnyValue = true;
                        break;
                    }
                }

                // If this item doesn't match any selected value for this facet type,
                // then don't show the item
                if (!matchesAnyValue) {
                    shouldShow = false;
                    break;
                }
            }

            // Show or hide based on our determination
            if (shouldShow) {
                item.show();
            }
        });
    }

    // Function to update available facet options based on currently visible items
    function updateAvailableFacets() {
        // Get all currently visible items
        var visibleItems = $(".gallery-item-facets:visible");

        // Create sets of available values for each facet
        var availableValues = {};

        // Initialize with empty sets for each facet
        setIds.forEach(function(facetId) {
            var facetName = facetId.replace('-set', '');
            availableValues[facetName] = new Set();
        });

        // Collect available values from visible items
        visibleItems.each(function() {
            var item = $(this);

            // For each facet type, collect available values
            setIds.forEach(function(facetId) {
                var facetName = facetId.replace('-set', '');
                var values = item.data(facetName);

                if (values) {
                    // Handle both string and array values
                    if (typeof values === 'string') {
                        values.split(' ').forEach(function(value) {
                            if (value) {
                                availableValues[facetName].add(value);
                            }
                        });
                    }
                }
            });
        });

        // Update checkboxes appearance
        $("#facets input[type='checkbox']").each(function() {
            var checkbox = $(this);
            var value = checkbox.attr('id');
            var facetName = checkbox.data('facet') || checkbox.attr('data-facet');
            var isCurrentlySelected = checkbox.prop('checked');

            // Don't disable selected checkboxes
            if (isCurrentlySelected) {
                checkbox.prop('disabled', false);
                checkbox.parent().removeClass('facet-disabled');
                return;
            }

            // Check if this value is available
            if (availableValues[facetName] && availableValues[facetName].has(value)) {
                // Value is available
                checkbox.prop('disabled', false);
                checkbox.parent().removeClass('facet-disabled');

                // Update the count if possible
                var count = countVisibleItemsWithFacet(facetName, value);
                checkbox.next().find('.facet-count').text('(' + count + ')');
            } else {
                // Value is not available
                checkbox.prop('disabled', true);
                checkbox.parent().addClass('facet-disabled');

                // Set count to 0
                checkbox.next().find('.facet-count').text('(0)');
            }
        });
    }

    // Helper function to count visible items with a specific facet value
    function countVisibleItemsWithFacet(facetName, value) {
        var count = 0;
        var visibleItems = $(".gallery-item-facets:visible");

        visibleItems.each(function() {
            var item = $(this);
            var values = item.data(facetName);

            if (values) {
                // Handle both string and array values
                var valueArray = typeof values === 'string' ? values.split(' ') : values;
                if (valueArray.includes(value)) {
                    count++;
                }
            }
        });

        return count;
    }

    // Initial filtering (in case of URL parameters)
    refreshGallery();
    updateAvailableFacets();
});
