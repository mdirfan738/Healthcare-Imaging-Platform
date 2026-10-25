resource "aws_db_subnet_group" "this" {
  name       = "${var.name_prefix}-db-subnet-grp"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet-grp"
  }
}

resource "aws_db_instance" "postgres" {
  identifier                  = "${var.name_prefix}-postgres"
  engine                      = "postgres"
  engine_version              = "15"
  instance_class              = var.db_instance_class
  allocated_storage           = var.db_allocated_storage
  max_allocated_storage       = 200
  storage_type                = "gp3"
  storage_encrypted           = true
  db_name                     = "pacs_db"
  username                    = var.db_username
  password                    = var.db_password
  db_subnet_group_name        = aws_db_subnet_group.this.name
  vpc_security_group_ids      = [var.db_cache_sg_id]
  multi_az                    = var.db_multi_az
  publicly_accessible         = false
  backup_retention_period     = var.db_multi_az ? 7 : 1
  deletion_protection         = var.db_deletion_protection
  skip_final_snapshot         = !var.db_deletion_protection
  final_snapshot_identifier   = var.db_deletion_protection ? "${var.name_prefix}-postgres-final" : null
  auto_minor_version_upgrade  = true

  tags = {
    Name = "${var.name_prefix}-postgres"
  }
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.name_prefix}-redis-subnet-grp"
  subnet_ids = var.private_subnet_ids
}

# Cost-optimized Valkey 7.2 engine (100% compatible with StackExchange.Redis, 20-33% lower cost)
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${var.name_prefix}-cache"
  description                = "Multi-AZ Valkey/Redis cache for Healthcare Imaging Platform"
  engine                     = "valkey"
  engine_version             = "7.2"
  node_type                  = var.redis_node_type
  num_cache_clusters         = var.redis_num_cache_clusters
  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [var.db_cache_sg_id]
  automatic_failover_enabled = var.redis_num_cache_clusters > 1
  multi_az_enabled           = var.redis_num_cache_clusters > 1
  at_rest_encryption_enabled = true
  transit_encryption_enabled = false
}

# Encrypted SSM Parameter Store entries ($0/month Standard tier)
locals {
  ssm_params = {
    "ConnectionStrings__PostgreSql"  = "Host=${aws_db_instance.postgres.address};Port=5432;Database=pacs_db;Username=${var.db_username};Password=${var.db_password};SSL Mode=Require;Trust Server Certificate=true"
    "ConnectionStrings__Redis"       = "${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379,abortConnect=false"
    "Jwt__Secret"                    = var.jwt_secret
    "Smtp__SenderEmail"              = var.smtp_sender_email
    "Smtp__Username"                 = var.smtp_username
    "Smtp__Password"                 = var.smtp_password
    "Smtp__DefaultNotificationEmail" = var.smtp_default_notification_email != "" ? var.smtp_default_notification_email : var.smtp_sender_email
  }
}

resource "aws_ssm_parameter" "secrets" {
  for_each = local.ssm_params
  name     = "/pacs/${var.environment}/${each.key}"
  type     = "SecureString"
  value    = each.value
}
