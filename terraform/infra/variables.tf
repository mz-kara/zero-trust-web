variable "ami_id" {
  type = string 
  description = "AMI ID of ubuntu image"
  default = "ami-0e1c4170d9c01184b"
}

variable "aws_region" {
  type = string
  description = "Region of AWS account"
  default = "eu-west-3"
}

variable "ec2_instance_name" {
  description = "Name tag for the EC2 instance"
  type        = string
  default     = "lab03-instance-with-iam"
}

variable "instance_type" {
  # t3.micro est eligible a l'offre gratuite quelle que soit la date de
  # creation du compte, contrairement a t2.micro.
  description = "Type d'instance EC2"
  type        = string
  default     = "t3.micro"
}

variable "role_name" {
  description = "Name of the IAM role"
  type        = string
  default     = "lab03-ec2-role"
}