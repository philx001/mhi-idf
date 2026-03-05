# Configuration Supabase : lien d'invitation valable 24 h

Pour que les liens d'invitation envoyés par email soient valables **24 heures** (au lieu de 1 h par défaut) :

1. **Supabase Dashboard** → votre projet → **Authentication** → **Providers** → **Email**
2. Cherchez le paramètre **« Email OTP Expiration »** (ou équivalent `mailer_otp_exp`)
3. Définissez la valeur à **86400** (secondes = 24 h)

La valeur maximale autorisée par Supabase est 86400 secondes (24 h).

---

*Voir aussi : `docs/auth-invitations-email.md` pour la configuration SMTP.*
