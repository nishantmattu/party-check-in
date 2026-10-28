"""
Local preview server that tells browsers never to cache, so edits to the
code or guest list show up on the next reload (including on an iPad).

Usage:
    python3 serve.py          # serves on port 8000
    python3 serve.py 8080     # or pick a port
"""

import http.server
import socketserver
import sys
from functools import partial
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = Path(__file__).resolve().parent


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
handler = partial(NoCacheHandler, directory=str(ROOT))

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Serving {ROOT} at http://localhost:{PORT} (no caching). Ctrl+C to stop.")
    httpd.serve_forever()
