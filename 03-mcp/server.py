from fastmcp import FastMCP
import httpx

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool
def scrape_page(url: str) -> str:
    """Scrape a web page using Jina Reader API and return markdown content"""
    jina_url = f"https://r.jina.ai/{url}"
    response = httpx.get(jina_url)
    response.raise_for_status()
    return response.text

if __name__ == "__main__":
    mcp.run()
