output "instance-public-id" {
  value = aws_instance.prod-server.public_ip
}