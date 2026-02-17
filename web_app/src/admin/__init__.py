from web_app.src.admin.content import ContentAdmin, PhotoContentAdmin, CategoryContentAdmin
from web_app.src.admin.apartment import ApartmentAdmin
from web_app.src.admin.region import RegionAdmin
from web_app.src.admin.metro import MetroStationAdmin
from web_app.src.admin.city import CityAdmin
from web_app.src.admin.photo_apartment import PhotoApartmentAdmin
from web_app.src.admin.user import UserAdmin
from web_app.src.admin.service import ServiceAdmin
from web_app.src.admin.type_apartment import TypeApartmentAdmin
from web_app.src.admin.window import WindowAdmin
from web_app.src.admin.bathroom_apartment import BathroomAdmin
from web_app.src.admin.item import ItemAdmin
from web_app.src.admin.item_apartment import ApartmentItemAdmin
from web_app.src.admin.authentication import BasicAuthBackend
from web_app.src.core import cfg


authentication_backend = BasicAuthBackend(secret_key=cfg.SECRET_REFRESH_KEY)