# import django_on_heroku
from os import environ
from pathlib import Path


def produce_from_env(value: str, default: any = None) -> any:
    return environ.get(value, default)


BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = 'django-insecure-1(xm8)reb=+gcc!c7k5cvkggw(6abmr^&z14=z9#_ztp2%qaxk'

DEBUG = True

ALLOWED_HOSTS = [
    produce_from_env('HOST'),
    'localhost'
]


INSTALLED_APPS = [
    # django stuff
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # custom apps
    'authentify.apps.AuthentifyConfig',
    'prediction.apps.PredictionConfig',

    # third-party apps
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]

AUTH_USER_MODEL = 'authentify.User'

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Africa/Algiers'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = '/static/'

STATIC_ROOT = BASE_DIR / 'static'

MEDIA_URL = '/media/'

MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# django_on_heroku.settings(locals())
