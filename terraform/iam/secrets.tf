resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "jwt_secret"
}

resource "aws_secretsmanager_secret" "db_password" {
  name = "db_password"
}
