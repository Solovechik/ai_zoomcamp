from pathlib import Path
import zipfile
import httpx
from minsearch import Index

# Constants
FASTMCP_ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
FASTMCP_ZIP_FILE = "fastmcp-main.zip"
ZIP_PREFIX = "fastmcp-main/"

# Module-level state for caching
_index = None
_documents = None


def download_fastmcp_zip() -> Path:
    """
    Download the FastMCP repository zip file if not already cached.

    Returns:
        Path to the downloaded zip file

    Raises:
        RuntimeError: If download fails or file is corrupted
    """
    zip_path = Path(FASTMCP_ZIP_FILE)

    # Check if already downloaded
    if zip_path.exists():
        print(f"Using cached zip file: {zip_path}")
        if zipfile.is_zipfile(zip_path):
            return zip_path
        else:
            print(f"Warning: Cached file {zip_path} is corrupted, re-downloading...")
            zip_path.unlink()

    # Download the zip file
    print(f"Downloading {FASTMCP_ZIP_URL}...")
    try:
        response = httpx.get(FASTMCP_ZIP_URL, timeout=30.0, follow_redirects=True)
        response.raise_for_status()

        # Write to file
        with open(zip_path, 'wb') as f:
            f.write(response.content)

        print(f"Downloaded {len(response.content):,} bytes to {zip_path}")

        # Validate it's a valid zip file
        if not zipfile.is_zipfile(zip_path):
            zip_path.unlink()
            raise RuntimeError(f"Downloaded file is not a valid zip file")

        return zip_path

    except httpx.TimeoutException as e:
        raise RuntimeError(f"Download timed out after 30 seconds: {e}")
    except httpx.HTTPStatusError as e:
        raise RuntimeError(f"HTTP error {e.response.status_code}: {e}")
    except httpx.RequestError as e:
        raise RuntimeError(f"Network error: {e}")
    except IOError as e:
        raise RuntimeError(f"Error writing file: {e}")


def extract_markdown_files(zip_path: Path) -> list[dict]:
    """
    Extract markdown (.md and .mdx) files from the zip archive.

    Args:
        zip_path: Path to the zip file

    Returns:
        List of dictionaries with 'filename' and 'content' keys

    Raises:
        RuntimeError: If zip file is corrupted or cannot be read
    """
    documents = []

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            # Get all filenames
            all_files = zf.namelist()

            # Filter for .md and .mdx files
            markdown_files = [f for f in all_files if f.endswith(('.md', '.mdx'))]

            print(f"Found {len(markdown_files)} markdown files out of {len(all_files)} total files")

            for filename in markdown_files:
                # Skip if it's just a directory
                if filename.endswith('/'):
                    continue

                # Remove the prefix (e.g., "fastmcp-main/")
                if filename.startswith(ZIP_PREFIX):
                    processed_filename = filename[len(ZIP_PREFIX):]
                else:
                    # If no prefix, use as-is
                    processed_filename = filename

                # Skip if processed filename is empty
                if not processed_filename:
                    continue

                try:
                    # Read file content
                    content = zf.read(filename).decode('utf-8')

                    documents.append({
                        'filename': processed_filename,
                        'content': content
                    })

                except UnicodeDecodeError:
                    # Try latin-1 as fallback
                    try:
                        content = zf.read(filename).decode('latin-1')
                        documents.append({
                            'filename': processed_filename,
                            'content': content
                        })
                    except Exception as e:
                        print(f"Warning: Skipping {filename} due to encoding error: {e}")
                        continue
                except Exception as e:
                    print(f"Warning: Error reading {filename}: {e}")
                    continue

            print(f"Successfully extracted {len(documents)} markdown files")
            return documents

    except zipfile.BadZipFile as e:
        raise RuntimeError(f"Corrupted zip file: {zip_path} - {e}")
    except Exception as e:
        raise RuntimeError(f"Error reading zip file: {e}")


def create_search_index(documents: list[dict]) -> Index:
    """
    Create a minsearch Index from the documents.

    Args:
        documents: List of dictionaries with 'filename' and 'content' keys

    Returns:
        Configured and fitted minsearch Index
    """
    print(f"Creating search index with {len(documents)} documents...")

    # Create index with content as text field and filename as keyword field
    index = Index(
        text_fields=["content"],
        keyword_fields=["filename"]
    )

    # Fit the index
    index.fit(documents)

    print("Search index created successfully")
    return index


def get_or_create_index() -> Index:
    """
    Get the cached index or create a new one if it doesn't exist.

    Returns:
        The search index
    """
    global _index, _documents

    if _index is None:
        print("Initializing search index...")

        # Download zip file
        zip_path = download_fastmcp_zip()

        # Extract markdown files
        _documents = extract_markdown_files(zip_path)

        # Create index
        _index = create_search_index(_documents)

        print("Index initialization complete")

    return _index


def search_docs(query: str, num_results: int = 5) -> list[dict]:
    """
    Search the FastMCP documentation.

    Args:
        query: Search query string
        num_results: Number of results to return (default: 5)

    Returns:
        List of documents with 'content' and 'filename', ordered by relevance
    """
    index = get_or_create_index()
    results = index.search(query, num_results=num_results)
    return results


def search_and_display(query: str, num_results: int = 5) -> None:
    """
    Search and display results in a formatted way.

    Args:
        query: Search query string
        num_results: Number of results to return (default: 5)
    """
    print(f"\nSearching for: '{query}'")
    print(f"{'='*80}\n")

    results = search_docs(query, num_results)

    if not results:
        print("No results found.")
        return

    print(f"Found {len(results)} result(s):\n")

    for i, doc in enumerate(results, 1):
        print(f"{'='*80}")
        print(f"Result {i}: {doc['filename']}")
        print(f"{'='*80}")

        # Display first 300 characters of content
        content_preview = doc['content'][:300].strip()
        print(content_preview)
        if len(doc['content']) > 300:
            print("...")
        print()


# Test functions

def test_download_zip():
    """Test the zip download functionality"""
    print("Testing download_fastmcp_zip()...")
    print(f"{'='*80}\n")

    try:
        zip_path = download_fastmcp_zip()

        # Verify file exists
        assert zip_path.exists(), "Zip file should exist"

        # Verify file size
        file_size = zip_path.stat().st_size
        assert file_size > 0, "Zip file should not be empty"

        # Verify it's a valid zip
        assert zipfile.is_zipfile(zip_path), "File should be a valid zip"

        print(f"✓ Zip file downloaded successfully")
        print(f"  - Path: {zip_path}")
        print(f"  - Size: {file_size:,} bytes")
        print(f"  - Valid zip: Yes")

        # Test caching (second call should use cached version)
        print("\nTesting cache...")
        zip_path2 = download_fastmcp_zip()
        assert zip_path == zip_path2, "Should return same path"
        print("✓ Cache working correctly")

        print(f"\n{'='*80}")
        print("✓ All download tests passed!")
        print(f"{'='*80}\n")

        return zip_path

    except Exception as e:
        print(f"✗ Error: {e}")
        raise


def test_extract_markdown_files():
    """Test markdown file extraction"""
    print("Testing extract_markdown_files()...")
    print(f"{'='*80}\n")

    try:
        # Download zip first
        zip_path = download_fastmcp_zip()

        # Extract markdown files
        documents = extract_markdown_files(zip_path)

        # Verify results
        assert len(documents) > 0, "Should extract at least one document"

        # Check structure
        for doc in documents:
            assert 'filename' in doc, "Each document should have 'filename'"
            assert 'content' in doc, "Each document should have 'content'"
            assert doc['filename'].endswith(('.md', '.mdx')), "Filename should end with .md or .mdx"
            assert not doc['filename'].startswith(ZIP_PREFIX), f"Filename should not start with {ZIP_PREFIX}"
            assert len(doc['content']) > 0, "Content should not be empty"

        print(f"✓ Successfully extracted {len(documents)} documents")
        print(f"\nDocument Statistics:")
        print(f"  - Total documents: {len(documents)}")

        # Calculate total content size
        total_size = sum(len(doc['content']) for doc in documents)
        print(f"  - Total content size: {total_size:,} characters")

        # Show sample filenames
        print(f"\nSample filenames:")
        for doc in documents[:5]:
            print(f"  - {doc['filename']}")
        if len(documents) > 5:
            print(f"  ... and {len(documents) - 5} more")

        print(f"\n{'='*80}")
        print("✓ All extraction tests passed!")
        print(f"{'='*80}\n")

        return documents

    except Exception as e:
        print(f"✗ Error: {e}")
        raise


def test_search_docs():
    """Test the search functionality"""
    print("Testing search_docs()...")
    print(f"{'='*80}\n")

    try:
        # Search for "getting started"
        query = "getting started"
        results = search_docs(query, num_results=5)

        # Verify results
        assert len(results) <= 5, "Should return at most 5 results"

        for result in results:
            assert 'filename' in result, "Each result should have 'filename'"
            assert 'content' in result, "Each result should have 'content'"

        print(f"✓ Search returned {len(results)} result(s) for '{query}'")

        # Display top 3 results
        print(f"\nTop 3 Results:")
        for i, doc in enumerate(results[:3], 1):
            print(f"\n{i}. {doc['filename']}")
            print(f"   Preview: {doc['content'][:100].strip()}...")

        # Test with a nonsense query
        print(f"\nTesting with nonsense query...")
        nonsense_results = search_docs("xyzabc123nonsense", num_results=5)
        print(f"✓ Nonsense query returned {len(nonsense_results)} result(s)")

        print(f"\n{'='*80}")
        print("✓ All search tests passed!")
        print(f"{'='*80}\n")

    except Exception as e:
        print(f"✗ Error: {e}")
        raise


def test_end_to_end():
    """Complete end-to-end test"""
    print("\n" + "="*80)
    print("RUNNING END-TO-END TEST")
    print("="*80 + "\n")

    try:
        # Test 1: Download
        print("Step 1: Download zip file")
        print("-" * 80)
        test_download_zip()

        # Test 2: Extract
        print("\nStep 2: Extract markdown files")
        print("-" * 80)
        documents = test_extract_markdown_files()

        # Test 3: Search
        print("\nStep 3: Test search functionality")
        print("-" * 80)
        test_search_docs()

        # Test 4: Multiple queries
        print("\nStep 4: Testing multiple search queries")
        print("-" * 80)

        test_queries = [
            "installation",
            "API reference",
            "examples",
            "configuration"
        ]

        for query in test_queries:
            print(f"\nQuery: '{query}'")
            results = search_docs(query, num_results=3)
            print(f"  - Found {len(results)} result(s)")
            if results:
                print(f"  - Top result: {results[0]['filename']}")

        # Final statistics
        print(f"\n{'='*80}")
        print("FINAL STATISTICS")
        print(f"{'='*80}")
        print(f"Total documents indexed: {len(documents)}")
        print(f"Total content size: {sum(len(d['content']) for d in documents):,} characters")
        print(f"Search index: Ready and operational")

        print(f"\n{'='*80}")
        print("✓ ALL TESTS PASSED!")
        print(f"{'='*80}\n")

    except Exception as e:
        print(f"\n{'='*80}")
        print(f"✗ TEST FAILED: {e}")
        print(f"{'='*80}\n")
        raise


if __name__ == "__main__":
    test_end_to_end()
