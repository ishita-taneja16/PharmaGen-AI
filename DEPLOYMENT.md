# Production Deployment & Operations Manual – PharmaGen AI

This guide details step-by-step procedures for deploying **PharmaGen AI** on AWS EC2 using Docker Compose, Nginx Reverse Proxy with Let's Encrypt SSL, PostgreSQL + pgvector database backups, and GitHub Actions CI/CD.

---

## 1. AWS EC2 Infrastructure Provisioning

### Recommended Server Specifications
- **AWS EC2 Instance Type**: `t3.xlarge` (4 vCPUs, 16 GB RAM) or `g4dn.xlarge` (if local GPU acceleration enabled).
- **Operating System**: Ubuntu 22.04 LTS x86_64.
- **EBS Storage**: 100 GB GP3 SSD.

### AWS Security Group Rules
| Port | Protocol | Source | Purpose |
| :--- | :--- | :--- | :--- |
| 22 | TCP | Administrator IP / VPN | SSH Terminal Access |
| 80 | TCP | 0.0.0.0/0 | HTTP (Redirects to HTTPS) |
| 443 | TCP | 0.0.0.0/0 | HTTPS SSL Application Traffic |
| 5000 | TCP | Admin VPN Only | MLflow Model Registry UI |
| 3001 | TCP | Admin VPN Only | Grafana Observability UI |

---

## 2. Server Environment Setup

Log into the EC2 instance via SSH and install Docker Engine, Docker Compose, and Certbot:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Certbot for Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx git curl
```

---

## 3. Application Deployment

### Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/PharmaAI.git /opt/pharmagen
cd /opt/pharmagen

# Create Production Environment File
cp .env.production .env
# Edit secrets in .env
nano .env
```

### Obtain Let's Encrypt SSL Certificate
```bash
sudo certbot certonly --standalone -d pharmagen.yourcompany.com
```

### Execute Automated Deployment Script
```bash
chmod +x scripts/deploy.sh scripts/backup_db.sh
./scripts/deploy.sh
```

---

## 4. Automated Database Backup Strategy

To ensure 21 CFR Part 11 electronic record integrity and disaster recovery:

Add a daily cron job to execute database backups:
```bash
sudo crontab -e
```
Add the following entry:
```cron
# Run database backup daily at 02:00 AM UTC
0 2 * * * /opt/pharmagen/scripts/backup_db.sh >> /var/log/pharmagen_backup.log 2>&1
```

---

## 5. Monitoring & Operational Health Checks

- **Application Health Liveness**: `http://<domain_or_ip>/health/liveness`
- **Database & Dependency Readiness**: `http://<domain_or_ip>/health/readiness`
- **Prometheus Metrics**: `http://<domain_or_ip>:8000/metrics`
- **Grafana Monitoring Dashboard**: `http://<domain_or_ip>:3001` (admin / admin)
- **MLflow Model Registry**: `http://<domain_or_ip>:5000`
