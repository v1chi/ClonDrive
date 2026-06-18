variable "s3_bucket_name" {
  description = "Nombre del bucket S3 en LocalStack"
  type        = string
  default     = "clondrive-files"
}

variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "localstack_endpoint" {
  description = "endpoint de LocalStack"
  type        = string
  default     = "http://localhost:4566"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = var.aws_region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3 = var.localstack_endpoint
  }
}

resource "aws_s3_bucket" "clondrive_bucket" {
  bucket = var.s3_bucket_name
}
