from supabase import create_client, Client
from typing import Optional
from .config import get_settings

settings = get_settings()

# Supabase client for general operations
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# Service client for admin operations (only if service key is provided)
supabase_admin: Optional[Client] = None
if settings.supabase_service_key:
    supabase_admin = create_client(settings.supabase_url, settings.supabase_service_key)


def get_supabase() -> Client:
    """Get Supabase client dependency."""
    return supabase


def get_supabase_admin() -> Optional[Client]:
    """Get Supabase admin client dependency (may be None)."""
    return supabase_admin
