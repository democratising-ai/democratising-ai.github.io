#!/usr/bin/env python3
"""
Zotero to Jekyll Posts Importer
Exports all papers ( with APA7 citation and abstract) and converts them to Jekyll posts
"""

import os
import sys
import json
import re
from datetime import datetime
from pathlib import Path
from pyzotero import zotero
from slugify import slugify

class ZoteroToJekyllImporter:
    def __init__(self):
        # Get credentials from environment
        self.library_id = os.environ.get('ZOTERO_USER_ID')
        self.api_key = os.environ.get('ZOTERO_API_KEY')
        self.library_type = os.environ.get('ZOTERO_LIBRARY_TYPE', 'user')

        if not self.library_id or not self.api_key:
            raise ValueError("ZOTERO_USER_ID and ZOTERO_API_KEY must be set")

        # Initialize Zotero connection
        self.zot = zotero.Zotero(self.library_id, self.library_type, self.api_key)

        # Create directories
        self.posts_dir = Path('_posts')
        self.posts_dir.mkdir(exist_ok=True)

        # Track processed items
        self.processed_file = Path('.github/processed_papers.json')
        self.processed_items = self.load_processed_items()

        # Stats tracking
        self.stats = {
            'total_found': 0,
            'already_processed': 0,
            'newly_imported': 0,
            'failed': 0
        }

    def load_processed_items(self):
        """Load list of already processed items"""
        if self.processed_file.exists():
            with open(self.processed_file, 'r') as f:
                return set(json.load(f))
        return set()

    def save_processed_items(self):
        """Save list of processed items"""
        self.processed_file.parent.mkdir(exist_ok=True)
        with open(self.processed_file, 'w') as f:
            json.dump(list(self.processed_items), f, indent=2)

    def fetch_all_papers(self):
        """Fetch ALL papers from Zotero library"""
        print(f"Fetching ALL papers from Zotero...")
        print(f"Library: {self.library_id} ({self.library_type})")

        all_items = []
        start = 0
        limit = 100  # Zotero API limit

        while True:
            print(f"  Fetching items {start} to {start + limit}...")
            try:
                batch = self.zot.items(start=start, limit=limit)
                if not batch:
                    break
                all_items.extend(batch)
                start += limit

                # Safety check to prevent infinite loops
                if start > 10000:
                    print("  Warning: Reached 10,000 items limit")
                    break

            except Exception as e:
                print(f"  Error fetching batch at {start}: {e}")
                break

        # Filter only actual papers (not notes, attachments, etc.)
        papers = [item for item in all_items
                 if item['data'].get('itemType') in [
                     'journalArticle', 'book', 'bookSection', 'conferencePaper',
                     'report', 'thesis', 'preprint', 'manuscript', 'document',
                     'webpage', 'blogPost', 'magazineArticle', 'newspaperArticle'
                 ]]

        print(f"Found {len(papers)} papers out of {len(all_items)} total items")
        self.stats['total_found'] = len(papers)

        # Filter out already processed items if SKIP_PROCESSED is true
        if os.environ.get('SKIP_PROCESSED', 'true').lower() == 'true':
            new_papers = [p for p in papers if p['key'] not in self.processed_items]
            self.stats['already_processed'] = len(papers) - len(new_papers)
            print(f"  {len(new_papers)} new papers to import")
            print(f"  {self.stats['already_processed']} already processed")
            return new_papers
        else:
            print("  Re-importing all papers (SKIP_PROCESSED=false)")
            return papers

    def format_apa7_citation(self, data):
        """Format citation in APA 7th edition style"""
        citation_parts = []

        # Authors
        creators = data.get('creators', [])
        authors = []
        for creator in creators:
            if creator.get('creatorType') == 'author':
                last = creator.get('lastName', '')
                first = creator.get('firstName', '')
                if last:
                    # Format: Last, F. M.
                    initials = ''.join([f"{n[0]}." for n in first.split() if n])
                    authors.append(f"{last}, {initials}" if initials else last)

        if authors:
            if len(authors) == 1:
                citation_parts.append(authors[0])
            elif len(authors) == 2:
                citation_parts.append(f"{authors[0]}, & {authors[1]}")
            elif len(authors) <= 20:
                citation_parts.append(f"{', '.join(authors[:-1])}, & {authors[-1]}")
            else:
                # For 21+ authors, list first 19, then ..., then last
                citation_parts.append(f"{', '.join(authors[:19])}, ... {authors[-1]}")

        # Year
        date = data.get('date', '')
        year = None
        if date:
            year_match = re.search(r'\d{4}', date)
            if year_match:
                year = year_match.group()
                citation_parts.append(f"({year})")

        # Title
        title = data.get('title', 'Untitled')
        item_type = data.get('itemType', '')

        # Italicize title for books, reports, webpages
        if item_type in ['book', 'report', 'thesis', 'webpage']:
            citation_parts.append(f"*{title}*")
        else:
            citation_parts.append(title)

        # Publication details based on type
        if item_type == 'journalArticle':
            if data.get('publicationTitle'):
                pub = f"*{data['publicationTitle']}*"
                if data.get('volume'):
                    pub += f", *{data['volume']}*"
                if data.get('issue'):
                    pub += f"({data['issue']})"
                if data.get('pages'):
                    pub += f", {data['pages']}"
                citation_parts.append(pub)

        elif item_type == 'book':
            if data.get('publisher'):
                citation_parts.append(data['publisher'])

        elif item_type == 'conferencePaper':
            if data.get('proceedingsTitle'):
                citation_parts.append(f"In *{data['proceedingsTitle']}*")
                if data.get('pages'):
                    citation_parts.append(f"(pp. {data['pages']})")
            if data.get('publisher'):
                citation_parts.append(data['publisher'])

        elif item_type == 'webpage' or item_type == 'blogPost':
            if data.get('websiteTitle'):
                citation_parts.append(f"*{data['websiteTitle']}*")

        # DOI or URL
        if data.get('DOI'):
            citation_parts.append(f"https://doi.org/{data['DOI']}")
        elif data.get('url'):
            citation_parts.append(data['url'])

        # Join parts
        citation = '. '.join([str(part) for part in citation_parts if part])
        if not citation.endswith('.'):
            citation += '.'

        return citation

    def generate_post_content(self, item):
        """Generate Jekyll post markdown with APA citation and abstract"""
        data = item.get('data', {})

        # Extract basic metadata
        title = data.get('title', 'Untitled')
        abstract = data.get('abstractNote', '')

        # Get year for frontmatter
        date = data.get('date', '')
        year = datetime.now().year
        if date:
            year_match = re.search(r'\d{4}', date)
            if year_match:
                year = int(year_match.group())

        # Generate APA7 citation
        apa_citation = self.format_apa7_citation(data)

        # Create YAML frontmatter
        escaped_title = title.replace('"', '\\"')

        frontmatter = "---\n"
        frontmatter += f'title: "{escaped_title}"\n'
        frontmatter += f"date: {datetime.now().strftime('%Y-%m-%d')}\n"
        frontmatter += f"year: {year}\n"
        frontmatter += "layout: post\n"

        # Add optional metadata
        if data.get('DOI'):
            frontmatter += f'doi: "{data["DOI"]}"\n'
        if data.get('url'):
            frontmatter += f'source_url: "{data["url"]}"\n'

        # Add citation metadata
        escaped_citation = apa_citation.replace('"', '\\"')
        frontmatter += f'citation: "{escaped_citation}"\n'

        frontmatter += "---\n\n"

        # Create content
        content = ""

        # Add Abstract section header
        content += "### Abstract\n\n"

        # Add abstract if available
        if abstract:
            content += f"{abstract}\n\n"
        else:
            content += "*No abstract available.*\n\n"

        # Add note about full paper
        content += "---\n\n"
        content += "*This post summarizes a research paper. "

        if data.get('DOI'):
            content += f"The full paper is [available here](https://doi.org/{data['DOI']}).*\n"
        elif data.get('url'):
            content += f"The full paper is [available here]({data['url']}).*\n"
        else:
            content += "Please refer to the original source for the complete paper.*\n"

        return frontmatter + content

    def create_post(self, item):
        """Create a Jekyll post from a Zotero item"""
        try:
            title = item['data'].get('title', 'Untitled')
            print(f"\n  Processing: {title[:60]}...")

            # Generate post content
            post_content = self.generate_post_content(item)

            # Generate filename
            date = datetime.now().strftime('%Y-%m-%d')
            slug = slugify(title)
            filename = f"{date}-{slug}.md"
            post_path = self.posts_dir / filename

            # Save post
            with open(post_path, 'w', encoding='utf-8') as f:
                f.write(post_content)

            print(f"    Created: {filename}")

            # Mark as processed
            self.processed_items.add(item['key'])
            self.stats['newly_imported'] += 1

            return True

        except Exception as e:
            print(f"    Error: {e}")
            self.stats['failed'] += 1
            return False

    def run(self):
        """Main execution"""
        print("=" * 60)
        print("Zotero to Jekyll Importer - APA7 Version")
        print("=" * 60)

        # Fetch all papers
        papers = self.fetch_all_papers()

        if not papers:
            print("\nNo new papers to import")
            return

        # Process each paper
        print(f"\nProcessing {len(papers)} papers...")
        for i, item in enumerate(papers, 1):
            print(f"\n[{i}/{len(papers)}]", end="")
            self.create_post(item)

        # Save processed items
        self.save_processed_items()

        # Print summary
        print("\n" + "=" * 60)
        print("Import Summary:")
        print(f"  Total papers found: {self.stats['total_found']}")
        print(f"  Already processed: {self.stats['already_processed']}")
        print(f"  Newly imported: {self.stats['newly_imported']}")
        print(f"  Failed: {self.stats['failed']}")
        print("=" * 60)

if __name__ == "__main__":
    try:
        importer = ZoteroToJekyllImporter()
        importer.run()
        sys.exit(0 if importer.stats['failed'] == 0 else 1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
