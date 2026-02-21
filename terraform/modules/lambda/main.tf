locals {
  function_name = "${var.project_name}-${var.environment}"
}

# Zip the backend directory (handler.js + node_modules) for Lambda upload
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.backend_path
  output_path = "${path.module}/lambda.zip"

  # Exclude server.js — it's for local dev only, not needed in Lambda
  excludes = ["server.js", "package-lock.json"]
}

# IAM role that Lambda assumes at runtime
resource "aws_iam_role" "lambda_exec" {
  name = "${local.function_name}-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Allow Lambda to write logs to CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# CloudWatch log group with a sensible retention window
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "companion" {
  function_name = local.function_name
  description   = "OptifiNow AI Companion — calls OpenAI to generate onboarding steps"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  handler          = "handler.handler"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 30   # OpenAI calls can take a few seconds
  memory_size      = 256

  environment {
    variables = {
      # Key is read from process.env.OPENAI_API_KEY inside handler.js
      OPENAI_API_KEY = var.openai_api_key
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_logs]
}
