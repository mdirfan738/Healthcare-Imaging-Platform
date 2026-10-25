output "active_workspace" {
  description = "Active Terraform workspace environment"
  value       = local.env
}

output "cloudfront_global_url" {
  description = "Global HTTPS URL for the Healthcare Imaging Platform (Frontend + API)"
  value       = "https://${module.edge_cdn.cloudfront_domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID for GitHub Actions cache invalidation"
  value       = module.edge_cdn.cloudfront_distribution_id
}

output "frontend_s3_bucket_name" {
  description = "S3 Bucket name for syncing RIS React frontend build artifacts"
  value       = module.edge_cdn.frontend_s3_bucket_name
}

output "ecr_repository_url" {
  description = "Amazon ECR Repository URL for pushing PACS.Api Docker images"
  value       = module.compute_ecs.ecr_repository_url
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = module.compute_ecs.ecs_cluster_name
}

output "ecs_service_name" {
  description = "ECS Service name"
  value       = module.compute_ecs.ecs_service_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL 15 endpoint"
  value       = module.data_layer.rds_endpoint
}

output "elasticache_endpoint" {
  description = "ElastiCache Valkey/Redis primary endpoint"
  value       = module.data_layer.elasticache_endpoint
}

output "efs_file_system_id" {
  description = "Amazon EFS File System ID mounted at /dicom-storage"
  value       = module.storage_efs.efs_file_system_id
}
