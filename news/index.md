---
layout: page
title: News
permalink: /news/
---

<ul>
  {% for post in site.posts %}
    {% if post.type == "news" %}
      <li>
        <a href="{{ post.url }}">{{ post.title }}</a><br>
        <small>{{ post.date | date: "%B %d, %Y" }}</small>
      </li>
    {% endif %}
  {% endfor %}
</ul>
