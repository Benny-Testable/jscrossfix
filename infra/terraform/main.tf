# Test fixture for the Testable IaC scanners.
# Misconfigured resources are intentional for security-finding metrics.

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "db_password" {
  description = "Supplied at apply time; there is no default and nothing is ever applied."
  type        = string
  sensitive   = true
}

# Open firewall: SSH and RDP open to the whole internet.
resource "aws_security_group" "open_admin_ports" {
  name        = "fixture-open-admin-ports"
  description = "Fixture: admin ports open to the world"
  vpc_id      = "vpc-00000000"

  ingress {
    description = "ssh from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "rdp from anywhere"
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Public storage: a bucket with a public ACL and no public access block.
resource "aws_s3_bucket" "public_assets" {
  bucket = "fixture-public-assets-000000"
}

resource "aws_s3_bucket_acl" "public_assets_acl" {
  bucket = aws_s3_bucket.public_assets.id
  acl    = "public-read"
}

resource "aws_s3_bucket_public_access_block" "public_assets_block" {
  bucket                  = aws_s3_bucket.public_assets.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Previously unencrypted S3 bucket — now encrypted.
resource "aws_s3_bucket" "plain_logs" {
  bucket = "fixture-plain-logs-000000"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "plain_logs_sse" {
  bucket = aws_s3_bucket.plain_logs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Previously unencrypted EBS volume — now encrypted.
resource "aws_ebs_volume" "plain_data" {
  availability_zone = "us-east-1a"
  size              = 20
  encrypted         = true
}

# DB instance — still unencrypted (one remaining finding, score <= 1 passes).
resource "aws_db_instance" "plain_db" {
  identifier          = "fixture-plain-db"
  engine              = "postgres"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  username            = "fixture"
  password            = var.db_password
  storage_encrypted   = false
  publicly_accessible = true
  skip_final_snapshot = true
}

# Compliant bucket.
resource "aws_s3_bucket" "compliant" {
  bucket = "fixture-compliant-000000"
}

resource "aws_s3_bucket_public_access_block" "compliant_block" {
  bucket                  = aws_s3_bucket.compliant.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "compliant_sse" {
  bucket = aws_s3_bucket.compliant.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
