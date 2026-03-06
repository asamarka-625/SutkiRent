#!/bin/sh
set -e  # Прерывать выполнение при ошибке

# Проверка обязательных переменных
for var in POSTGRES_USER POSTGRES_DB YANDEX_DISK_USER YANDEX_DISK_PASS; do
    if [ -z "$(eval echo \$$var)" ]; then
        echo ">>> ERROR: Variable $var is not set!"
        exit 1
    fi
done

DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="backup-$DATE.sql.gz"
BACKUP_DIR="/backup"
REMOTE_PATH="/backup/$FILENAME"

echo ">>> [$(date)] Creating dump of database: ${POSTGRES_DB}..."

# Создание дампа
if ! pg_dump -h db -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "${BACKUP_DIR}/${FILENAME}"; then
    echo ">>> [$(date)] ERROR: Dump failed!"
    exit 1
fi

# Проверка размера дампа
if [ ! -s "${BACKUP_DIR}/${FILENAME}" ]; then
    echo ">>> [$(date)] ERROR: Dump is empty!"
    exit 1
fi

echo ">>> [$(date)] Dump created: $FILENAME ($(du -h ${BACKUP_DIR}/${FILENAME} | cut -f1))"

# Проверка доступности WebDAV и создание папки backup если нужно
echo ">>> [$(date)] Checking Yandex.Disk connection..."
if ! curl -s --head --fail --user "${YANDEX_DISK_USER}:${YANDEX_DISK_PASS}" https://webdav.yandex.ru/backup/ > /dev/null; then
    echo ">>> [$(date)] Creating backup directory on Yandex.Disk..."
    curl -s -X MKCOL --user "${YANDEX_DISK_USER}:${YANDEX_DISK_PASS}" https://webdav.yandex.ru/backup/
fi

# Загрузка на Яндекс.Диск
echo ">>> [$(date)] Uploading to Yandex.Disk..."
if curl -s -T "${BACKUP_DIR}/${FILENAME}" \
     --user "${YANDEX_DISK_USER}:${YANDEX_DISK_PASS}" \
     --fail \
     -H "Expect:" \
     "https://webdav.yandex.ru/backup/${FILENAME}"; then
    echo ">>> [$(date)] SUCCESS: File uploaded to Yandex.Disk"

    # 1. Удаление старых локальных бэкапов
    find ${BACKUP_DIR} -type f -name "backup-*.sql.gz" -mtime +7 -delete
    echo ">>> [$(date)] Old local backups cleaned up"

    # 2. Удаление старых бэкапов на Яндекс.Диске
    echo ">>> [$(date)] Cleaning up old remote backups (older than 7 days)..."

    # Получаем список файлов
    curl -s -X PROPFIND --user "elkined@yandex.ru:yeirhzvrjgokgyfv" -H "Depth: 1" "https://webdav.yandex.ru/backup/" | \
    grep -o "/backup/[^<]*\.sql\.gz" | \
    sed 's/\/backup\///g' | \
    while read FILE; do
        # Извлекаем дату (первые 10 символов после "backup-")
        FILE_DATE=$(echo "$FILE" | cut -d'-' -f2- | cut -d'_' -f1)

        if [ ! -z "$FILE_DATE" ]; then
            # Конвертируем в timestamp для сравнения
            FILE_TIMESTAMP=$(date -d "$FILE_DATE" +%s 2>/dev/null)
            CURRENT_TIMESTAMP=$(date +%s)
            DAYS_OLD=$(( (CURRENT_TIMESTAMP - FILE_TIMESTAMP) / 86400 ))

            if [ "$DAYS_OLD" -gt 7 ]; then
                echo ">>> Deleting old remote backup: $FILE ($DAYS_OLD days old)"
                curl -s -X DELETE \
                     --user "${YANDEX_DISK_USER}:${YANDEX_DISK_PASS}" \
                     "https://webdav.yandex.ru/backup/${FILE}"

                if [ $? -eq 0 ]; then
                    echo ">>> Deleted: $FILE"
                else
                    echo ">>> Failed to delete: $FILE"
                fi
            fi
        fi
    done

    echo ">>> [$(date)] Remote cleanup completed"

else
    echo ">>> [$(date)] ERROR: Upload failed!"
    exit 1
fi

echo ">>> [$(date)] Backup completed successfully"