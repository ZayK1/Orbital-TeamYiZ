import os
import logging

import aiohttp

UNSPLASH_API = "https://api.unsplash.com/photos/random"
ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
HEADERS = {"Accept-Version": "v1", "Authorization": f"Client-ID {ACCESS_KEY}"} if ACCESS_KEY else {}

class UnsplashService:
    @staticmethod
    async def fetch_image(query: str) -> str:
        """Return a random image URL for a given query. Fallback to default image if API fails."""
        if not ACCESS_KEY:
            logging.warning("UNSPLASH_ACCESS_KEY not set; returning placeholder image")
            return "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d"

        params = {"query": query, "orientation": "squarish"}
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(UNSPLASH_API, headers=HEADERS, params=params, timeout=10) as resp:
                    if resp.status != 200:
                        raise ValueError(f"Unsplash API returned status {resp.status}")
                    data = await resp.json()
                    return data.get("urls", {}).get("regular") or data.get("urls", {}).get("small")
            except Exception as e:
                logging.error(f"Unsplash fetch failed: {e}")
                return "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d" 