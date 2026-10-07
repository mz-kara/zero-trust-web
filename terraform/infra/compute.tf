resource "aws_eip" "one" {
  domain                    = "vpc"
  instance = aws_instance.prod-server.id

  depends_on = [ aws_internet_gateway.gw ]
}

resource "aws_instance" "prod-server" {
  ami           = var.ami_id
  instance_type = "t3.micro"
  key_name = "main-key"
  user_data_replace_on_change = true

  subnet_id              = aws_subnet.subnet-1.id
  vpc_security_group_ids = [aws_security_group.allow_web.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y apache2
              systemctl enable --now apache2
              echo "Burkina Faso is dead but Tarik Montana is back" > /var/www/html/index.html
              EOF

  tags = {
    Name = "web-server"
  }

}