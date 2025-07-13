FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev libpq-dev \
    nodejs npm && \
    docker-php-ext-install pdo pdo_pgsql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Prepare environment
RUN cp .env.production .env && \
    # TODO: adapter le fichier .env en fonction de l'environnement de déploiement
    sed -i 's/DB_HOST=127.0.0.1/DB_HOST=postgres/' .env

# Install PHP and JS dependencies and build assets
RUN composer install --no-interaction --prefer-dist && \
    npm install && npm run build && \
    php artisan key:generate --force

# Fix permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000 
# TODO: changer le port si le backend est derrière nginx ou un reverse proxy
# TODO: en production, utiliser php-fpm + nginx au lieu de php artisan serve
# TODO: en production, exécuter composer install --no-dev pour éviter les dépendances inutiles
ENTRYPOINT ["/entrypoint.sh"]