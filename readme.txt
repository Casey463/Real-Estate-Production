

#   Real Estate ADU/DADU Investment Evaluation Platform

This project is a full-stack real estate investment analysis platform built to help investors identify residential properties with strong ADU and DADU potential. The application combines geospatial browsing, API-backed property data, portfolio-style comparison workflows, and financial modeling so a user can move from market discovery to deal evaluation in a single system.

At a product level, the app is designed around one core question: which properties are worth deeper analysis for accessory dwelling unit opportunities? To answer that, the platform layers property inventory, scoring logic, heatmap-style geographic visualization, bookmark and comparison workflows, and a calculator-driven underwriting experience.

From a portfolio perspective, this codebase demonstrates frontend product engineering, backend API design, geospatial UX, data modeling, AWS infrastructure as code, containerization, and Kubernetes deployment patterns.

## What The App Does

The user journey is structured as a progressive investment workflow:

1. Browse opportunity zones on an interactive map.
2. Zoom from broad regional views into state, county, and ZIP-level property exploration.
3. Watch the property sidebar update based on the map viewport and selected geography.
4. Bookmark promising properties for later review.
5. Move bookmarked properties into a comparison workflow on the trends and calculator page.
6. Run financial projections such as NOI, CAP rate, cash-on-cash return, DSCR, equity growth, and cumulative cash flow.
7. Review results through charts, summary panels, and AI-oriented scoring concepts that support investment decision-making.

The result is a workflow that feels closer to an analyst workstation than a simple listings app.

## Product Capabilities

- Interactive heatmap-style map exploration using geographic scoring and color-coded regions.
- Dynamic property discovery tied to map zoom level and visible ZIP code boundaries.
- Sidebar-driven browsing with filters, sorting, ratings, and bookmarking.
- Property comparison workflow for saved listings.
- Investment calculator with year-by-year projections over a configurable holding period.
- Detailed visual analysis for property value growth, debt paydown, equity accumulation, and operating performance.
- Backend APIs for full listing retrieval, ZIP-code filtering, and ranked listing output.
- Supabase/PostgreSQL-backed property data with Django admin support.
- Terraform-managed AWS and Kubernetes deployment architecture.

## Frontend Architecture

The frontend lives in `real-estate-dash-remade` and is built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Radix UI primitives.

### UI and Application Structure

The homepage is a split layout: the left panel is a property sidebar and the right panel is a full interactive map. The layout is wrapped in shared providers for React Query, property state, and bookmarks, with a reusable header and navigation structure for the rest of the application.

The frontend demonstrates several practical product engineering patterns:

- Component-based App Router structure in Next.js.
- Client-side state sharing through React Context.
- Cached API data fetching through React Query.
- Custom Radix-based UI components for dialogs, sliders, tabs, sheets, tables, and form controls.
- Responsive navigation for desktop and mobile.

### Geospatial Experience

The map layer is implemented with Leaflet and React Leaflet, loaded dynamically to avoid SSR issues. Geographic overlays are rendered from GeoJSON datasets for national and county-level visualization, and ZIP boundary data is loaded for supported states including Washington, Oregon, California, and Texas.

Key geospatial behaviors include:

- Color-coded regional overlays driven by scoring logic.
- Zoom-aware rendering that changes what the user sees based on map depth.
- Viewport detection to determine which states and ZIP codes are currently on screen.
- Automatic synchronization between the map viewport and the property results shown in the sidebar.
- Property markers that change icon color based on rating thresholds.

This portion of the app highlights skills in client-side mapping, GeoJSON handling, SSR-safe browser-only rendering, and UI coordination between map state and application state.

### Property Discovery and Workflow Design

The property sidebar supports:

- Filter dialogs for price range, property type, rating thresholds, and sorting.
- Scrollable result browsing for the properties currently loaded into state.
- Rating badges and map-linked property markers.
- Bookmark toggling for shortlist creation.

Bookmarks are then promoted into a deeper evaluation flow on the trends page. Users can inspect property details, compare saved properties side by side, and then move into the underwriting tools.

### Financial Modeling UX

The trends page is organized into three major tabs:

- Properties
- Investment Calculator
- Detailed Analysis

The calculator captures operational, financing, acquisition, and growth assumptions such as:

- Monthly rent
- Vacancy rate
- Other income
- Property taxes
- Insurance
- Maintenance
- Management fee
- Utilities
- HOA fees
- Purchase price
- Loan amount
- Interest rate
- Loan term
- Closing costs
- Selling costs
- CapEx
- Appreciation
- Income growth
- Expense growth
- Tax rates
- Holding period

Using those inputs, the frontend computes and presents:

- Net operating income
- Cash flow before tax
- ROI
- CAP rate
- Cash-on-cash return
- DSCR
- Annual debt service
- Equity growth
- Cumulative cash flow
- Property value projections

The analysis views use custom SVG-based charts and visual summaries rather than relying entirely on third-party charting abstractions, which demonstrates lower-level UI composition and financial visualization work.

## Backend Architecture

The backend lives in `real-estate-backend-remade` and is built with Django 5.2, Django REST Framework, PostgreSQL connectivity, and Supabase integration.

### API Design

The backend exposes three core application endpoints:

- `/api/listings/` for paginated listing retrieval.
- `/api/listings/zipcodes/` for POST-based ZIP code filtering.
- `/api/ranked-listings/` for returning ranked investment opportunities.

The API layer is intentionally straightforward and usable by the frontend without heavy transformation. The ZIP-code endpoint is especially important because it supports the map-driven browsing model by allowing the frontend to request properties for only the visible geographic areas.

### Property Data Model

The `SupabaseListing` model maps to a large `listings` table and includes a broad set of real estate attributes:

- Address and location fields.
- Listing metadata.
- Bedrooms, bathrooms, square footage, lot size, parking, roof, and heating details.
- Pricing and tax fields.
- Agent and office data.
- Marketing remarks and descriptive text.
- Latitude, longitude, and geocoded address.

This reflects a practical skill set in handling real-world listing schemas rather than only simplified demo entities.

### Scoring Logic

The ranked-listings endpoint combines several investment-oriented signals:

- Population growth score.
- State tax advantage score.
- Property tax score.
- ADU potential score inferred from listing language.

The scoring system uses weighted logic to create a composite ranking. In its current form, it is intentionally understandable and extensible, which is useful in a demo application because it clearly shows how domain logic can be iterated into more advanced underwriting or ML-assisted scoring later.

### Supabase and Data Operations

The Django application uses PostgreSQL connection settings sourced from environment variables, allowing it to work with a Supabase-hosted database. There is also a Redfin-to-Supabase ingestion script that reads CSV exports, normalizes the data, and inserts records into the remote database.

This demonstrates:

- SaaS database integration.
- External data ingestion.
- Environment-based configuration.
- API and admin tooling over a shared property dataset.

### Backend Security and Integration Concerns

The backend is configured with:

- CORS support for the Next.js frontend.
- Environment-driven frontend and backend URL normalization.
- Dynamic host handling for local and deployed environments.
- REST pagination defaults for manageable API responses.

## Infrastructure and Deployment

The `iac` directory contains the Terraform layer for provisioning and deploying the application into AWS and Kubernetes.

### Core Infrastructure Pattern

This project supports two deployment modes:

- Managed infrastructure mode, where Terraform provisions the AWS network and EKS cluster.
- Existing cluster mode, where Terraform targets an already-created EKS cluster and deploys only application resources.

That dual-mode design is a strong portfolio signal because it shows an understanding of both greenfield infrastructure creation and enterprise-style reuse of pre-existing cluster environments.

### AWS Resources and Patterns

The Terraform code provisions or coordinates:

- VPC networking.
- Public and private subnets across multiple availability zones.
- Internet gateway and NAT gateway configuration.
- EKS cluster and node group.
- IAM roles and AWS-managed policy attachments for cluster and worker nodes.
- ECR repository integration for frontend and backend container images.
- Kubernetes secrets, deployments, and services.

The node group is configured with adjustable scaling boundaries, and the app workloads are deployed as separate frontend and backend Kubernetes deployments.

### Kubernetes Deployment Model

Each application is containerized and deployed independently:

- Frontend container serves the Next.js application on port 3000.
- Backend container serves Django on port 8000.

Both are exposed through Kubernetes `LoadBalancer` services, which makes the application directly reachable externally. The configuration also supports optional HTTPS termination through ACM certificate annotations. Secrets are managed as Kubernetes opaque secrets and injected as environment variables into the appropriate pods.

### Deployment Configuration Strategy

The Terraform design relies heavily on environment-driven values such as:

- Cluster name
- AWS region
- Image tags
- Database credentials
- Public frontend and backend URLs
- API base URL
- Optional ACM certificate ARN

This demonstrates practical deployment thinking: separating application code from environment-specific runtime settings.

## Containers and Local Development

Both the frontend and backend include Dockerfiles, and the backend includes a local docker-compose configuration for development. The backend container installs Python dependencies, exposes port 8000, and runs the Django server. The frontend container installs Node dependencies, injects the public API base URL at build time, builds the Next.js app, and serves it on port 3000.

This is useful from a portfolio standpoint because it shows the app was designed to move consistently across local development, container builds, and Kubernetes deployment.

## GitHub Actions and Delivery Signals

The visible GitHub Actions workflows in the repository currently focus on code quality and team process:

- A Biome-based code quality workflow that runs on pushes and pull requests.
- A PR template validation workflow that checks for technical overview and testing confirmation.

In addition, the Terraform README and secret contract clearly show the repository is structured for GitHub-environment-driven deployment inputs, image tagging, and EKS targeting. Even where the full deployment workflow file is not visible in the current workspace, the infrastructure layer is explicitly shaped for CI/CD-driven container deployment into AWS.

## Skills Demonstrated

This project showcases a broad range of engineering skills:

- Full-stack product development across Next.js, Django, and PostgreSQL.
- Geospatial UI engineering with Leaflet, GeoJSON, ZIP overlays, and map-synchronized search behavior.
- Frontend architecture using React Context, React Query, custom hooks, and reusable UI primitives.
- Financial modeling and investment analysis UX.
- Domain-specific scoring logic for ADU and DADU opportunity evaluation.
- SaaS integration with Supabase.
- Data ingestion from external real estate exports.
- Docker-based containerization.
- Terraform-based AWS and Kubernetes infrastructure design.
- EKS deployment patterns with secrets, image tags, TLS support, and cluster reuse.
- CI quality checks and workflow governance through GitHub Actions.

## Why This Project Matters

This application is more than a CRUD demo. It combines product thinking, spatial data, financial analysis, and cloud deployment into a workflow that mirrors how investors actually evaluate opportunities. It demonstrates the ability to build not just isolated features, but an integrated decision-support system with clear business value.

For a portfolio, that means this project shows competency in:

- Building a polished user-facing experience.
- Structuring a backend around real data and usable APIs.
- Designing cloud infrastructure that can scale beyond local development.
- Translating business use cases into technical workflows end to end.
