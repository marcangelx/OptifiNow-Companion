terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

module "lambda" {
  source = "./modules/lambda"

  project_name   = var.project_name
  environment    = var.environment
  openai_api_key = var.openai_api_key
  # Path is relative to THIS file's directory — points to the backend folder
  backend_path   = "${path.module}/../backend"
}

module "api_gateway" {
  source = "./modules/api_gateway"

  project_name = var.project_name
  environment  = var.environment
  lambda_arn   = module.lambda.lambda_arn
  lambda_name  = module.lambda.lambda_name
}

module "frontend" {
  source = "./modules/frontend"

  project_name = var.project_name
  environment  = var.environment
}
