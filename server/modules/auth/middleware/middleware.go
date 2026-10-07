
package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		// ============================================
		// Get Authorization header
		// ============================================

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token required",
			})
			c.Abort()
			return
		}

		// ============================================
		// Check Bearer token format
		// ============================================

		parts := strings.SplitN(authHeader, " ", 2)

		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authorization header",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token required",
			})
			c.Abort()
			return
		}

		// ============================================
		// Get JWT secret
		// ============================================

		jwtSecret := os.Getenv("JWT_SECRET")

		if jwtSecret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "JWT secret is not configured",
			})
			c.Abort()
			return
		}

		// ============================================
		// Parse and validate JWT
		// ============================================

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {

				// Make sure token uses HS256.
				if token.Method != jwt.SigningMethodHS256 {
					return nil, jwt.ErrSignatureInvalid
				}

				return []byte(jwtSecret), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token",
			})
			c.Abort()
			return
		}

		// ============================================
		// Get claims
		// ============================================

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token claims",
			})
			c.Abort()
			return
		}

		// ============================================
		// Store user information in Gin context
		// ============================================

		if userID, ok := claims["user_id"]; ok {
			c.Set("user_id", userID)
		}

		if role, ok := claims["role"]; ok {
			c.Set("role", role)
		}

		if email, ok := claims["email"]; ok {
			c.Set("email", email)
		}

		c.Next()
	}
}

