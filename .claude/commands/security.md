# Audit Sécurité

Effectue un audit de sécurité sur NutriProfile.

## OWASP Top 10 Checklist

### A01 - Broken Access Control
- [ ] Vérification ownership sur toutes les ressources
- [ ] Endpoints protégés par JWT
- [ ] Limites tier appliquées backend

### A02 - Cryptographic Failures
- [ ] Passwords hashés (bcrypt)
- [ ] HTTPS enforced
- [ ] Secrets pas dans le code

### A03 - Injection
- [ ] SQLAlchemy ORM (pas de raw SQL)
- [ ] Inputs validés (Pydantic)
- [ ] Pas de command injection

### A05 - Security Misconfiguration
- [ ] CORS configuré correctement
- [ ] Headers de sécurité
- [ ] Debug mode désactivé en prod

### A07 - Authentication Failures
- [ ] JWT tokens courts (30min)
- [ ] Refresh tokens sécurisés
- [ ] Rate limiting sur login

## Fichiers Critiques à Auditer

```
backend/
├── app/services/auth.py     # Auth logic
├── app/api/v1/auth.py       # Auth endpoints
├── app/config.py            # Secrets
└── app/main.py              # CORS, middleware

frontend/
├── src/services/api.ts      # Token handling
└── src/store/authStore.ts   # Token storage
```

## RGPD Compliance

- [ ] Privacy policy à jour
- [ ] Cookie consent
- [ ] Data export endpoint
- [ ] Account deletion fonctionne
- [ ] Data retention policy

## Cible de l'Audit

$ARGUMENTS
