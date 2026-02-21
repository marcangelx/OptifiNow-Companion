output "api_gateway_url" {
  description = "API Gateway invoke URL — paste this into frontend/app.js as BACKEND_URL"
  # trimsuffix removes trailing slash from invoke_url before appending the path
  value       = "${trimsuffix(module.api_gateway.api_url, "/")}/ask"
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend upload"
  value       = module.frontend.bucket_name
}

output "frontend_website_url" {
  description = "S3 static website URL to open in browser"
  value       = module.frontend.website_url
}
