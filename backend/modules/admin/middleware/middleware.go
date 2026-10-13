package middleware

import (
	"net/http"
	"strings"
	"fmt"

	"github.com/gin-gonic/gin"
)

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		role := c.GetString("role")
		fmt.Printf("DEBUG: Admin middleware received role = %q\n", role)

		if strings.ToUpper(role) != "ADMIN" {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Admin access required",
				
			})
			c.Abort()
			return
		}

		c.Next()
	}
}