locals {
  api_name = "${var.project_name}-${var.environment}-api"
}

# HTTP API (v2) — lighter and cheaper than REST API for this use case
resource "aws_apigatewayv2_api" "companion" {
  name          = local.api_name
  protocol_type = "HTTP"
  description   = "OptifiNow Companion API — routes /ask to Lambda"

  # CORS is handled by handler.js, but API Gateway also needs to allow it
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 300
  }
}

# Wire the API to the Lambda function
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.companion.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_arn
  payload_format_version = "2.0"
}

# POST /ask route
resource "aws_apigatewayv2_route" "ask" {
  api_id    = aws_apigatewayv2_api.companion.id
  route_key = "POST /ask"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# Default stage with auto-deploy enabled — no manual deployments needed
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.companion.id
  name        = "$default"
  auto_deploy = true
}

# Allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.companion.execution_arn}/*/*"
}
