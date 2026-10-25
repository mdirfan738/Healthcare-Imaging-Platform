# =============================================================================
# Root Module — Orchestrates Child Modules with Workspace & Count Configuration
# =============================================================================

module "networking" {
  source             = "./modules/networking"
  name_prefix        = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  az_count           = local.cfg.az_count
  enable_nat_gateway = local.cfg.enable_nat_gateway
}

module "storage_efs" {
  source             = "./modules/storage_efs"
  name_prefix        = local.name_prefix
  az_count           = local.cfg.az_count
  private_subnet_ids = module.networking.private_subnet_ids
  efs_sg_id          = module.networking.efs_sg_id
}

module "data_layer" {
  source                          = "./modules/data_layer"
  name_prefix                     = local.name_prefix
  environment                     = local.env
  private_subnet_ids              = module.networking.private_subnet_ids
  db_cache_sg_id                  = module.networking.db_cache_sg_id
  db_instance_class               = local.cfg.db_instance_class
  db_allocated_storage            = local.cfg.db_allocated_storage
  db_multi_az                     = local.cfg.db_multi_az
  db_deletion_protection          = local.cfg.db_deletion_protection
  db_username                     = var.db_username
  db_password                     = var.db_password
  redis_node_type                 = local.cfg.redis_node_type
  redis_num_cache_clusters        = local.cfg.redis_num_cache_clusters
  jwt_secret                      = var.jwt_secret
  smtp_sender_email               = var.smtp_sender_email
  smtp_username                   = var.smtp_username
  smtp_password                   = var.smtp_password
  smtp_default_notification_email = var.smtp_default_notification_email
}

module "compute_ecs" {
  source                 = "./modules/compute_ecs"
  name_prefix            = local.name_prefix
  aws_region             = var.aws_region
  vpc_id                 = module.networking.vpc_id
  public_subnet_ids      = module.networking.public_subnet_ids
  ecs_subnet_ids         = local.cfg.enable_nat_gateway ? module.networking.private_subnet_ids : module.networking.public_subnet_ids
  assign_public_ip       = !local.cfg.enable_nat_gateway
  alb_sg_id              = module.networking.alb_sg_id
  ecs_sg_id              = module.networking.ecs_sg_id
  efs_file_system_id     = module.storage_efs.efs_file_system_id
  efs_access_point_id    = module.storage_efs.efs_access_point_id
  ssm_parameter_arns     = module.data_layer.ssm_parameter_arns
  ecs_cpu                = local.cfg.ecs_cpu
  ecs_memory             = local.cfg.ecs_memory
  ecs_desired_count      = local.cfg.ecs_desired_count
  ecs_min_capacity       = local.cfg.ecs_min_capacity
  ecs_max_capacity       = local.cfg.ecs_max_capacity
  enable_autoscaling     = local.cfg.enable_autoscaling
  use_fargate_spot       = local.cfg.use_fargate_spot
  portal_base_url        = var.domain_name != "" ? "https://${var.domain_name}" : "https://${module.edge_cdn.cloudfront_domain_name}"
}

module "edge_cdn" {
  source                        = "./modules/edge_cdn"
  name_prefix                   = local.name_prefix
  alb_dns_name                  = module.compute_ecs.alb_dns_name
  domain_name                   = var.domain_name
  acm_certificate_arn_us_east_1 = var.acm_certificate_arn_us_east_1
}
