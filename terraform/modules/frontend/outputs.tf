output "bucket_name" {
  description = "S3 bucket name — use with: aws s3 sync ../frontend/ s3://<bucket_name>/"
  value       = aws_s3_bucket.frontend.id
}

output "website_url" {
  description = "S3 static website endpoint URL"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}
