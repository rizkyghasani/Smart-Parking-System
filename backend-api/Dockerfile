FROM php:8.2-fpm

# Install dependensi untuk PostgreSQL dan sistem
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Install dependensi Laravel
RUN composer install --no-interaction --optimize-autoloader

# Berikan izin akses folder storage & cache
RUN chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000 8080