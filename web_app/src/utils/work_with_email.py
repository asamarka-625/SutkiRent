# Внешние зависимости
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
# Внутренние модули
from web_app.src.core import cfg


class EmailService:
    def __init__(self):
        self.smtp_host = cfg.SMTP_HOST
        self.smtp_port = cfg.SMTP_PORT
        self.smtp_username = cfg.SMTP_USERNAME
        self.smtp_password = cfg.SMTP_PASSWORD
        self.from_email = cfg.FROM_EMAIL

    async def send_verification_email(self, email: str, code: str) -> bool:
        """Отправка email с кодом подтверждения"""

        # Создаем HTML и текстовую версии письма
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .code {{ font-size: 32px; font-weight: bold; letter-spacing: 5px; 
                        text-align: center; margin: 30px 0; color: #4CAF50; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Подтверждение регистрации</h1>
                </div>

                <p>Здравствуйте!</p>

                <p>Вы зарегистрировались в SutkiRent. 
                Для завершения регистрации введите следующий код подтверждения:</p>

                <div class="code">{code}</div>

                <p><strong>Код действителен в течение 10 минут.</strong></p>

                <p>Если вы не регистрировались в нашей системе, проигнорируйте это письмо.</p>

                <div class="footer">
                    <p>С уважением,<br>Команда SutkiRent</p>
                    <p>Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Подтверждение регистрации

        Здравствуйте!

        Вы зарегистрировались в сSutkiRent.
        Для завершения регистрации введите следующий код подтверждения:

        {code}

        Код действителен в течение 10 минут.

        Если вы не регистрировались в нашей системе, проигнорируйте это письмо.

        С уважением,
        Команда SutkiRent
        """

        # Создаем сообщение
        message = MIMEMultipart("alternative")
        message["Subject"] = "Код подтверждения регистрации"
        message["From"] = self.from_email
        message["To"] = email

        # Добавляем части сообщения
        message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))

        try:
            # Отправка email через SMTP
            async with aiosmtplib.SMTP(
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    use_tls=True
            ) as smtp:
                await smtp.login(self.smtp_username, self.smtp_password)
                await smtp.send_message(message)

            cfg.logger.info(f"Код подтверждения отправлен на {email}")
            return True

        except Exception as e:
            cfg.logger.error(f"Ошибка отправки email на {email}: {e}")
            return False

    async def send_password_reset_email(self, email: str, reset_token: str, name: str) -> bool:
        """Отправка email для восстановления пароля"""

        # Создаем ссылку для сброса пароля
        reset_link = f"{cfg.FRONTEND_URL}/reset-password?token={reset_token}"

        # Создаем HTML и текстовую версии письма
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #4CAF50; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; text-align: center; }}
                .note {{
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    border-left: 4px solid #4CAF50;
                }}
                .link-container {{
                    text-align: center;
                    margin: 25px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Восстановление пароля</h1>
                </div>

                <p>Здравствуйте, {name}!</p>

                <p>Мы получили запрос на восстановление пароля для вашей учетной записи в SutkiRent.</p>

                <div class="note">
                    <p><strong>Внимание:</strong> Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
                </div>

                <p>Для установки нового пароля нажмите на кнопку ниже:</p>

                <div class="link-container">
                    <a href="{reset_link}" class="button">Восстановить пароль</a>
                </div>

                <p>Или скопируйте эту ссылку в браузер:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    {reset_link}
                </p>

                <p><strong>Ссылка действительна в течение 24 часов.</strong></p>

                <div class="footer">
                    <p>С уважением,<br>Команда SutkiRent</p>
                    <p>Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Восстановление пароля

        Здравствуйте, {name}!

        Мы получили запрос на восстановление пароля для вашей учетной записи в SutkiRent.

        Для установки нового пароля перейдите по ссылке:
        {reset_link}

        Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.

        Ссылка действительна в течение 24 часов.

        С уважением,
        Команда SutkiRent

        Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.
        """

        # Создаем сообщение
        message = MIMEMultipart("alternative")
        message["Subject"] = "Восстановление пароля в SutkiRent"
        message["From"] = self.from_email
        message["To"] = email

        # Добавляем части сообщения
        message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))

        try:
            # Отправка email через SMTP
            async with aiosmtplib.SMTP(
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    use_tls=True
            ) as smtp:
                await smtp.login(self.smtp_username, self.smtp_password)
                await smtp.send_message(message)

            cfg.logger.info(f"Письмо восстановления пароля отправлено на {email}")
            return True

        except Exception as e:
            cfg.logger.error(f"Ошибка отправки письма восстановления пароля на {email}: {e}")
            return False


_instance = None


def get_email_service() -> EmailService:
    global _instance
    if _instance is None:
        _instance = EmailService()

    return _instance
