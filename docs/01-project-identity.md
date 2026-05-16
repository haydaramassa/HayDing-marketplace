# HayDing - Project Identity

## Brand Name
HayDing

## Slogan
Was du hast, sucht jemand.

## Project Type
A multilingual marketplace web application for buying and selling new and used items in Germany.

## Target Country
Germany

## Target Users
People living in Germany who want to sell, buy, or discover everyday items easily.

## Languages
- German
- Arabic
- English

## Main Idea
HayDing allows users to create one account and use it for both selling and buying.

Users can:
- Create an account
- Log in
- Add products
- Browse products
- Search and filter products
- Save favorite products
- Contact sellers
- Manage their products
- Manage purchase and sale requests

## Account Model
One user account can act as both buyer and seller.

Roles:
- USER
- ADMIN

## MVP Scope
The first version should include:
- Authentication
- User profile
- Product listings
- Product details
- Add/edit/delete own products
- Product images
- Categories
- Search and filters
- Favorites
- Basic order/request system
- Basic messaging or contact system
- Admin dashboard
- Multilingual UI
- Responsive design

## Future Features
The system should be designed to support later:
- Online payments
- Stripe Connect
- PayPal Marketplace
- Buyer protection
- Platform fees
- Featured products
- Product boosting
- Seller subscriptions
- Reviews and ratings
- Real-time chat
- Mobile app or PWA

## Monetization
Not active in the first version.

Future monetization options:
- Featured products
- Product boosting
- Seller Pro accounts
- Buyer protection fee
- Platform commission
- Ads later if needed

## Payment Strategy
Online payment will not be implemented in the first MVP.

However, the backend and database should be designed to support future payment integration.

Initial payment values:
- paymentProvider = NONE
- paymentStatus = NOT_REQUIRED
- buyerProtectionEnabled = false
- platformFee = 0
- buyerProtectionFee = 0

## Design Direction
The design should be:
- Modern
- Clean
- Mobile-first
- Friendly
- German-readable
- Simple for beginners
- Professional but not complicated

## Temporary Brand Decision
The current name and slogan are approved for development but can be changed later.

Brand name and slogan should be stored in frontend config/i18n files, not hardcoded everywhere.