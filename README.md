# zero-trust-web

## Les fichiers workflows  

ci.yml : 
- verifie la syntaxe des codes terraform et des éventuels langages de prog, effectue des tests, scans de sécurité
- à chaque push

cd.yml : 
- se connecte au compte aws et déploie les modifications sur la branche main
- à chaque push dans le main

## liens

https://blog.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/aws/iam-role-policy-instance-profile/