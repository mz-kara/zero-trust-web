# zero-trust-web

## Secrets

Pour générer aléatoirement les secrets :

pour le secret JWT
JWT=$(aws secretsmanager get-random-password \
  --password-length 32 \
  --exclude-punctuation \
  --query RandomPassword --output text)

aws secretsmanager put-secret-value \
  --secret-id jwt_secret \
  --secret-string "$JWT"

pour le mot de passe de la base de donnée
DBPASS=$(aws secretsmanager get-random-password \
  --password-length 24 \
  --exclude-punctuation \
  --query RandomPassword --output text)

aws secretsmanager put-secret-value \
  --secret-id db_password \
  --secret-string "$DBPASS"


## Les fichiers workflows  

ci.yml : 
- verifie la syntaxe des codes terraform et des éventuels langages de prog, effectue des tests, scans de sécurité
- à chaque push

cd.yml : 
- se connecte au compte aws et déploie les modifications sur la branche main
- à chaque push dans le main

## liens

https://blog.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/aws/iam-role-policy-instance-profile/
https://github.com/kCn3333/aws-devops
https://github.com/aws-actions/configure-aws-credentials
https://github.blog/changelog/2026-04-23-immutable-subject-claims-for-GitHub-actions-oidc-tokens/ (mettre les id de ORG et du depot github dans le role de git)