locals {
  # Resolve active workspace name (defaults to 'dev' if running in 'default' workspace)
  env = terraform.workspace == "default" ? "dev" : terraform.workspace

  # Environment-specific sizing and High-Availability matrix driven by terraform.workspace
  workspace_matrix = {
    dev = {
      az_count                  = 2
      enable_nat_gateway        = false
      ecs_desired_count         = 1
      ecs_min_capacity          = 1
      ecs_max_capacity          = 2
      ecs_cpu                   = 256
      ecs_memory                = 512
      enable_autoscaling        = false
      use_fargate_spot          = true
      db_instance_class         = "db.t4g.micro"
      db_allocated_storage      = 20
      db_multi_az               = false
      db_deletion_protection    = false
      redis_node_type           = "cache.t4g.micro"
      redis_num_cache_clusters  = 1
    }
    staging = {
      az_count                  = 2
      enable_nat_gateway        = false
      ecs_desired_count         = 2
      ecs_min_capacity          = 2
      ecs_max_capacity          = 4
      ecs_cpu                   = 512
      ecs_memory                = 1024
      enable_autoscaling        = true
      use_fargate_spot          = true
      db_instance_class         = "db.t4g.small"
      db_allocated_storage      = 30
      db_multi_az               = false
      db_deletion_protection    = false
      redis_node_type           = "cache.t4g.micro"
      redis_num_cache_clusters  = 2
    }
    prod = {
      az_count                  = 2
      enable_nat_gateway        = false # Set true if placing ECS tasks in private subnets instead of SG-locked public subnets
      ecs_desired_count         = 2
      ecs_min_capacity          = 2
      ecs_max_capacity          = 6
      ecs_cpu                   = 512
      ecs_memory                = 1024
      enable_autoscaling        = true
      use_fargate_spot          = false
      db_instance_class         = "db.t4g.small"
      db_allocated_storage      = 50
      db_multi_az               = true
      db_deletion_protection    = true
      redis_node_type           = "cache.t4g.micro"
      redis_num_cache_clusters  = 2
    }
  }

  # Select current workspace profile, falling back to 'dev' if a custom workspace name is used
  cfg         = lookup(local.workspace_matrix, local.env, local.workspace_matrix["dev"])
  name_prefix = "${var.project_name}-${local.env}"
}
