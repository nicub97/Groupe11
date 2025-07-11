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

# Prepare environment
RUN cp .env.example .env && \
    sed -i 's/DB_HOST=127.0.0.1/DB_HOST=postgres/' .env

# Install PHP and JS dependencies and build assets
RUN composer install --no-interaction --prefer-dist && \
    npm install && npm run build && \
    php artisan key:generate --force

# Fix permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000
CMD php artisan migrate --seed && php artisan serve --host=0.0.0.0 --port=8000
