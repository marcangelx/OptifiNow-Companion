variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "optfinow-companion"
}

variable "openai_api_key" {
  description = "OpenAI API key injected into Lambda as an environment variable"
  type        = string
  sensitive   = true
}
