################# IAM for EC2 SSM #################

resource "aws_iam_role" "ec2-ssm-role" {
    name = "ssm-role"

    assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    tag-key = "ssm-role"
  }

}

resource "aws_iam_role_policy_attachment" "ssm-role-attachement" {
    role       = aws_iam_role.ec2-ssm-role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2-profile" {
  name = "ec2-profile"
  role = aws_iam_role.ec2-ssm-role.name
}


################# IAM for Github #################

data "aws_iam_policy_document" "ssm-policy" {
  statement {
      effect = "Allow"
      actions = [
          "ssm:SendCommand",
          "ssm:GetCommandInvocation"
      ]
      resources = [
          "arn:aws:ec2:*:*:instance/*",
          "arn:aws:ssm:*:*:document/*"
      ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetObject",
      "s3:PutObject"
    ]
    resources = [
      "arn:aws:s3:::mehmed-tfstate-2026",
      "arn:aws:s3:::mehmed-tfstate-2026/*"
    ]
  }
}

resource "aws_iam_openid_connect_provider" "github" {
    url = "https://token.actions.githubusercontent.com"
    client_id_list = ["sts.amazonaws.com"]
    thumbprint_list = [ "6938fd4d98bab03faadb97b34396831e3780aea1" ]
}

resource "aws_iam_role" "oidc-github-role" {
    name = var.role_name

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
        {
            Action = "sts:AssumeRoleWithWebIdentity"
            Effect = "Allow"
            Sid    = ""
            Principal = {
                Federated = aws_iam_openid_connect_provider.github.arn
            }
            Condition = {
            "StringEquals" = {
                "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            }
            "StringLike" = {
                "token.actions.githubusercontent.com:sub" = "repo:mz-kara/zero-trust-web:ref:refs/heads/main"
            }
            }

        }
        ]
    })

    tags = {
        tag-key = var.role_name
    }
}

resource "aws_iam_policy" "oidc-github-policy" {
    name        = "ajout"
    description = ""
    policy      = data.aws_iam_policy_document.ssm-policy.json

    tags = {
        Name = "lab03-s3-read-policy"
    }
}

resource "aws_iam_role_policy_attachment" "oidc-github-role-attachement" {
    role       = aws_iam_role.oidc-github-role.name
    policy_arn = aws_iam_policy.oidc-github-policy.arn
}

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
    key = "zero_trust_web/terraform.tfstate"
    region = "eu-west-3"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}