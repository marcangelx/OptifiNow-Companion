output "api_url" {
  description = "API Gateway base invoke URL (without path)"
  value       = aws_apigatewayv2_stage.default.invoke_url
}
