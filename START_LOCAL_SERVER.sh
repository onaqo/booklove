#!/bin/bash

# Book Loop Book - Local Development Server
# This script starts a local web server so you can test the site properly

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║              🚀 Starting Book Loop Book Local Server                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📂 Server Directory: $(pwd)"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found"
    echo ""
    echo "🌐 Starting server on: http://localhost:8000"
    echo ""
    echo "📋 To test your cart:"
    echo "   1. Open: http://localhost:8000"
    echo "   2. Click 'Add to Cart' on any product"
    echo "   3. Check browser console (F12) for logs"
    echo "   4. Sidebar cart should open with products"
    echo ""
    echo "⚠️  Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Start Python HTTP server
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "✓ Python found"
    echo ""
    echo "🌐 Starting server on: http://localhost:8000"
    echo ""
    echo "📋 To test your cart:"
    echo "   1. Open: http://localhost:8000"
    echo "   2. Click 'Add to Cart' on any product"
    echo "   3. Check browser console (F12) for logs"
    echo "   4. Sidebar cart should open with products"
    echo ""
    echo "⚠️  Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Start Python 2 HTTP server
    python -m SimpleHTTPServer 8000
    
else
    echo "❌ Python not found!"
    echo ""
    echo "Please install Python to run a local server:"
    echo "  Mac: brew install python3"
    echo "  Or download from: https://www.python.org/downloads/"
    echo ""
    echo "Alternative: Use 'npx serve' if you have Node.js installed"
    exit 1
fi
