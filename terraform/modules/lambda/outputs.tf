output "lambda_arn" {
  description = "ARN of the Lambda function — used by API Gateway integration"
  value       = aws_lambda_function.companion.invoke_arn
}

output "lambda_name" {
  description = "Name of the Lambda function — used for Lambda permission resource"
  value       = aws_lambda_function.companion.function_name
}
