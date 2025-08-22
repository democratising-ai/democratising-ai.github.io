# Democratising AI

A Jekyll-based blog and resource platform exploring AI, technology, and society with a focus on making AI accessible and understandable for educators, parents, and students.

## About

This site explores the intersection of AI and education, providing resources and insights for:

- **Educators** integrating AI into teaching and curriculum
- **Parents** navigating AI tools in family life
- **Students** growing up surrounded by intelligent systems

## Features

- **Faceted Browsing**: Filter articles by user groups, technologies, and challenges
- **Search Functionality**: Full-text search across all content
- **Interactive Galleries**: Browse content with advanced filtering options

## Technology Stack

- **Jekyll**: Static site generator
- **Wax-Facets**: Custom theme for faceted browsing
- **Bootstrap 4**: Responsive CSS framework
- **GitHub Pages**: Hosting platform

## Content Structure

The site organizes content around three main facets:

#### User Groups

- Educators
- Parents
- Students

#### Technologies

#### challenges

## Adding Content

### Blog Posts

Create new posts in the `_posts/` directory following the naming convention:

```
YYYY-MM-DD-title.md
```

Each post should include frontmatter with facet classifications:

```yaml
---
title: "Your Post Title"
author: "Author Name"
year: 2025
layout: post
challenges:
  - challange1
  - challange2
technology:
  - technology1
  - technology2
user_group:
  - educators
  - parents
  - students
---
Your content here...
```

### Pages

Add new pages to the `_pages/` directory and update the navigation menu in `_config.yml`.

## Configuration

Key configuration files:

- `_config.yml`: Site settings and navigation
- `_data/facets.yml`: Facet definitions for browsing
- `_data/wax.yml`: Search configuration

## Deployment

The site is automatically deployed via GitHub Pages when changes are pushed to the main branch.

**Live Site**: [https://uts-cic.github.io](https://uts-cic.github.io)

## License

This project is open source. See LICENSE.txt for details.

## Contributing

Contributions are welcome! Please feel free to submit challenges or pull requests.

## Contact

For questions or collaboration opportunities, please reach out through the About page or GitHub challenges.

---

_Built with Jekyll and Wax-Facets theme_
