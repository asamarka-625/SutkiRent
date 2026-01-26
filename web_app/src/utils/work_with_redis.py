# Внешние зависимости
from typing import Optional, Dict, Any
import json
from datetime import datetime, date
import redis.asyncio as redis
# Внутренние модули
from web_app.src.core import cfg


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, date):
            return obj.isoformat()
        return super().default(obj)


class RedisService:
    def __init__(self):
        self.redis_url = cfg.REDIS_URL
        self.redis: Optional[redis.Redis] = None
        self.refresh_prefix = "refresh:"
        self.user_set_prefix = "user_tokens:"
        self.user_prefix = "user:"
        self.verification_prefix = "verification:"
        self.reset_prefix = "reset_password:"

    async def init_redis(self):
        """Инициализация подключения к Redis"""
        cfg.logger.info("Инициализируем соединение Redis")

        if not self.redis:
            self.redis = await redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )

    async def close_redis(self):
        """Закрытие подключения к Redis"""
        cfg.logger.info("Закрываем соединение Redis")

        if self.redis:
            await self.redis.close()

    async def add_user_refresh_token(
        self,
        user_id: str,
        refresh_uuid: str,
        data: str
    ):
        """Добавление токена и индексация его в сете пользователя"""
        token_key = f"{self.refresh_prefix}{user_id}:{refresh_uuid}"
        set_key = f"{self.user_set_prefix}{user_id}"

        async with self.redis.pipeline(transaction=True) as pipe:
            pipe.set(
                name=token_key,
                value=data,
                ex=cfg.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
            )
            pipe.sadd(set_key, refresh_uuid)
            # Устанавливаем TTL для всего сета (чуть больше токена, для очистки)
            pipe.expire(set_key, cfg.REFRESH_TOKEN_EXPIRE_MINUTES * 60 + 3600)
            await pipe.execute()

    async def update_user_refresh_token(
        self,
        user_id: str,
        refresh_uuid: str,
        data: str,
        last_token: str
    ):
        """Обновление токена и индексация его в сете пользователя"""
        old_token_key = f"{self.refresh_prefix}{user_id}:{last_token}"
        new_token_key = f"{self.refresh_prefix}{user_id}:{refresh_uuid}"
        set_key = f"{self.user_set_prefix}{user_id}"

        async with self.redis.pipeline(transaction=True) as pipe:
            pipe.expire(old_token_key, 30)
            pipe.set(
                name=new_token_key,
                value=data,
                ex=cfg.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
            )
            pipe.sadd(set_key, refresh_uuid)
            # Устанавливаем TTL для всего сета (чуть больше токена, для очистки)
            pipe.expire(set_key, cfg.REFRESH_TOKEN_EXPIRE_MINUTES * 60 + 3600)
            await pipe.execute()

    async def del_user_refresh_token(self, user_id: str, refresh_uuid: str):
        """Удаление конкретного токена"""
        token_key = f"{self.refresh_prefix}{user_id}:{refresh_uuid}"
        set_key = f"{self.user_set_prefix}{user_id}"

        async with self.redis.pipeline(transaction=True) as pipe:
            pipe.delete(token_key)
            pipe.srem(set_key, refresh_uuid)
            await pipe.execute()

    async def del_other_user_refresh_tokens(self, user_id: str, current_refresh_uuid: str):
        """Удаляем все сессии пользователя, кроме текущей"""
        set_key = f"{self.user_set_prefix}{user_id}"

        # Получаем все UUID сессий пользователя
        all_uuids = await self.redis.smembers(set_key)

        async with self.redis.pipeline(transaction=True) as pipe:
            for r_uuid in all_uuids:
                if r_uuid != current_refresh_uuid:
                    # Удаляем данные токена
                    pipe.delete(f"{self.refresh_prefix}{user_id}:{r_uuid}")
                    # Удаляем UUID из сета
                    pipe.srem(set_key, r_uuid)
            await pipe.execute()

    async def is_refresh_token_valid(self, user_id: str, refresh_uuid: str) -> bool:
        """Проверка валидности (есть ли UUID в сете и существует ли сам токен)"""
        token_key = f"{self.refresh_prefix}{user_id}:{refresh_uuid}"
        exists = await self.redis.exists(token_key)

        if not exists:
            await self.redis.srem(f"{self.user_set_prefix}{user_id}", refresh_uuid)
            return False
        return True

    async def add_user_data(
        self,
        user_id: str,
        data: dict
    ) -> None:
        """Добавление данных о пользователе"""
        await self.redis.set(
            name=f"{self.user_prefix}{user_id}",
            value=json.dumps(data, cls=CustomJSONEncoder),
            ex=cfg.USER_CACHE_MINUTES * 60
        )

    async def get_user_data(
        self,
        user_id: str
    ) -> Optional[Dict[str, str]]:
        """Получаем данные о пользователе"""
        data = await self.redis.get(f"{self.user_prefix}{user_id}")
        if data:
            return json.loads(data)

        return None

    async def delete_verification_data(self, email: str) -> bool:
        """Удаление всех данных о верификации одним вызовом"""
        try:
            keys = [
                f"{self.verification_prefix}code:{email}",
                f"{self.verification_prefix}attempts:{email}",
                f"{self.verification_prefix}data:{email}"
            ]
            result = await self.redis.delete(*keys)

            return result > 0

        except Exception as e:
            cfg.logger.error(f"Ошибка удаления данных верификации: {e}")
            return False

    async def save_verification_code(
        self,
        email: str,
        code: str,
        user_data: Dict[str, Any]
    ) -> bool:
        """Сохранение кода подтверждения и данных пользователя"""
        try:
            data_json = json.dumps(user_data, cls=CustomJSONEncoder)

            code_key = f"{self.verification_prefix}code:{email}"
            attempts_key = f"{self.verification_prefix}attempts:{email}"
            data_key = f"{self.verification_prefix}data:{email}"

            async with self.redis.pipeline(transaction=True) as pipe:
                pipe.setex(code_key, cfg.VERIFICATION_CODE_TTL, code)
                pipe.setex(attempts_key, cfg.VERIFICATION_CODE_TTL, "0")
                pipe.setex(data_key, cfg.VERIFICATION_CODE_TTL, data_json)

                await pipe.execute()
                return True

        except Exception as e:
            cfg.logger.error(f"Ошибка сохранения кода подтверждения: {e}")
            return False

    async def get_registration_data(
        self,
        email: str
    ) -> Optional[Dict[str, str]]:
        """Получаем данные о пользователе"""
        data = await self.redis.get(f"{self.verification_prefix}data:{email}")
        if data:
            return json.loads(data)

        return None

    async def verify_code(
        self,
        email: str,
        code: str
    ) -> tuple[bool, Optional[Dict[str, Any]], str]:
        """Проверка кода"""
        code_key = f"{self.verification_prefix}code:{email}"
        attempts_key = f"{self.verification_prefix}attempts:{email}"
        data_key = f"{self.verification_prefix}data:{email}"

        max_retries = 3
        retry_count = 0

        while retry_count < max_retries:
            try:
                async with self.redis.pipeline(transaction=True) as pipe:
                    try:
                        # Следим за ключами перед чтением
                        await pipe.watch(code_key, attempts_key, data_key)

                        saved_code = await pipe.get(code_key)
                        attempts_str = await pipe.get(attempts_key)
                        user_data_json = await pipe.get(data_key)

                        # Проверяем, что все данные существуют
                        if not all([saved_code, attempts_str, user_data_json]):
                            await pipe.unwatch()
                            return False, None, "Code not found or expired"

                        attempts = int(attempts_str)

                        # Проверка лимита попыток
                        if attempts >= 5:
                            pipe.delete(code_key, attempts_key, data_key)
                            await pipe.execute()
                            return False, None, "The number of attempts has been exceeded. Request a new code."

                        input_code = code.strip()

                        # Начинаем формировать транзакцию
                        pipe.multi()

                        # Сравниваем коды
                        if saved_code != input_code:
                            attempts += 1
                            pipe.setex(attempts_key, cfg.VERIFICATION_CODE_TTL, str(attempts))

                            if attempts >= 5:
                                pipe.delete(code_key, attempts_key, data_key)

                            await pipe.execute()

                            if attempts >= 5:
                                return False, None, "The number of attempts has been exceeded. Request a new code."
                            return False, None, f"Invalid code. Remaining attempts: {5 - attempts}"

                        pipe.delete(code_key, attempts_key, data_key)
                        await pipe.execute()

                        # Парсим данные пользователя
                        user_data = json.loads(user_data_json)
                        return True, user_data, "Code verified"

                    except redis.WatchError:
                        # Ключи были изменены другим процессом, повторяем
                        retry_count += 1
                        cfg.logger.warning(f"WatchError при проверке кода для {email}, попытка {retry_count}")
                        continue

            except json.JSONDecodeError:
                cfg.logger.error(f"Ошибка декодирования JSON для email: {email}")
                await self.delete_verification_data(email)
                return False, None, "Ошибка данных пользователя"

            except Exception as e:
                cfg.logger.error(f"Ошибка при проверке кода: {e}")
                return False, None, "Ошибка сервера"

        # Превышено количество попыток из-за конкурентности
        cfg.logger.error(f"Превышено количество retry при проверке кода для {email}")
        return False, None, "Too many simultaneous requests. Please try again."

    async def resend_verification_code(
        self,
        email: str,
        new_code: str
    ) -> bool:
        """Повторная отправка кода подтверждения"""
        try:
            code_key = f"{self.verification_prefix}code:{email}"
            attempts_key = f"{self.verification_prefix}attempts:{email}"
            data_key = f"{self.verification_prefix}data:{email}"

            if not await self.redis.exists(data_key):
                return False

            async with self.redis.pipeline(transaction=True) as pipe:
                pipe.setex(code_key, cfg.VERIFICATION_CODE_TTL, new_code)
                pipe.setex(attempts_key, cfg.VERIFICATION_CODE_TTL, "0")
                pipe.expire(data_key, cfg.VERIFICATION_CODE_TTL)

                await pipe.execute()
                return True

        except Exception as e:
            cfg.logger.error(f"Ошибка повторной отправки кода: {e}")
            return False

    async def add_reset_password_token(self, token: str, email: str):
        """Сохранение токена для смены пароля пользователя в Redis"""
        key = f"{self.reset_prefix}{token}"
        await self.redis.setex(
            key,
            24 * 3600,
            email
        )

    async def get_reset_password_token(self, token: str) -> Optional[int]:
        """Получение email по токену для смены пароля пользователя в Redis"""
        key = f"{self.reset_prefix}{token}"
        return await self.redis.get(key)

    async def del_reset_password_token(self, token: str) -> Optional[int]:
        """Удаление токена для смены пароля пользователя в Redis"""
        key = f"{self.reset_prefix}{token}"
        await self.redis.delete(key)

    async def get_info(self) -> dict:
        """Информация redis"""
        return {
            "memory_usage": await self.redis.info('memory')
        }


_instance = None


def get_redis_service() -> RedisService:
    global _instance
    if _instance is None:
        _instance = RedisService()

    return _instance