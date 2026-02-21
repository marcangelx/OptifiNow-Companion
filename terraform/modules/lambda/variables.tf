variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key passed as Lambda environment variable"
  type        = string
  sensitive   = true
}

variable "backend_path" {
  description = "Absolute path to the backend directory to zip for Lambda"
  type        = string
}
