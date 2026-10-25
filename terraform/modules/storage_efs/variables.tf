variable "name_prefix" { type = string }
variable "az_count" { type = number }
variable "private_subnet_ids" { type = list(string) }
variable "efs_sg_id" { type = string }
