package dto

type LoginDTO struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type RefreshTokenDTO struct {
    RefreshToken string `json:"refresh_token" binding:"required"`
}

type TokenResponseDTO struct {
    AccessToken  string `json:"access_token"`
    RefreshToken string `json:"refresh_token"`
    TokenType    string `json:"token_type"`
    ExpiresIn    int64  `json:"expires_in"`
}