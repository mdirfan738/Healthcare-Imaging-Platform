resource "aws_efs_file_system" "dicom" {
  creation_token = "${var.name_prefix}-dicom-efs"
  encrypted      = true

  # Cost-optimization: transition DICOM studies older than 30 days to EFS Infrequent Access (saves up to 92%)
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  lifecycle_policy {
    transition_to_primary_storage_class = "AFTER_1_ACCESS"
  }

  tags = {
    Name = "${var.name_prefix}-dicom-storage"
  }
}

# Create Multi-AZ Mount Targets dynamically across all AZs using count
resource "aws_efs_mount_target" "dicom" {
  count           = var.az_count
  file_system_id  = aws_efs_file_system.dicom.id
  subnet_id       = var.private_subnet_ids[count.index]
  security_groups = [var.efs_sg_id]
}

# POSIX Access Point matching non-root 'pacsuser' (UID 1000 / GID 1000) in backend/Dockerfile
resource "aws_efs_access_point" "dicom" {
  file_system_id = aws_efs_file_system.dicom.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/dicom"
    creation_info {
      owner_uid   = 1000
      owner_gid   = 1000
      permissions = "0755"
    }
  }

  tags = {
    Name = "${var.name_prefix}-dicom-ap"
  }
}
