from web_app.src.utils.realtycalendar import get_rc_client
from web_app.src.utils.work_with_redis import get_redis_service
from web_app.src.utils.work_with_password import verify_password, get_password_hash, create_reset_token
from web_app.src.utils.work_with_email import get_email_service


rc_client = get_rc_client()
redis_service = get_redis_service()
email_service = get_email_service()