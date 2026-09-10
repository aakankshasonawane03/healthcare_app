package handler

import (
	"net/http"
	"strings"

	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/model"
	"github.com/Sharkweb-IT-Park/sharkweb-mvp-base/backend/modules/auth/service"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthController struct {
	service service.AuthService
}

func NewAuthController(
	authService service.AuthService,
) *AuthController {
	return &AuthController{
		service: authService,
	}
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthController) Register(c *gin.Context) {

	var request RegisterRequest

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})

		return
	}

	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	if request.Name == "" ||
		request.Email == "" ||
		request.Password == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Name, email and password are required",
		})

		return
	}

	user := &model.User{
		Name:     request.Name,
		Email:    request.Email,
		Password: request.Password,
		Role:     request.Role,
	}

	err := h.service.Register(
		c.Request.Context(),
		user,
	)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User registered successfully",
		"data":    user,
	})
}

func (h *AuthController) Login(c *gin.Context) {

	var request LoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})

		return
	}

	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	token, user, err := h.service.Login(
		c.Request.Context(),
		request.Email,
		request.Password,
	)

	if err != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"token":   token,
		"user":    user,
	})
}

func (h *AuthController) GetMe(c *gin.Context) {

	userID := c.GetString("user_id")

	if userID == "" {

		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User ID not found in context",
		})

		return
	}

	id, err := primitive.ObjectIDFromHex(userID)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})

		return
	}

	user, err := h.service.GetUserByID(
		c.Request.Context(),
		id,
	)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}
