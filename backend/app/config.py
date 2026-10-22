import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-super-secret-key-for-dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./foodigo.db")

# Delivery config
TAX_RATE = 0.05
BASE_DELIVERY_FEE = 40
FREE_DELIVERY_ABOVE = 500
DEFAULT_ETA_MINUTES = 30

# MCP (connect your server here when ready)
MCP_ENABLED = False
MCP_URL = "https://YOUR-MCP-SERVER-URL/sse"
