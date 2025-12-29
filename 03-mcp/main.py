from fastmcp import FastMCP
from search import search_docs

mcp = FastMCP("AI Zoomcamp Tools")


@mcp.tool
def search_fastmcp_docs(query: str, num_results: int = 5) -> list[dict]:
    """
    Search the FastMCP documentation for relevant information.

    Args:
        query: The search query string
        num_results: Number of results to return (default: 5)

    Returns:
        List of documents with 'filename' and 'content' fields, ordered by relevance
    """
    return search_docs(query, num_results=num_results)


if __name__ == "__main__":
    mcp.run()
