import httpx

def scrape_page(url: str) -> str:
    """Scrape a web page using Jina Reader API and return markdown content"""
    jina_url = f"https://r.jina.ai/{url}"
    response = httpx.get(jina_url)
    response.raise_for_status()
    return response.text


def test_scrape_minsearch():
    """Test scraping the minsearch GitHub page"""
    url = "https://github.com/alexeygrigorev/minsearch"

    print(f"Testing scrape_page function...")
    print(f"URL: {url}\n")

    try:
        content = scrape_page(url)

        # Verify content was retrieved
        assert len(content) > 0, "Content should not be empty"
        assert "minsearch" in content.lower(), "Content should contain 'minsearch'"

        # Display statistics
        print("✓ Successfully scraped the page!")
        print(f"\nContent Statistics:")
        print(f"  - Total characters: {len(content):,}")
        print(f"  - Total lines: {len(content.splitlines()):,}")
        print(f"  - Total words (approx): {len(content.split()):,}")

        # Show preview
        print(f"\n{'='*80}")
        print("Content Preview (first 500 characters):")
        print(f"{'='*80}")
        print(content[:500])
        print("\n... (content continues) ...")

        # Check for key information
        print(f"\n{'='*80}")
        print("Content Verification:")
        print(f"{'='*80}")
        checks = {
            "Title contains 'minsearch'": "minsearch" in content.lower(),
            "Contains 'sklearn'": "sklearn" in content.lower(),
            "Contains 'pandas'": "pandas" in content.lower(),
            "Contains installation info": "pip install" in content.lower(),
            "Contains usage examples": "index" in content.lower(),
        }

        for check, passed in checks.items():
            status = "✓" if passed else "✗"
            print(f"  {status} {check}")

        all_passed = all(checks.values())
        print(f"\n{'='*80}")
        if all_passed:
            print("✓ All checks passed! The scraper is working correctly.")
        else:
            print("✗ Some checks failed. Please review the output.")
        print(f"{'='*80}")

        return content

    except Exception as e:
        print(f"✗ Error: {e}")
        raise


if __name__ == "__main__":
    test_scrape_minsearch()
