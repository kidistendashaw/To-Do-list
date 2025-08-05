from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from tasks.auth_api import auth_router
from tasks.tasks_api import tasks_router

api = NinjaAPI()

# Add routers
api.add_router("/auth", auth_router, tags=["auth"])
api.add_router("/tasks", tasks_router, tags=["tasks"])


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),  # Main API entry point
    # JWT Token endpoints provided by simplejwt
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
