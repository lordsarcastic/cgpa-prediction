from .base import BASE_DIR, produce_from_env

DATABASES = {
    'default': {
        'ENGINE': produce_from_env('DB_ENGINE'),
        'NAME': produce_from_env('DB_NAME'),
        'PORT': produce_from_env('DB_PORT'),
        'HOST': produce_from_env('DB_HOST'),
        'USER': produce_from_env('DB_USER'),
        'PASSWORD': produce_from_env('DB_PASSWORD')
    }
}
