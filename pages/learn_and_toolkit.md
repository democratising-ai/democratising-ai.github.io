---
layout: page
title:
permalink: /learn-and-toolkit/
gallery: true
---
<h3>Tools & Resources</h3>
<script>
document.body.classList.add('has-sidebar');
</script>
<script type="text/javascript" src="{{ '/assets/js/gallery-filters.js' | relative_url }}"></script>

{% include search_box.html search='main' %}

<div id="active-filters" class="mb-4" style="display: none;">
  <h5>Active Filters:</h5>
  <div id="filter-badges"></div>
  <button id="clear-all-filters" class="btn btn-sm btn-outline-secondary">Clear All</button>
</div>

{% include gallery.html
    collection='tools'
    facet_by='user_group|technology|challenges|experience'
    num_column=3
    exclude_type='news' %}
