# HayDing Marketplace

## Project Status

This project is currently under active development.

Current status:

```text
Backend MVP foundation: DONE
Frontend: NOT STARTED YET
```

Last completed backend stage:

```text
Seed Data + CORS configuration
```

Next planned stage:

```text
React Frontend Setup
```

---

# 1. Project Idea

HayDing is a multilingual marketplace web application for buying and selling new and used items in Germany.

The project is inspired by marketplace platforms such as Vinted, but it has its own identity, name, slogan, structure, and technical architecture.

The main idea is:

```text
One user account can be used for both buying and selling.
```

There are no separate buyer and seller accounts.

Every normal user can:

- Register
- Login
- Add products
- Sell products
- Buy or request products
- Save products as favorites
- Send messages
- Create reports
- Manage own products

Admin users have additional platform management permissions.

---

# 2. Brand

## Project name

```text
HayDing
```

## Slogan

```text
Was du hast, sucht jemand.
```

## Meaning

The slogan means:

```text
What you have, someone is looking for.
```

The name and slogan are currently accepted for development, but they can still be changed later.

Important note:

```text
The brand name and slogan should not be hardcoded everywhere.
They should later be placed in frontend config and i18n files.
```

---

# 3. Target Market

The first target country is:

```text
Germany
```

The application should support:

```text
German
Arabic
English
```

Arabic requires RTL support later in the frontend.

---

# 4. Main User Types

## Guest User

A guest user can:

- View public products
- View product details
- View categories
- Register
- Login

A guest user cannot:

- Add products
- Add favorites
- Send requests
- Send messages
- Create reports
- Access profile
- Access admin endpoints

---

## Normal User

A normal user has:

```text
role = USER
```

A normal user can:

- Buy and sell from the same account
- Create products
- Manage own products
- Add other users’ products to favorites
- Send purchase requests
- Send and receive messages
- Report products, users, or messages
- View own conversations
- View own sent and received requests

A normal user cannot:

- Access admin endpoints
- Manage categories
- View all reports
- Moderate the platform

---

## Admin User

An admin user has:

```text
role = ADMIN
```

An admin is not a separate table.  
Admin users are stored in the same `users` table as normal users.

The difference is only the role:

```text
USER
ADMIN
```

The admin exists to manage and protect the platform.

Admin can:

- Manage categories
- View reports
- Review reports
- Resolve reports
- Reject reports
- Access `/api/admin/**`
- Later: manage users and products

---

# 5. Technology Stack

## Backend

```text
Java 17
Spring Boot
Spring Web
Spring Data JPA
Spring Security
JWT
Bean Validation
Maven
H2 Database for development
MySQL planned for production
Lombok dependency exists, but most code currently uses explicit getters/setters
```

## Frontend

Frontend is not started yet.

Planned stack:

```text
React
Vite
JavaScript
React Router DOM
CSS
Fetch API or Axios
Responsive Design
Multilingual UI
RTL support for Arabic
```

## Tools

```text
IntelliJ IDEA
Postman
Git
GitHub
H2 Console
Docker later
```

---

# 6. Current Project Structure

Current root structure:

```text
HayDing-project/
  backend/
  frontend/
  docs/
  README.md
```

Backend structure:

```text
backend/
  pom.xml
  src/
    main/
      java/
        com/
          hayding/
            BackendApplication.java
            admin/
            auth/
            category/
            common/
            config/
            favorite/
            health/
            message/
            monetization/
            payment/
            product/
            report/
            request/
            security/
            user/
      resources/
        application.properties
```

---

# 7. Documentation Files Created

Inside `docs/` we created:

```text
01-project-identity.md
02-requirements-and-pages.md
03-database-design.md
04-backend-setup.md
```

## 01-project-identity.md

Contains:

- Brand name
- Slogan
- Project idea
- Target country
- Languages
- MVP scope
- Future features
- Payment strategy
- Monetization strategy

## 02-requirements-and-pages.md

Contains:

- User types
- Public pages
- Protected user pages
- Admin pages
- Frontend components plan
- Backend modules
- Entities
- API areas
- MVP priorities
- Development order

## 03-database-design.md

Contains:

- Tables
- Relationships
- Entities
- SQL draft
- Indexes
- Payment-ready fields
- Monetization-ready fields

## 04-backend-setup.md

Contains:

- Spring Boot setup
- Dependencies
- Current packages
- Health endpoint
- H2 setup
- Security setup notes

---

# 8. Backend Packages

Current backend packages:

```text
com.hayding.admin
com.hayding.auth
com.hayding.category
com.hayding.common
com.hayding.config
com.hayding.favorite
com.hayding.health
com.hayding.message
com.hayding.monetization
com.hayding.payment
com.hayding.product
com.hayding.report
com.hayding.request
com.hayding.security
com.hayding.user
```

---

# 9. Enums Created

Inside:

```text
com.hayding.common.enums
```

We created:

```text
UserRole
ProductCondition
ProductStatus
RequestStatus
PaymentProvider
PaymentStatus
ReportStatus
ReportTargetType
```

## UserRole

```text
USER
ADMIN
```

## ProductCondition

```text
NEW
LIKE_NEW
GOOD
ACCEPTABLE
USED
```

## ProductStatus

```text
ACTIVE
RESERVED
SOLD
DELETED
HIDDEN
```

## RequestStatus

```text
PENDING
ACCEPTED
REJECTED
CANCELLED
COMPLETED
```

## PaymentProvider

```text
NONE
STRIPE
PAYPAL
```

## PaymentStatus

```text
NOT_REQUIRED
PENDING
PAID
FAILED
REFUNDED
CANCELLED
```

## ReportStatus

```text
OPEN
REVIEWED
RESOLVED
REJECTED
```

## ReportTargetType

```text
PRODUCT
USER
MESSAGE
```

---

# 10. Entities Created

The backend currently has these JPA entities:

```text
User
Category
Product
ProductImage
Favorite
Request
Conversation
Message
Report
```

---

## 10.1 User

Package:

```text
com.hayding.user.model.User
```

Table:

```text
users
```

Purpose:

Stores all users.

Important fields:

```text
id
fullName
email
password
city
preferredLanguage
role
enabled
createdAt
updatedAt
```

Notes:

- Passwords are stored hashed using BCrypt.
- Email is unique.
- A user can be either USER or ADMIN.
- The same account can buy and sell.

---

## 10.2 Category

Package:

```text
com.hayding.category.model.Category
```

Table:

```text
categories
```

Purpose:

Stores marketplace categories in three languages.

Important fields:

```text
id
nameDe
nameAr
nameEn
slug
active
createdAt
updatedAt
```

---

## 10.3 Product

Package:

```text
com.hayding.product.model.Product
```

Table:

```text
products
```

Purpose:

Stores products listed by users.

Important fields:

```text
id
title
description
price
city
conditionStatus
productStatus
seller
category
featured
featuredUntil
boostScore
boostedUntil
createdAt
updatedAt
```

Future monetization fields already included:

```text
featured
featuredUntil
boostScore
boostedUntil
```

---

## 10.4 ProductImage

Package:

```text
com.hayding.product.model.ProductImage
```

Table:

```text
product_images
```

Purpose:

Stores product image URLs.

Important fields:

```text
id
imageUrl
product
mainImage
sortOrder
createdAt
```

---

## 10.5 Favorite

Package:

```text
com.hayding.favorite.model.Favorite
```

Table:

```text
favorites
```

Purpose:

Stores saved/favorited products for users.

Important fields:

```text
id
user
product
createdAt
```

Important rule:

```text
A user cannot favorite the same product twice.
A user cannot favorite their own product.
```

---

## 10.6 Request

Package:

```text
com.hayding.request.model.Request
```

Table:

```text
requests
```

Purpose:

Represents buyer interest or purchase request for a product.

Important fields:

```text
id
buyer
seller
product
status
message
productPrice
platformFee
buyerProtectionFee
sellerAmount
paymentStatus
paymentProvider
buyerProtectionEnabled
createdAt
updatedAt
```

Future payment fields already included:

```text
productPrice
platformFee
buyerProtectionFee
sellerAmount
paymentStatus
paymentProvider
buyerProtectionEnabled
```

Initial payment defaults:

```text
paymentProvider = NONE
paymentStatus = NOT_REQUIRED
buyerProtectionEnabled = false
platformFee = 0
buyerProtectionFee = 0
```

---

## 10.7 Conversation

Package:

```text
com.hayding.message.model.Conversation
```

Table:

```text
conversations
```

Purpose:

Represents a conversation between buyer and seller about a product.

Important fields:

```text
id
product
buyer
seller
createdAt
updatedAt
```

Important rule:

```text
One buyer and one seller can have only one conversation per product.
```

---

## 10.8 Message

Package:

```text
com.hayding.message.model.Message
```

Table:

```text
messages
```

Purpose:

Stores messages inside conversations.

Important fields:

```text
id
conversation
sender
content
read
createdAt
```

---

## 10.9 Report

Package:

```text
com.hayding.report.model.Report
```

Table:

```text
reports
```

Purpose:

Stores user reports.

Users can report:

```text
PRODUCT
USER
MESSAGE
```

Important fields:

```text
id
reporter
targetType
targetId
reason
details
status
createdAt
updatedAt
```

---

# 11. Repositories Created

Repositories currently exist for:

```text
UserRepository
CategoryRepository
ProductRepository
ProductImageRepository
FavoriteRepository
RequestRepository
ConversationRepository
MessageRepository
ReportRepository
```

---

# 12. DTOs Created

## Common DTOs

```text
ApiResponse
```

Package:

```text
com.hayding.common.dto.ApiResponse
```

All API responses use this shape:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "timestamp": "..."
}
```

or:

```json
{
  "success": false,
  "message": "...",
  "data": {},
  "timestamp": "..."
}
```

---

## Auth DTOs

Package:

```text
com.hayding.auth.dto
```

Created:

```text
RegisterRequest
LoginRequest
AuthResponse
```

---

## User DTOs

Package:

```text
com.hayding.user.dto
```

Created:

```text
UserResponse
```

Important:

```text
UserResponse does not expose password.
```

---

## Category DTOs

Package:

```text
com.hayding.category.dto
```

Created:

```text
CategoryCreateRequest
CategoryResponse
```

---

## Product DTOs

Package:

```text
com.hayding.product.dto
```

Created:

```text
ProductCreateRequest
ProductUpdateRequest
ProductResponse
ProductImageResponse
```

---

## Request DTOs

Package:

```text
com.hayding.request.dto
```

Created:

```text
CreateRequestDto
RequestResponse
```

---

## Message DTOs

Package:

```text
com.hayding.message.dto
```

Created:

```text
CreateConversationRequest
SendMessageRequest
ConversationResponse
MessageResponse
```

---

## Report DTOs

Package:

```text
com.hayding.report.dto
```

Created:

```text
CreateReportRequest
ReportResponse
```

---

# 13. Security

## Current Security Features

Implemented:

```text
Spring Security
BCrypt password hashing
JWT token generation
JWT authentication filter
Stateless session policy
Protected endpoints
Admin role protection
CORS configuration for React
```

---

## Public Endpoints

Currently public:

```text
GET /api/health
POST /api/auth/register
POST /api/auth/login
GET /api/categories
GET /api/products
GET /api/products/{id}
GET /h2-console/**
```

---

## Protected User Endpoints

Require valid JWT token:

```text
GET /api/auth/me

POST /api/products
GET /api/products/my
PUT /api/products/{id}
PATCH /api/products/{id}/mark-sold
DELETE /api/products/{id}

POST /api/favorites/{productId}
GET /api/favorites
DELETE /api/favorites/{productId}

POST /api/requests
GET /api/requests/sent
GET /api/requests/received
PATCH /api/requests/{id}/accept
PATCH /api/requests/{id}/reject
PATCH /api/requests/{id}/cancel
PATCH /api/requests/{id}/complete

POST /api/conversations
GET /api/conversations
GET /api/conversations/{id}/messages
POST /api/conversations/{id}/messages

POST /api/reports
```

---

## Admin Endpoints

Require JWT token with:

```text
role = ADMIN
```

Protected pattern:

```text
/api/admin/**
```

Current admin endpoints:

```text
POST /api/admin/categories
GET /api/admin/reports
GET /api/admin/reports/open
PATCH /api/admin/reports/{id}/review
PATCH /api/admin/reports/{id}/resolve
PATCH /api/admin/reports/{id}/reject
```

---

# 14. JWT

## JWT Service

Package:

```text
com.hayding.security.JwtService
```

JWT currently contains:

```text
subject = user email
userId
role
issuedAt
expiration
```

The expiration is configured in:

```text
application.properties
```

Current settings:

```properties
app.jwt.secret=HayDingSuperSecretKeyForDevelopmentOnlyChangeLater123456789
app.jwt.expiration-ms=86400000
```

Important:

```text
The current JWT secret is for development only.
It must be changed for production.
```

---

# 15. Authentication

## Register

Endpoint:

```text
POST /api/auth/register
```

Body example:

```json
{
  "fullName": "Test User",
  "email": "test@test.com",
  "password": "12345678",
  "city": "Berlin",
  "preferredLanguage": "de"
}
```

Result:

```text
Creates a USER account.
Password is hashed using BCrypt.
```

---

## Login

Endpoint:

```text
POST /api/auth/login
```

Body example:

```json
{
  "email": "test@test.com",
  "password": "12345678"
}
```

Returns:

```text
JWT token
UserResponse
tokenType = Bearer
```

---

## Current User

Endpoint:

```text
GET /api/auth/me
```

Requires:

```text
Authorization: Bearer TOKEN
```

Returns current user from JWT.

---

# 16. Health Endpoint

Endpoint:

```text
GET /api/health
```

Returns:

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

# 17. Category API

## Public: Get categories

```text
GET /api/categories
```

Returns active categories.

## Admin: Create category

```text
POST /api/admin/categories
```

Requires ADMIN token.

Body:

```json
{
  "nameDe": "Elektronik",
  "nameAr": "إلكترونيات",
  "nameEn": "Electronics",
  "slug": "electronics"
}
```

---

# 18. Product API

## Get active products

```text
GET /api/products
```

Public endpoint.

Returns only:

```text
ACTIVE
```

products.

---

## Get product details

```text
GET /api/products/{id}
```

Public endpoint.

---

## Create product

```text
POST /api/products
```

Requires token.

Body:

```json
{
  "title": "iPhone 13 Pro",
  "description": "Gebrauchtes iPhone in gutem Zustand.",
  "price": 550.00,
  "city": "Berlin",
  "conditionStatus": "GOOD",
  "categoryId": 1,
  "imageUrls": [
    "https://example.com/iphone-front.jpg",
    "https://example.com/iphone-back.jpg"
  ]
}
```

---

## Get my products

```text
GET /api/products/my
```

Requires token.

Returns products owned by current user.

---

## Update product

```text
PUT /api/products/{id}
```

Requires token.

Only owner can update own product.

---

## Mark product as sold

```text
PATCH /api/products/{id}/mark-sold
```

Requires token.

Only owner can mark own product as SOLD.

---

## Delete product

```text
DELETE /api/products/{id}
```

Requires token.

This is a soft delete.

It sets:

```text
productStatus = DELETED
```

---

# 19. Favorite API

## Add favorite

```text
POST /api/favorites/{productId}
```

Requires token.

Rules:

```text
User cannot favorite own product.
User cannot favorite the same product twice.
Only ACTIVE products can be favorited.
```

---

## Get favorites

```text
GET /api/favorites
```

Requires token.

Returns current user’s favorite products.

---

## Remove favorite

```text
DELETE /api/favorites/{productId}
```

Requires token.

---

# 20. Request API

Requests represent buyer interest or purchase request.

## Create request

```text
POST /api/requests
```

Requires buyer token.

Body:

```json
{
  "productId": 1,
  "message": "Hallo, ist das noch verfügbar?"
}
```

Rules:

```text
Buyer cannot request own product.
Buyer cannot send duplicate request for same product.
Only ACTIVE products can receive requests.
```

---

## Get sent requests

```text
GET /api/requests/sent
```

Requires token.

Returns requests sent by current user.

---

## Get received requests

```text
GET /api/requests/received
```

Requires token.

Returns requests received by current user as seller.

---

## Accept request

```text
PATCH /api/requests/{id}/accept
```

Requires seller token.

Effects:

```text
Request status becomes ACCEPTED.
Product status becomes RESERVED.
```

---

## Reject request

```text
PATCH /api/requests/{id}/reject
```

Requires seller token.

Effects:

```text
Request status becomes REJECTED.
```

---

## Cancel request

```text
PATCH /api/requests/{id}/cancel
```

Requires buyer token.

Effects:

```text
Request status becomes CANCELLED.
If product was RESERVED, product becomes ACTIVE again.
```

---

## Complete request

```text
PATCH /api/requests/{id}/complete
```

Requires seller token.

Effects:

```text
Request status becomes COMPLETED.
Product status becomes SOLD.
```

---

# 21. Messaging API

Messaging is not real-time yet.  
It is REST-based for MVP.

## Create or get conversation

```text
POST /api/conversations
```

Requires buyer token.

Body:

```json
{
  "productId": 1
}
```

Rules:

```text
Seller cannot create conversation on own product.
One buyer/seller/product conversation only.
```

---

## Get my conversations

```text
GET /api/conversations
```

Requires token.

Returns conversations where the current user is buyer or seller.

---

## Get messages

```text
GET /api/conversations/{id}/messages
```

Requires token.

Only participants can access.

---

## Send message

```text
POST /api/conversations/{id}/messages
```

Requires token.

Body:

```json
{
  "content": "Hallo, ist das noch verfügbar?"
}
```

Only participants can send messages.

---

# 22. Report API

Users can report:

```text
PRODUCT
USER
MESSAGE
```

## Create report

```text
POST /api/reports
```

Requires token.

Body example:

```json
{
  "targetType": "PRODUCT",
  "targetId": 1,
  "reason": "Fake product",
  "details": "The product description looks suspicious."
}
```

Rules:

```text
Reported target must exist.
```

---

## Admin: Get all reports

```text
GET /api/admin/reports
```

Requires ADMIN token.

---

## Admin: Get open reports

```text
GET /api/admin/reports/open
```

Requires ADMIN token.

---

## Admin: Mark report as reviewed

```text
PATCH /api/admin/reports/{id}/review
```

Requires ADMIN token.

---

## Admin: Resolve report

```text
PATCH /api/admin/reports/{id}/resolve
```

Requires ADMIN token.

---

## Admin: Reject report

```text
PATCH /api/admin/reports/{id}/reject
```

Requires ADMIN token.

---

# 23. Global Exception Handling

Package:

```text
com.hayding.common.exception.GlobalExceptionHandler
```

Handles:

```text
IllegalArgumentException
Validation errors
General server errors
```

Example error response:

```json
{
  "success": false,
  "message": "Bad request",
  "data": {
    "error": "Email is already in use"
  },
  "timestamp": "..."
}
```

Validation example:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "must be a well-formed email address",
    "password": "size must be between 8 and 100"
  },
  "timestamp": "..."
}
```

---

# 24. Seed Data

Package:

```text
com.hayding.config.DataSeeder
```

Seed data is created automatically on application startup.

## Default Admin User

```text
Email: admin@hayding.com
Password: Admin123456
Role: ADMIN
City: Berlin
Language: de
```

Important:

```text
This is for development only.
Admin credentials must be changed before production.
```

---

## Default Categories

Created automatically:

```text
Elektronik / إلكترونيات / Electronics
Möbel / أثاث / Furniture
Kleidung / ملابس / Clothing
Schuhe / أحذية / Shoes
Haushalt / أدوات منزلية / Household
Bücher / كتب / Books
Spielzeug / ألعاب / Toys
Sport / رياضة / Sports
Kinder / أطفال / Kids
Sonstiges / أخرى / Other
```

---

# 25. CORS

CORS is configured in:

```text
com.hayding.config.SecurityConfig
```

Allowed frontend origins:

```text
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
http://127.0.0.1:3000
```

Allowed methods:

```text
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Allowed headers:

```text
Authorization
Content-Type
```

This prepares the backend for React + Vite.

---

# 26. H2 Database

Current development database:

```properties
spring.datasource.url=jdbc:h2:mem:hayding_db
spring.datasource.username=sa
spring.datasource.password=
```

H2 Console:

```text
http://localhost:8080/h2-console
```

Important:

```text
H2 is in-memory.
Data resets when the backend restarts.
Seed data recreates admin and categories automatically.
```

---

# 27. Current application.properties

Current important configuration includes:

```properties
spring.application.name=hayding-backend

server.port=8080

spring.datasource.url=jdbc:h2:mem:hayding_db
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

app.jwt.secret=HayDingSuperSecretKeyForDevelopmentOnlyChangeLater123456789
app.jwt.expiration-ms=86400000
```

---

# 28. Important Business Rules Implemented

## User

```text
One account can buy and sell.
Password is hashed.
Email must be unique.
```

## Product

```text
Only seller can update own product.
Only seller can delete own product.
Only seller can mark own product as sold.
Deleted products are soft-deleted.
Public list shows only ACTIVE products.
```

## Favorite

```text
User cannot favorite own product.
User cannot favorite same product twice.
Only active products can be favorited.
```

## Request

```text
Buyer cannot request own product.
Buyer cannot request same product twice.
Seller can accept or reject.
Accepted request reserves product.
Completed request marks product as sold.
Cancelled accepted request makes product active again.
```

## Messaging

```text
Only buyer and seller participants can access conversation.
Seller cannot open conversation on own product.
One conversation per buyer/seller/product.
```

## Reports

```text
Users can report product, user, or message.
Reported target must exist.
Admin can review, resolve, or reject reports.
```

## Admin

```text
Only ADMIN role can access /api/admin/**
Normal USER receives 403 Forbidden.
```

---

# 29. Payment and Monetization Preparation

Payment is not implemented yet.

However, the backend is designed to support payment later.

Already prepared fields:

```text
paymentProvider
paymentStatus
buyerProtectionEnabled
platformFee
buyerProtectionFee
sellerAmount
```

Possible future integrations:

```text
Stripe Connect
PayPal Marketplace
Buyer Protection
Platform Commission
Refunds
Invoices
Seller Payouts
```

Monetization is also not active yet.

Prepared product fields:

```text
featured
featuredUntil
boostScore
boostedUntil
```

Future monetization options:

```text
Featured products
Product boosting
Seller subscriptions
Buyer protection fee
Platform commission
Ads later
```

---

# 30. Tested Scenarios

The following scenarios were tested manually using Postman:

```text
Health endpoint
User registration
Login
JWT token generation
Current user /me
Category creation
Public category listing
Product creation
Public product listing
Product details
My products
Update product
Mark product as sold
Soft delete product
Favorites add/list/remove
Prevent duplicate favorite
Prevent favoriting own product
Requests sent/received
Accept request
Complete request
Product status RESERVED and SOLD
Messaging conversation creation
Sending messages as buyer and seller
Fetching messages
Fetching conversations
Prevent seller conversation on own product
Report creation
Admin report listing
Review report
Resolve report
Admin role protection
Seed admin login
Seed categories
CORS configuration
```

---

# 31. Current Git Status

The backend work has been committed and pushed to GitHub after each major stage.

Important commit stages included:

```text
Initialize HayDing project documentation
Add requirements and pages documentation
Add database design documentation
Set up Spring Boot backend with health endpoint
Document backend setup
Add backend package structure and core enums
Add user entity and repository
Add category entity and repository
Add product entity and repository
Add product image entity and repository
Add favorite entity and repository
Add request entity and repository
Add conversation and message entities
Add report entity and repository
Add DTO foundation
Add response DTOs for products requests and messages
Add request DTOs
Add registration service and endpoint
Add global exception handler
Add login endpoint with JWT token generation
Add JWT authentication filter and current user endpoint
Add category API endpoints
Add product create and read API endpoints
Add product management endpoints
Add favorite API endpoints
Add request API endpoints
Add messaging API endpoints
Add report API endpoints
Protect admin endpoints with admin role
Add seed data and CORS configuration
```

---

# 32. Next Planned Stage

The next stage is:

```text
Frontend Setup
```

Planned frontend steps:

```text
Create React + Vite app inside frontend/
Install React Router DOM
Create folder structure
Create brand config
Create API client
Create auth service
Create AuthContext
Create routes
Create layout
Create pages:
  Home
  Products
  Product Details
  Login
  Register
Create first connection to backend
```

Backend base URL:

```text
http://localhost:8080
```

Frontend planned dev URL:

```text
http://localhost:5173
```

---

# 33. To Be Continued

This README will be updated as the project continues.

Next update should include:

```text
Frontend setup
Frontend routing
Auth pages
Product listing UI
Product details UI
Login/Register integration
Protected routes
Responsive layout
Multilingual UI
RTL support
```

```text
يتبع...
```