# Frontend statique servi par nginx.
FROM nginx:alpine

# On remplace la config par defaut pour injecter des en-tetes de securite
# (ca reduit les alertes du scan DAST : X-Frame-Options, CSP, etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# La page.
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80
