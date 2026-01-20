# Многостадийная сборка для production
FROM node:20-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package.json package-lock.json* ./

# Установка зависимостей (включая devDependencies для сборки)
# Используем npm install для обновления lock-файла с новыми зависимостями
RUN npm install

# Копирование исходного кода
COPY . .

# Принимаем переменную окружения для build time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Сборка production версии
RUN npm run build

# Production stage - используем nginx для раздачи статических файлов
FROM nginx:alpine

# Копирование собранных файлов в nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Копирование конфигурации nginx для SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 3000

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
