# Compus Disaster Recovery & Incident Response Runbook

This document details procedures for backup verification, point-in-time recovery, emergency flushing, and incident response for the **Compus** production environment.

---

## 1. Database Automated Backups & Restoration (Neon)

Neon PostgreSQL automatically maintains continuous WAL archiving and point-in-time recovery (PITR).

### A. Point-in-Time Recovery
1. Navigate to **Neon Console -> Branches**.
2. Click **Create Branch from Point in Time**.
3. Select exact timestamp prior to database corruption or incident.
4. Update `DATABASE_URL` in Railway Environment Variables to point to the restored branch.
5. Restart Railway backend services.

### B. Manual Logical Backup (`pg_dump`)
Run a daily logical dump for off-site backup storage:
```bash
pg_dump "postgresql://user:password@ep-compus.neon.tech/compus?sslmode=require" -Fc -f compus_backup_$(date +%Y%m%d).dump
```

To restore from dump:
```bash
pg_restore -d "postgresql://user:password@ep-compus.neon.tech/compus?sslmode=require" --clean compus_backup_20260729.dump
```

---

## 2. Redis Session & Queue Flush Procedure

If Redis rate limiting or queue state becomes corrupted:
1. Connect to Redis CLI:
   ```bash
   redis-cli -h your-redis-host.railway.app -p 6379
   ```
2. Flush token blacklist or rate limit keys safely:
   ```redis
   KEYS "throttler:*" | xargs redis-cli DEL
   ```
3. In emergency queue stall scenarios, flush BullMQ keys:
   ```redis
   KEYS "bull:*" | xargs redis-cli DEL
   ```

---

## 3. Incident Severity Levels & Response Flow

| Severity | Definition | Action Required | Escalation Time |
|---|---|---|---|
| **SEV-1 (Critical)** | Total outage or database unavailability | Trigger Neon PITR / Switch Railway fallback pod | < 15 minutes |
| **SEV-2 (High)** | WebSocket disconnects or messaging failure | Restart WebSocket pods / Verify Redis connection | < 1 hour |
| **SEV-3 (Medium)** | Minor API degradation or slow queries | Review slow query logs / Adjust DB connection pool | < 4 hours |
