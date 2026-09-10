package auth

type CreateAuthDTO struct {
	Name string `json:"name" binding:"required"`
}
