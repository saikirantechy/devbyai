# Marketplace — Skills System

Once official skills are working, introduce community distribution.

---

## Marketplace Screens

| Screen | Purpose |
|--------|---------|
| Discover skills | Search, categories, featured and trending skills |
| Skill details | Instructions, versions, compatibility, publisher and trust status |
| Publish a skill | Upload, validate, version and submit for review |
| Installed skills | Enable, disable, update, pin and uninstall |

---

## Marketplace API Design

| Endpoint | Description |
|----------|-------------|
| `GET /api/skills` | List skills |
| `GET /api/skills/:slug` | Get skill details |
| `GET /api/skills/:slug/versions` | List skill versions |
| `POST /api/skills` | Create a skill |
| `POST /api/skills/:id/versions` | Upload a new version |
| `POST /api/skills/:id/publish` | Publish a skill |
| `POST /api/skills/:id/install` | Install a skill |
| `DELETE /api/skills/:id/install` | Uninstall a skill |
| `GET /api/skills/installed` | List user's installed skills |
| `PATCH /api/skills/installed/:id` | Update installed skill settings |
| `POST /api/skills/:id/reviews` | Add a review |
| `POST /api/skills/:id/report` | Report a skill |
| `GET /api/skills/:id/security-report` | Get security report |

Use pagination, authentication, authorization, rate limits, and publisher ownership checks for these endpoints.

---

## Marketplace Recommendation

Keep the **first marketplace release simple**:

- Official skills
- Community skill submissions
- Search and categories
- Version history
- Install and uninstall
- Publisher information
- Security and compatibility status

Add ratings, recommendations, and advanced discovery after you have enough real usage.