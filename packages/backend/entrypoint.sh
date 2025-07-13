#!/bin/sh
# TODO: Ce script attend que PostgreSQL soit prêt avant d’exécuter les migrations

echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."

until nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "PostgreSQL is up – running migrations and starting Laravel..."

php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000