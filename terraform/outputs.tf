output "frontend_bucket_name" {
  description = "S3 bucket name for frontend upload"
  value       = module.frontend.bucket_name
}

output "frontend_website_url" {
  description = "S3 static website URL to open in browser"
  value       = module.frontend.website_url
}
