output "rds_endpoint" { value = aws_db_instance.postgres.endpoint }
output "elasticache_endpoint" { value = aws_elasticache_replication_group.redis.primary_endpoint_address }
output "ssm_parameter_arns" {
  value = { for k, v in aws_ssm_parameter.secrets : k => v.arn }
}
