variable "aws_region" {
  description = "Primary AWS region for the regional backend and data tier"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Base identifier for all Healthcare Imaging Platform resources"
  type        = string
  default     = "healthcare-pacs"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "Master username for RDS PostgreSQL 15"
  type        = string
  default     = "pacs_user"
}

variable "db_password" {
  description = "Master password for RDS PostgreSQL 15"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (minimum 32 characters) for PACS.Api"
  type        = string
  sensitive   = true
}

variable "smtp_sender_email" {
  description = "Gmail address used to dispatch finalized study notifications"
  type        = string
}

variable "smtp_username" {
  description = "Gmail SMTP username"
  type        = string
}

variable "smtp_password" {
  description = "16-character Google App Password for Gmail SMTP"
  type        = string
  sensitive   = true
}

variable "smtp_default_notification_email" {
  description = "Default clinic/radiologist notification email address"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Optional custom domain name (e.g. app.yourdomain.com). Leave empty to use the default CloudFront domain."
  type        = string
  default     = ""
}

variable "acm_certificate_arn_us_east_1" {
  description = "Optional ACM Certificate ARN in us-east-1 for custom CloudFront domain"
  type        = string
  default     = ""
}
