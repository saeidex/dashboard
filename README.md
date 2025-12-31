بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ

<p dir="rtl">Dashboards</p>

## Run on a single PC (without Docker)

When you are the only person using the dashboard on your own computer, you can keep everything lightweight and skip containers entirely. The API serves the SQLite database from the local filesystem and the web client ships a static build that runs in a browser.

👉 For a full walkthrough that covers prerequisite installs, directory layout, PM2 boot configuration, updates, and backups, read [`docs/self-hosting-guide.md`](./docs/self-hosting-guide.md).

## References

Template: [@satnaing](https://github.com/satnaing)

# Changelog

## v1.0.0 (2025-12-31)

### Feat

- add No* components for handling empty states in various features
- add NoCategories component
- implement customer-specific order management and routing
- refactor product dimensions to sizes
- update order ID type to number and ensure string conversion in related components
- update order schema and calculations
- :sparkles: implent dashboard kpi's
- :sparkles: add dnd for categories and dimensions grid items
- :sparkles: product dimensions (volume)
- :sparkles: add support for multiple color themes
- :sparkles: implement onboarding
- :rocket: add Docker support with configuration for API and web services, including backup script and self-hosting guide
- **api**: api routes authentication
- **web**: route protections
- Enhance invoice printing with monochrome support and expand/collapse functionality
- orders api integration
- **api**: better auth
- better auth
- Users api integration
- expenses api integration
- vendors api integrations
- **web**: employees api integration
- monorepo structure setup and new packages
- api
- download order
- Dashboard matrics
- orders
- expenses
- vendors
- settings display implementation
- categories route
- product categories
- update sidebar and app title for branding and navigation improvements
- employees
- products

### Fix

- **api**: user role schema type defination
- overview & expnese bar graph
- **web**: order table row actions
- stock out calculation on form submit
- dropdown menu item options selection conficts with dnd
- light mode color schema change
- :bug: checking user permission for create action and handle server error in auth form
- tiny little error
- **web**: product bulk actions
- hidding nested sidebar items
- employee postion

### Refactor

- removes multiple .env, makes centralized .env
- NoCustomers component
- rename basePrice to retailPrice in orders and products schemas
- remove discounts
- :recycle: fetching user session to check user authentication
- replace users schema with betterAuth generated table and user handiing, role management logics
- schma notNull properties
- customers table data handling
- employees table data handling
- products feature
- implement loder for product route, remove: static categories
- implement loder for product route, remove: static categories
- rename vendor into customer
- update  tsconfig.json for consistency
- ui tweaks
- restructure expense feature and small changes
- product table
- update product schema and ui
- tiny things
- errors
- vendor & schema
- settings in sidebar
- simplifiy delete employee
- hidding  software users from the sidebar
- rename employee table fullName to name column
- generialize header
- update sidebar icons
