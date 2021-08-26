from .base import *
from .production import *


LOCAL_SETTINGS_FOUND = 'Local settings exists, overriding production settings'
LOCAL_SETTINGS_NOT_FOUND = 'Local settings not found, defaulting to production settings'

try:
    from .local import *
    print(LOCAL_SETTINGS_FOUND)
except:
    print(LOCAL_SETTINGS_NOT_FOUND)