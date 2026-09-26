import httpx
from supabase import create_client, ClientOptions
from app import config

# HTTP/2のまま長く待つと接続が切れて500になることがあるので、HTTP/1.1で繋ぎ、失敗したら3回までやり直す
http = httpx.Client(http2=False, transport=httpx.HTTPTransport(retries=3), timeout=60)

supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY, options=ClientOptions(httpx_client=http))
