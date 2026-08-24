import os
import sys

# Append backend directory to sys.path so app.main is importable from project root
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.main import app

# This file serves as the entrypoint for Vercel Serverless Functions.
# Vercel's @vercel/python builder will look for the `app` object here.
