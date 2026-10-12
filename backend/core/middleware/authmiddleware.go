package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// jwtSecret returns the same secret the auth service signs tokens with.
// The fallback MUST stay identical to the one in modules/auth/service.
func jwtSecret() []byte {
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))

	if secret == "" {
		secret = "sharkweb-secret-key"
	}

	return []byte(secret)
}

func unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"success": false,
		"message": message,
	})
	c.Abort()
}

// AuthMiddleware validates the HS256 access token issued by /api/auth/login.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			unauthorized(c, "Authorization header is required")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)

		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			unauthorized(c, "Invalid Authorization header format")
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		if tokenString == "" {
			unauthorized(c, "Token is required")
			return
		}

		secret := jwtSecret()

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {
				if token.Method != jwt.SigningMethodHS256 {
					return nil, jwt.ErrSignatureInvalid
				}

				return secret, nil
			},
		)

		if err != nil || !token.Valid {
			unauthorized(c, "Invalid or expired token")
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {
			unauthorized(c, "Invalid token claims")
			return
		}

		if userID, ok := claims["user_id"].(string); ok {
			c.Set("user_id", userID)
			c.Set("userId", userID) // notification module reads this key
		}

		if role, ok := claims["role"].(string); ok {
			c.Set("role", role)
		}

		if email, ok := claims["email"].(string); ok {
			c.Set("email", email)
		}

		c.Set("user", token)

		c.Next()
	}
}
