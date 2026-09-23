import os
from dotenv import load_dotenv
load_dotenv()
USE_MOCK = os.getenv("USE_MOCK") == "true"