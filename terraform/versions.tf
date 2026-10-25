terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Production S3 Remote State Backend (Supports Terraform Workspaces via env:/<workspace>/ key prefix)
  # Uncomment after creating your state bucket and DynamoDB lock table:
  # backend "s3" {
  #   bucket         = "pacs-terraform-state-bucket"
  #   key            = "healthcare-imaging-platform/terraform.tfstate"
  #   region         = "ap-south-1"
  #   encrypt        = true
  #   dynamodb_table = "pacs-terraform-state-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = local.env
      Workspace   = terraform.workspace
      ManagedBy   = "Terraform"
    }
  }
}
