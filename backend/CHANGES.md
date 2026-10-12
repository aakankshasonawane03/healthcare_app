# Backend changes
* `core/middleware/authmiddleware.go` – now verifies the HS256 token that /auth/login issues (it was verifying RSA, so every protected route returned 401). Also sets `user_id`, `userId`, `role`, `email` in context.
* `modules/auth/handler/handler.go` – public register only allows PATIENT / DOCTOR / RECEPTION; ADMIN needs header `X-Admin-Key` = `ADMIN_SIGNUP_KEY`.
* `modules/auth/module.go` – added `GET /api/auth/me`.
* `modules/admin/dto/dto.go` – `is_active` no longer `binding:"required"` (a bool can never be `false` with that tag, so deactivating users always failed).
* `core/middleware/cors.go` – allows `X-Admin-Key` header.
* `.gitignore` – also ignores `firebase-service-account.json`.
* `.env` – added `ADMIN_SIGNUP_KEY`.
