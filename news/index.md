---
layout: page
title: News
permalink: /news/
---

<div class="news-container">
  <div class="row">
    {% for post in site.posts %}
      {% if post.type == "news" %}
        <div class="col-12 mb-3">
          <a href="{{ post.url | relative_url }}" class="news-card-link">
            <div class="card news-card">
              <div class="card-body">
                <h3 class="card-title">{{ post.title }}</h3>

                {% if post.excerpt %}
                  <p class="card-text">{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
                {% elsif post.content %}
                  <p class="card-text">{{ post.content | strip_html | truncatewords: 50 }}</p>
                {% endif %}

                <small class="news-date">{{ post.date | date: "%B %d, %Y" }}</small>
              </div>
            </div>
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>
