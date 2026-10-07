terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.61"
    }
  }
  required_version = ">= 1.2"

  backend "s3" {
    bucket = "mehmed-tfstate-2026"
    key = "infra/terraform.tfstate"
    region = "eu-west-3"
    encrypt = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region
}