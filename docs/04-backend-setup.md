# HayDing - Backend Setup

## Goal

This document describes the initial Spring Boot backend setup for HayDing.

---

# 1. Backend Technology Stack

The backend uses:

```text
Java 17
Spring Boot
Maven
Spring Web
Spring Data JPA
Spring Security
Validation
MySQL Driver
H2 Database
Lombok
Spring Boot DevTools
```

---

# 2. Backend Location

The backend project is located inside:

```text
HayDing-project/backend
```

Main files:

```text
backend/pom.xml
backend/src/main/java/com/hayding/BackendApplication.java
backend/src/main/resources/application.properties
```

---

# 3. Current Packages

```text
com.hayding
com.hayding.common
com.hayding.config
com.hayding.health
```

---

# 4. Health Endpoint

A first public health endpoint was created:

```text
GET /api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Backend is running successfully",
  "data": {
    "status": "UP",
    "app": "HayDing Backend",
    "version": "0.0.1"
  },
  "timestamp": "..."
}
```

---

# 5. Current Security Setup

Spring Security is enabled.

For now, these endpoints are public:

```text
/api/health
/h2-console/**
```

All other endpoints require authentication later.

---

# 6. Current Development Database

The current development database is H2 in-memory:

```properties
spring.datasource.url=jdbc:h2:mem:hayding_db
spring.datasource.username=sa
spring.datasource.password=
```

H2 console:

```text
http://localhost:8080/h2-console
```

---

# 7. Important Notes

This setup is only the first backend foundation.

Next backend steps:

```text
Create base packages
Create enums
Create User entity
Create Category entity
Create Product entity
Create repositories
Create DTOs
Create services
Create controllers
```

---

# 8. Next Step

The next document will be:

```text
05-backend-domain-foundation.md
```

It will define:

- Core packages
- Enums
- Base entity strategy
- User entity
- Category entity
- Product entity