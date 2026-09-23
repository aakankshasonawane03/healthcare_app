package middleware

import (
	"crypto/rsa"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gin-gonic/gin"
)

var publicKey *rsa.PublicKey

func LoadPublicKey() error {
	keyData, err := os.ReadFile("core/certs/public.pem")
	if err != nil {
		return err
	}

	key, err := jwt.ParseRSAPublicKeyFromPEM(keyData)
	if err != nil {
		return err
	}

	publicKey = key
	return nil
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		tokenString := c.GetHeader("Authorization")

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token required",
			})
			c.Abort()
			return
		}

		// Remove Bearer
		if len(tokenString) > 7 {
			tokenString = tokenString[7:]
		}

		token, err := jwt.Parse(tokenString,
			func(token *jwt.Token) (interface{}, error) {
				return publicKey, nil
			})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token",
			})
			c.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)

		c.Set("user_id", claims["user_id"])
		c.Set("role", claims["role"])

		c.Next()
	}
}