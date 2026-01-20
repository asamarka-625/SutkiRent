from web_app.src.crud.apartment import sql_get_available_apartments
from web_app.src.crud.content import sql_get_contents_by_category
from web_app.src.crud.region import sql_get_regions
from web_app.src.crud.user import (sql_get_user_by_email, sql_get_user_by_id, sql_create_user,
                                   sql_update_password_user_by_email, sql_update_user_info)