# Real Estate ADU/DADU Investment Evaluation Platform

This project is a full-stack real estate investment analysis platform built for investors evaluating residential properties for ADU and DADU potential. It combines map-based market exploration, API-backed property search, shortlist comparison, and financial underwriting in a single workflow.

This project demonstrates product-focused frontend engineering, backend API design, geospatial UX, cloud infrastructure, and deployment automation.

## Product Summary

The app guides a user through a practical investment workflow:

1. Explore markets through a color-coded interactive map.
2. Zoom into states, counties, and ZIP-level areas of interest.
3. Review dynamically loaded properties in a synchronized sidebar.
4. Bookmark promising listings for deeper review.
5. Compare shortlisted properties on a dedicated analysis page.
6. Run financial projections including NOI, CAP rate, cash-on-cash return, DSCR, and long-term equity growth.

The goal is to turn early-stage property discovery into a more structured investment decision process.

## Key Features

- Interactive geospatial browsing with heatmap-style regional scoring.
- ZIP-driven property retrieval tied to the current map viewport.
- Property filtering, sorting, bookmarking, and comparison workflows.
- Investment calculator with multi-year projections and chart-based analysis.
- Django REST API backed by Supabase-hosted PostgreSQL data.
- Terraform-managed AWS and Kubernetes deployment model.

<details>
<summary><strong>Frontend</strong></summary>

## Frontend

The frontend is built in `real-estate-dash-remade` with Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Leaflet, and React Query.

Key implementation highlights:

- Split-screen map and property browsing experience.
- React Context plus React Query for shared state and cached API access.
- Dynamic Leaflet map loading to avoid SSR issues.
- GeoJSON overlays for national, county, and ZIP-based visualization.
- Bookmark and comparison workflows that carry users from browsing into underwriting.
- Calculator and analysis views that compute and render investment metrics with custom visualizations.

This part of the project demonstrates frontend architecture, state management, responsive UI composition, and geospatial interaction design.

</details>

<details>
<summary><strong>Backend</strong></summary>

## Backend

The backend is built in `real-estate-backend-remade` with Django 5.2, Django REST Framework, PostgreSQL connectivity, and Supabase integration.

Core backend capabilities:

- Paginated listing API for frontend property browsing.
- ZIP-code filtering endpoint to support viewport-based map queries.
- Ranked listings endpoint with weighted investment scoring.
- Large real-estate listing schema covering pricing, taxes, property specs, location, and descriptive metadata.
- Redfin CSV to Supabase ingestion script for loading external listing data.

The scoring logic combines population growth, tax sensitivity, and ADU signal detection from listing content, showing how domain-specific business rules can be translated into usable product features.

</details>

<details>
<summary><strong>Infrastructure</strong></summary>

## Infrastructure

The `iac` directory contains a Terraform-based AWS deployment layer built around EKS and Kubernetes.

Highlights:

- Supports both full infrastructure provisioning and deployment to an existing EKS cluster.
- Provisions or coordinates VPC networking, subnets, NAT, IAM roles, EKS, ECR integration, Kubernetes secrets, deployments, and services.
- Deploys frontend and backend as separate containers with environment-driven configuration.
- Supports optional HTTPS termination through ACM-backed Kubernetes LoadBalancer annotations.

This demonstrates practical infrastructure design, environment separation, container deployment, and Kubernetes-based application delivery.

</details>

<details>
<summary><strong>Tooling and Delivery</strong></summary>

## Tooling and Delivery

The project includes:

- Dockerfiles for both frontend and backend.
- Local Docker Compose support for backend development.
- Visible GitHub Actions for code quality and PR process checks.
- A Terraform secret and environment contract that is clearly shaped for GitHub-driven AWS deployment.

</details>

## Skills Demonstrated

- Full-stack application development with Next.js, Django, and PostgreSQL.
- Geospatial product design with Leaflet, GeoJSON, and viewport-aware data loading.
- Financial modeling UX for real estate underwriting.
- API design for data-heavy, map-driven applications.
- Supabase integration and external data ingestion.
- Docker-based containerization.
- Terraform-based AWS and Kubernetes infrastructure.
- EKS deployment patterns with secrets, image tags, TLS support, and cluster reuse.

## Why This Project Matters

This project is more than a CRUD demo. It combines product thinking, spatial data, financial analysis, and cloud delivery into a workflow that mirrors how investors evaluate opportunities in practice. The result is an end-to-end decision-support application that connects business logic, user workflow, data systems, and infrastructure in one coherent product.

At a delivery level, this work demonstrates competency in:

- Building a polished user-facing experience.
- Structuring a backend around real data and usable APIs.
- Designing cloud infrastructure that can scale beyond local development.
- Translating business use cases into technical workflows end to end.
- Maintaining code quality and team workflow standards through CI checks.
