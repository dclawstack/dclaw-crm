from slowapi import Limiter
from slowapi.util import get_remote_address

# Single limiter instance shared across all routers.
# In production: swap storage= to a Redis backend for distributed rate limiting.
limiter = Limiter(key_func=get_remote_address)
