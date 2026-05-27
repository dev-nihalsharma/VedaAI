# Deploying VedaAI on AWS EC2

End-to-end guide for getting the stack running on a single EC2 instance using
Docker, with GitHub Actions handling build + rollout.

The stack on the host looks like:

```
  Internet :80  ──►  nginx  ──►  frontend (Next.js  :3000)
                       │
                       └─►  backend (Express + BullMQ + Socket.IO  :4000)
                                │
                                ├─►  redis  (BullMQ queue + paper cache)
                                └─►  MongoDB Atlas  (external)
```

---

## 1. Provision the EC2 instance

1. **AMI** — Ubuntu Server 22.04 LTS (x86_64).
2. **Instance type** — `t3.small` minimum (2 GB RAM). Claude generation is
   network-bound, not CPU-bound, so this is enough. `t3.medium` if you expect
   concurrent generations.
3. **Storage** — 20 GB gp3 is plenty.
4. **Key pair** — create or reuse one; save the `.pem`.
5. **Security group** — inbound rules:

   | Type  | Protocol | Port | Source       | Purpose            |
   |-------|----------|------|--------------|--------------------|
   | SSH   | TCP      | 22   | your IP      | shell access       |
   | HTTP  | TCP      | 80   | 0.0.0.0/0    | nginx              |
   | HTTPS | TCP      | 443  | 0.0.0.0/0    | nginx (after TLS)  |

6. **Elastic IP** — allocate one and associate it with the instance so the
   public IP survives reboots.

---

## 2. Install Docker on the instance

SSH in:

```bash
ssh -i your-key.pem ubuntu@<elastic-ip>
```

Install Docker + Compose plugin:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
exit                                # re-login so the group takes effect
```

Re-SSH and verify:

```bash
docker version
docker compose version
```

---

## 3. Lay out the deployment directory

```bash
mkdir -p ~/vedaai/nginx
cd ~/vedaai
```

Create `~/vedaai/.env` (this file is **not** committed; the CI workflow only
patches `BACKEND_IMAGE` / `FRONTEND_IMAGE` into it):

```env
# --- Required by backend ---
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/vedaai?appName=db
REDIS_URL=redis://redis:6379
JWT_SECRET=<a-32-byte-random-string>
AWS_ACCESS_KEY_ID=<for-bedrock>
AWS_SECRET_ACCESS_KEY=<for-bedrock>
AWS_DEFAULT_REGION=us-east-1
CORS_ORIGIN=http://<elastic-ip-or-domain>

# --- Required by frontend at BUILD time (baked into the image by CI) ---
NEXT_PUBLIC_API_URL=http://<elastic-ip-or-domain>
NEXT_PUBLIC_WS_URL=http://<elastic-ip-or-domain>

# --- Image tags (CI overwrites these on each deploy) ---
BACKEND_IMAGE=ghcr.io/<owner>/<repo>-backend:latest
FRONTEND_IMAGE=ghcr.io/<owner>/<repo>-frontend:latest
```

`MONGODB_URI` — add the Elastic IP to MongoDB Atlas → Network Access allowlist.

`JWT_SECRET` — generate one once: `openssl rand -hex 32`.

**`CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`** all point at the
public URL of the host. Since nginx terminates traffic and routes `/api/*` and
`/socket.io/*` to the backend internally, these are all the same value.

---

## 4. Log in to GHCR on the EC2 host

GitHub Container Registry is private by default. Create a **classic Personal
Access Token** with the `read:packages` scope (GitHub → Settings → Developer
Settings → Tokens). On the EC2 host:

```bash
echo <PAT> | docker login ghcr.io -u <github-username> --password-stdin
```

This persists creds to `~/.docker/config.json` so subsequent CI-driven pulls
work without re-login.

---

## 5. Configure GitHub repository secrets

In your GitHub repo → **Settings → Secrets and variables → Actions → New
repository secret**, add:

| Secret name             | Value                                                        |
|-------------------------|--------------------------------------------------------------|
| `EC2_HOST`              | Elastic IP or DNS of the instance                            |
| `EC2_USER`              | `ubuntu`                                                     |
| `EC2_SSH_KEY`           | Contents of your `.pem` private key (full PEM, BEGIN→END)    |
| `GHCR_USER`             | Your GitHub username                                         |
| `GHCR_TOKEN`            | The PAT from step 4 (so the workflow can re-login as needed) |
| `NEXT_PUBLIC_API_URL`   | Same value as in `.env` (public URL)                         |
| `NEXT_PUBLIC_WS_URL`    | Same value as in `.env` (public URL)                         |
| `PRODUCTION_ENV`        |  `.env` file                                                 |

`GITHUB_TOKEN` is provided automatically — you don't need to add it.

---

## 6. First deploy

Push a commit to `main` (or run the workflow manually from the Actions tab):

```bash
git push origin main
```

What happens:

1. GitHub Actions builds backend + frontend images and pushes them to
   `ghcr.io/<owner>/<repo>-{backend,frontend}:<sha>` and `:latest`.
2. The workflow SCPs `docker-compose.yml`, `docker-compose.prod.yml`, and the
   nginx config onto the EC2 host under `~/vedaai/`.
3. The workflow SSHes in, writes the new image tags into `.env`, runs
   `docker compose pull && up -d`, and prunes dangling images.

After it finishes, open `http://<elastic-ip>` — you should see the login page.

> **First-time only**: seed a teacher user. Either run `npm run seed` once
> against the Atlas cluster from your laptop (set `MONGODB_URI` in a local
> `.env`), or one-shot it on the EC2 host:
> `docker compose exec backend node dist/seed.js`

---

## 7. Operating the stack on EC2

```bash
cd ~/vedaai

# View running services
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Tail logs (all services)
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Tail one service
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend

# Restart one service
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend

# Stop everything
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Manual pull + rollout (the workflow does this for you)
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-build
```

---

## 8. (Optional) Custom domain + HTTPS via Let's Encrypt

If you have a domain pointing at the Elastic IP, you can terminate TLS at
nginx with Certbot. Quickest path: run certbot on the host (not in a
container) and bind-mount the resulting cert into the nginx container.

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d your-domain.com --agree-tos -m you@example.com

# Stop nginx first so certbot can bind :80; bring it back up after.
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop nginx
# … run certbot …
```

Then mount the cert dir and add an HTTPS server block. In
`docker-compose.prod.yml`, replace the nginx section with:

```yaml
  nginx:
    pull_policy: always
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
```

Add a second `server { listen 443 ssl; … }` block to `nginx/nginx.conf` that
loads `/etc/letsencrypt/live/your-domain.com/{fullchain,privkey}.pem` and
proxies to the same upstreams.

After switching to HTTPS, update `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, and
`NEXT_PUBLIC_WS_URL` to `https://your-domain.com` and rebuild (push a commit).

Renew with a cron entry: `0 3 * * * certbot renew --quiet --post-hook "docker compose -f /home/ubuntu/vedaai/docker-compose.yml -f /home/ubuntu/vedaai/docker-compose.prod.yml restart nginx"`.

---

## 9. Troubleshooting

| Symptom                                          | What to check                                                                 |
|--------------------------------------------------|-------------------------------------------------------------------------------|
| 502 from nginx                                   | `docker compose logs backend frontend` — is either crashing on missing env?   |
| Frontend loads but API calls 4xx CORS            | `CORS_ORIGIN` must match the URL in the browser (scheme + host)               |
| WebSocket disconnects with `xhr poll error`      | `NEXT_PUBLIC_WS_URL` set to a value that proxies `/socket.io/*` to backend?   |
| Backend logs `Missing required env var: …`       | The `.env` on EC2 is missing that key                                         |
| Worker logs `MongoServerError: ip not authorized`| Add the Elastic IP to MongoDB Atlas → Network Access                          |
| Workflow fails on `docker login`                 | `GHCR_TOKEN` PAT lacks `read:packages` (and `write:packages` if you re-use it)|
| `Cannot find module` at backend startup          | Image was built before `npm run build` succeeded — re-run the workflow        |

---

## Local development (for completeness)

The same `docker-compose.yml` runs the full stack locally:

```bash
cp .env.local .env        # then edit .env with real values
docker compose up -d --build
open http://localhost     # nginx exposes :80
```

For the standard hot-reload dev loop (no Docker), use the existing scripts
in `backend/` and `frontend/` — see `CLAUDE.md`.
