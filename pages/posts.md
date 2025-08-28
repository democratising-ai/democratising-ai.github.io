---
layout: page
title:
permalink: /posts/
gallery: true
---

<script>
document.body.classList.add('has-sidebar');
</script>

<script type="text/javascript" src="{{ '/assets/js/gallery-filters.js' | relative_url }}"></script>

<h2>Browse</h2>
{% include search_box.html search='main' %}

<div id="active-filters" class="mb-4" style="display: none;">
  <h5>Active Filters:</h5>
  <div id="filter-badges"></div>
  <button id="clear-all-filters" class="btn btn-sm btn-outline-secondary">Clear All</button>
</div>

{% include gallery.html
    collection='posts'
    facet_by='user_group|technology|challenges'
    num_column=3
    exclude_type='news' %}

