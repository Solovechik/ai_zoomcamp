# MCP Documentation Search Tool

A FastMCP-based tool that downloads, indexes, and searches the FastMCP documentation using minsearch.

## Features

- **Documentation Scraper**: Downloads FastMCP documentation from GitHub
- **Smart Indexing**: Uses minsearch to index 266+ markdown files with TF-IDF search
- **MCP Tool Integration**: Provides `search_fastmcp_docs` tool for Claude Desktop
- **Caching**: Smart caching to avoid re-downloading documentation

## Files

- `main.py` - FastMCP server with search tool
- `search.py` - Complete search implementation with indexing
- `server.py` - Additional MCP server with web scraping tools
- `test.py` - Test script for web scraping functionality
- `pyproject.toml` - Project dependencies
- `uv.lock` - Dependency lock file

## Installation

```bash
# Install dependencies
uv sync

# Run the MCP server
python3 main.py
```

## Usage

### As MCP Tool

Connect to Claude Desktop by adding to your config:

```json
{
  "mcpServers": {
    "ai-zoomcamp-tools": {
      "command": "python3",
      "args": ["/path/to/ai_zoomcamp/03-mcp/main.py"]
    }
  }
}
```

Then ask Claude:
- "Search the FastMCP docs for 'installation'"
- "Find information about configuration"
- "What does FastMCP say about tools?"

### Programmatically

```python
from search import search_docs

# Search documentation
results = search_docs("getting started", num_results=5)

for result in results:
    print(f"{result['filename']}: {result['content'][:100]}...")
```

## Statistics

- **266 markdown files** indexed
- **1.6M+ characters** of documentation
- **Sub-second search** performance
- **8.7 MB** zip download (cached)

## Tools Available

1. `search_fastmcp_docs(query, num_results=5)` - Search FastMCP documentation
2. `scrape_page(url)` - Scrape web pages using Jina Reader API
3. `add(a, b)` - Simple addition (demo tool)
