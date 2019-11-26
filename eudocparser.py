# Flawless Money Parser
# Written by: Reuben Gazer (2019)

# HOW TO RUN DocParser:
# - make an instance of DocParser(), with the input path of the .html and output path of the parsed .txt document.
# - execute the ".parse()" method
# - this automatically writes out a DICTIONARY of all of the content
# - the dictionary always contains, at the highest level, "doc_title" and "doc_top_text"
# - below this is the real content

# WHAT IS HAPPENING?
# - DocParser() creates an empty tree structure of the table of contents as a dictionary
# - other than the top text, the only real text is under each ARTICLE
# - thus, initially, each article in the dictionary has a 'body' key with NOTHING in it
# Then, DocParser() searches for each article element one by one in the .html, and "steps" to each next element
# looking for text. It puts this text into the dictionary where appropriate, and stops when it reaches another header
# (ie. the end of the article - if it runs into another article, chapter, section, title, whatever).

from bs4 import BeautifulSoup
import re

class DocParser:

    def __init__(self, html_path: str, out_path='./content-tree.txt'):
        self.html_path = html_path
        self.out_path = out_path # where are we saving the final tree?
        self.toc_items = self.get_TOC_items()
        self.body_items = self.get_BODY_items()
        self.toc_tree = {}

    def request_doc(self):
        get_file = f'{self.html_path}'
        with open(get_file, "r") as f:
            contents = f.read()
            return BeautifulSoup(contents, 'html.parser')

    def get_TOC_items(self):
        """
        Return a list of elements that represent the table of contents (TOC).
        Essentially, we use this to create an empty dictionary (tree) with all of the
        TITLE, CHAPTER, SECTION and ARTICLE headings, with empty 'body' keys for each
        of the articles.
        """
        soup = self.request_doc()
        soup = soup.find('ul', {"id": 'TOC_docHtml'})
        soup = soup.findAll('li')
        return soup

    def get_BODY_items(self):
        """Return a list of elements that represent the true content of the document."""
        soup = self.request_doc()
        soup = soup.body.find('div', {"id": 'docHtml'})
        return soup

    def get_title(self) -> str:
        """Return the string of all bolded title text at the top of the page."""
        soup = self.request_doc()
        soup = soup.findAll('p', {'class': 'doc-ti'})
        title_text = ''
        for text in [item.text for item in soup]:
            title_text += text
        title_text = title_text.replace('\n', ' ')
        # Elements with class='doc-ti' are the appropriate title elements AND the Annex Section.
        # Just remove the final ANNEX text!
        title_text = title_text.split('ANNEX')[0]
        return title_text

    def get_top_text(self) -> str:
        """Return the text between the document title and the first TITLE or CHAPTER."""
        top_text = ''
        """Get the content of a given article, given the HTML element."""
        content = ''
        # All articles have "Text with EEA relevance" at the end of the title, before the top text.
        # This is used as the anchor for where to start parsing the top text.
        pattern = re.compile('Text with EEA relevance')
        current_element = self.body_items.find(text=pattern, attrs={'doc-ti'}).next_sibling.next_sibling
        while True:
            if current_element == '\n':
                current_element = current_element.next_sibling
            elif current_element.name == 'p':
                if current_element['class'][0] == 'normal':
                    content += current_element.text
                    current_element = current_element.next_sibling
                elif current_element['class'][0] in ['ti-art', 'ti-section-1', 'ti-section-2']:
                    break
            elif current_element.name == 'table':
                children = current_element.findChildren('p')
                for child in children:
                    content += child.text
                current_element = current_element.next_sibling

        # Clean the content.
        content = self.clean_content(content)

        return content

    def clean_content(self, content):
        """Remove weird characters from body content."""
        content = content.replace('\xa0', ' ').replace('\n', '').replace('\t', '').replace('.', '. ')
        return content

    def get_cleaned_string(self, item, item_type: str):
        """
        Return a cleaned string of a title, chapter or section.

        Parameters:
        ----------
        item : html element
        item_type : str
            - one of : ['title', 'chapter', 'section']
        """
        if 'Article' in item:
            if item_type == 'title':
                return item.split('Article')[0]
            else:
                string = item.split('Article')[0].split('-')
                return string[0].strip() + ' - ' + string[1].strip()
        else:
            if item_type == 'title':
                return item
            else:
                item = item.split('-')
                return item[0].strip() + ' - ' + item[1].strip()

    def add_item_to_tree(self, item, item_type: str, current_title=None, current_chapter=None, current_section=None):
        """
        Add an item to the tree in the correct place.
        This is used to create the tree before filling with body content.
        By "add item", we don't mean adding the actual content - just adding items to create the empty tree.

        Parameters:
        ----------
        item : html element
        item_type: str
            - one of: ['title', 'chapter', 'section']
        current_title : str
            - which title we are under in the tree
        current_chapter : str
            - which chapter we are under in the tree
        current_section : str
            - which section we are under in the tree
        """
        if item_type == 'title':
            self.toc_tree[current_title] = {}
            tree_position = self.toc_tree[current_title]
        elif item_type == 'chapter':
            if current_title:
                self.toc_tree[current_title][current_chapter] = {}
                tree_position = self.toc_tree[current_title][current_chapter]
            else:
                self.toc_tree[current_chapter] = {}
                tree_position = self.toc_tree[current_chapter]
        elif item_type == 'section':
            if current_title:
                self.toc_tree[current_title][current_chapter][current_section] = {}
                tree_position = self.toc_tree[current_title][current_chapter][current_section]
            else:
                self.toc_tree[current_chapter][current_section] = {}
                tree_position = self.toc_tree[current_chapter][current_section]

        if "Article" in item:
            articles = [('Article' + value).strip() for value in item.split('Article')[1:]]
            articles = [self.clean_content(article) for article in articles]
            tree_position['articles'] = {}
            for article in articles:
                tree_position['articles'][article] = {'body': ''}

    def construct_toc_tree(self):
        """Construct the empty table of contents (TOC) tree."""

        items = [item.text for item in self.toc_items]
        current_title = None # this is set for documents without titles.

        # Initial entries are the document title and top text.
        self.toc_tree['doc_title'] = self.get_title()
        self.toc_tree['doc_top_text'] = self.get_top_text()

        # Construct the hierarchy of TITLES, CHAPTERS, SECTIONS.
        for item in items:

            if "title" in item.lower():
                # Create new title entry.
                current_title = self.get_cleaned_string(item, item_type='title')
                current_title = self.clean_content(current_title)
                self.add_item_to_tree(item, item_type='title', current_title=current_title)

            if "chapter" in item.lower():
                # Create new chapter entry.
                current_chapter = self.get_cleaned_string(item, item_type='chapter')
                current_chapter = self.clean_content(current_chapter)
                self.add_item_to_tree(item, item_type='chapter', current_title=current_title,
                                 current_chapter=current_chapter)

            if "section" in item.lower():
                # Create new section entry.
                current_section = self.get_cleaned_string(item, item_type='section')
                current_section = self.clean_content(current_section)
                self.add_item_to_tree(item, item_type='section', current_title=current_title,
                                 current_chapter=current_chapter, current_section=current_section)

    def get_article_body(self, article_element) -> str:
        """Get the content of a given article, given the HTML element."""
        content = ''
        current_element = article_element.next_sibling.next_sibling.next_sibling.next_sibling
        while True:
            if current_element == '\n':
                current_element = current_element.next_sibling
            elif current_element.name == 'div':
                try:
                    if current_element['class'][0] == 'final':
                        break
                except KeyError:
                    # this is specifically for Article 110 in psd2 (a random div element)
                    children = current_element.findChildren('p')
                    for child in children:
                        content += child.text
                    current_element = current_element.next_sibling

            elif current_element.name == 'p':
                if current_element['class'][0] == 'normal':
                    content += current_element.text
                    current_element = current_element.next_sibling
                elif current_element['class'][0] in ['ti-art', 'ti-section-1', 'ti-section-2']:
                    break
            elif current_element.name == 'table':
                children = current_element.findChildren('p')
                for child in children:
                    content += child.text
                current_element = current_element.next_sibling

        # Clean the content.
        content = self.clean_content(content)

        return content

    def get_article_path(self, article_name: str) -> tuple:
        """Get the path to a given article in the TOC tree."""
        for key1 in self.toc_tree.keys():
            if key1 != 'doc_title' and key1 != 'doc_top_text':
                for key2 in self.toc_tree[key1]:
                    if article_name in key2:
                        return (key1, key2)
                    for key3 in self.toc_tree[key1][key2]:
                        if article_name in key3:
                            return (key1, key2, key3)
                        for key4 in self.toc_tree[key1][key2][key3]:
                            if article_name in key4:
                                return (key1, key2, key3, key4)
                            for key5 in self.toc_tree[key1][key2][key3][key4]:
                                if article_name in key5:
                                    return (key1, key2, key3, key4, key5)

    def add_article_body_to_tree(self, article_content: str, place_tuple: tuple):
        """
        Add the content of the article to the tree.
        Place_tuple is a tuple of ordered dictionary keys to the article.

        Parameters:
        ----------
        article_content : str
        place_tuple : tuple

        """
        if len(place_tuple) == 3:
            self.toc_tree[place_tuple[0]][place_tuple[1]][place_tuple[2]]['body'] = article_content
        elif len(place_tuple) == 4:
            self.toc_tree[place_tuple[0]][place_tuple[1]][place_tuple[2]][place_tuple[3]]['body'] = article_content
        elif len(place_tuple) == 5:
            self.toc_tree[place_tuple[0]][place_tuple[1]][place_tuple[2]][place_tuple[3]][place_tuple[4]][
                'body'] = article_content
        elif len(place_tuple) == 6:
            self.toc_tree[place_tuple[0]][place_tuple[1]][place_tuple[2]][place_tuple[3]][place_tuple[4]][place_tuple[5]][
                'body'] = article_content

    def fill_toc_tree(self):
        """Get content of all articles and fill the tree."""

        pattern = re.compile('Article')
        article_elements = self.body_items.findAll(text=pattern, attrs={'ti-art'})

        for j, article_element in enumerate(article_elements):
            place_in_tree = self.get_article_path(self.clean_content(article_element.text))
            article_content = self.get_article_body(article_element)
            self.add_article_body_to_tree(article_content, place_in_tree)

    def write_tree_out(self):
        """Write out the tree of contents to file."""
        with open(self.out_path, 'w') as f:
            f.write(str(self.toc_tree))
            f.close()

    def parse(self):
        """
        Do the parsing and write out to file.
        This is the main method that will perform all actions at once.
        """
        self.construct_toc_tree()
        self.fill_toc_tree()
        self.write_tree_out()
