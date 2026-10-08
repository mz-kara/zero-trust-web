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
  iam_instance_profile = "ec2-profile"

  subnet_id              = aws_subnet.subnet-1.id
  vpc_security_group_ids = [aws_security_group.allow_web.id]

  user_data = <<-EOF
            #!/bin/bash
            apt-get update -y
            apt-get install -y git docker.io
            systemctl enable --now docker
            cd /home/ubuntu
            git clone https://github.com/mz-kara/zero-trust-web.git app
            cd app/src
            docker compose up -d --build
            EOF

  tags = {
    Name = "web-server"
  }

}