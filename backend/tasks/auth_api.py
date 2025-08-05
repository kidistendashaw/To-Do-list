from ninja import Router
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework_simplejwt.tokens import RefreshToken
from .schemas import (
    UserRegisterSchema,
    MessageSchema,
    PasswordResetRequestSchema,
    PasswordResetConfirmSchema,
)

auth_router = Router()


@auth_router.post("/register", response={201: MessageSchema, 400: MessageSchema})
def register(request, payload: UserRegisterSchema):
    if User.objects.filter(username=payload.username).exists():
        return 400, {"message": "Email already registered"}
    user = User.objects.create_user(
        username=payload.username,
        email=payload.username,  # Use email as username
        password=payload.password,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )
    return 201, {"message": "User created successfully"}


@auth_router.post("/password-reset", response={200: MessageSchema, 404: MessageSchema})
def password_reset_request(request, payload: PasswordResetRequestSchema):
    try:
        user = User.objects.get(email=payload.email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # In a real app, you would build a full URL to your frontend
        reset_link = f"http://localhost:5173/password-reset-confirm/{uid}/{token}/"

        send_mail(
            "Password Reset for Your To-Do App",
            f"Hello,\n\nPlease click the link to reset your password:\n{reset_link}\n\nThanks,\nThe To-Do App Team",
            "noreply@todoapp.com",
            [user.email],
            fail_silently=False,
        )
        print(f"Password reset link for {user.email}: {reset_link}")  # For development
        return {"message": "Password reset link sent to your email"}
    except User.DoesNotExist:
        return 404, {"message": "User with this email does not exist."}


@auth_router.post(
    "/password-reset/confirm/{uidb64}/{token}",
    response={200: MessageSchema, 400: MessageSchema},
)
def password_reset_confirm(
    request, uidb64: str, token: str, payload: PasswordResetConfirmSchema
):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if payload.new_password1 != payload.new_password2:
            return 400, {"message": "Passwords do not match."}
        user.set_password(payload.new_password1)
        user.save()
        return {"message": "Password has been reset successfully."}
    else:
        return 400, {"message": "Invalid reset link."}
