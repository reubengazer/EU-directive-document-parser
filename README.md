# EU-directive-document-parser

## Introduction

Parse all text in DIRECTIVES (EU) OF THE EUROPEAN PARLIAMENT AND OF THE COUNCIL documents.

For documents such as:
- https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790&from=EN
- https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32005L0060&from=EN
- https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366&from=EN
- https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32005L0060&from=EN#d1e1918-15-1

the ```EUDocParser()``` scrapes and parses all relevant text (including titles, headers, etc) into a structured tree (dictionary).

## Example Use

```
from EUDocParser import EUDocParser
my_input = 'eu_legal_doc.html'
my_output = 'eu_legal_doc.txt'

EUDocParser(my_input, my_output).parse()
```
