# Infrastructure Deployment Guide

This Terraform setup supports two deployment modes controlled by `USE_EXISTING_EKS_CLUSTER`.

## Mode A: Managed EKS (default)

Use this mode when this repo should create and manage cluster infrastructure.

- `use_existing_eks_cluster = false` (default)
- Workflow secret `USE_EXISTING_EKS_CLUSTER=false` (or unset)

Terraform manages:

- VPC/subnets/NAT (unless existing VPC/subnet inputs are provided)
- EKS cluster and node group
- EKS IAM role attachments (or reuses existing role ARNs when provided)

## Mode B: Existing EKS Cluster

Use when a cluster already exists and this repo should deploy Kubernetes resources only.

- `use_existing_eks_cluster = true`
- Workflow secret `USE_EXISTING_EKS_CLUSTER=true`

Terraform skips:

- VPC/subnets/route tables/NAT creation
- EKS cluster and node group creation
- EKS IAM role creation/attachment logic

Ignored in this mode:

- `EXISTING_VPC_ID`
- `EXISTING_PRIVATE_SUBNET_IDS`
- `EXISTING_PUBLIC_SUBNET_IDS`
- `EXISTING_EKS_CLUSTER_ROLE_ARN`
- `EXISTING_EKS_NODE_ROLE_ARN`

## How Existing Cluster Selection Works

Selection is by cluster name.

- GitHub Actions reads `CLUSTER_NAME` from the `AWS` environment secrets.
- Workflow passes it to Terraform as `TF_VAR_cluster_name`.
- Terraform resolves cluster metadata with `data.aws_eks_cluster.selected`.
- Workflow kubeconfig update also targets `--name "$CLUSTER_NAME"`.

If `CLUSTER_NAME` is wrong for the configured account/region, the workflow fails fast.

## HTTPS Mode (Certificate-Driven)

HTTPS is enabled automatically when `ACM_CERTIFICATE_ARN` is set in the `AWS` GitHub Environment.

- If `ACM_CERTIFICATE_ARN` is empty, services are created in HTTP mode (port 80).
- If `ACM_CERTIFICATE_ARN` is provided, frontend and backend services are configured for TLS termination and expose port 443.

Behavior with deployment modes:

- `USE_EXISTING_EKS_CLUSTER=false`: applies HTTPS configuration while creating/updating cluster-managed resources.
- `USE_EXISTING_EKS_CLUSTER=true`: applies HTTPS configuration to the existing cluster named by `CLUSTER_NAME` and updates app resources/secrets as usual.

Notes:

- The ACM certificate must be in the same AWS region as the cluster load balancers.
- To avoid mixed-content/browser issues, set `FRONTEND_URL`, `BACKEND_URL`, and `NEXT_PUBLIC_BASE_API_URL` to `https://...` values when using HTTPS mode.

## Required GitHub Environment Secrets

Set these in the `AWS` GitHub Environment:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `CLUSTER_NAME`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `BACKEND_URL`
- `FRONTEND_URL`
- `NEXT_PUBLIC_BASE_API_URL`
- `ACM_CERTIFICATE_ARN` (optional: set to enable HTTPS mode)

Optional (managed mode only):

- none

## First-Run Checklist

1. Confirm GitHub Environment `AWS` exists in the repository.
2. Add all required secrets listed above.
3. Choose deployment mode by setting `USE_EXISTING_EKS_CLUSTER`.
4. Ensure `CLUSTER_NAME` matches the intended cluster in `AWS_REGION`.
5. Push to `main` or run a PR build.
6. Check the `Post-deploy Kubernetes diagnostics` step for pod/service status.

## Update Frontend/Backend URLs After Service Provisioning

Run this in AWS CloudShell after the LoadBalancers have external endpoints:

```bash
REGION="us-west-2"; CLUSTER_NAME="your-eks-cluster"; OWNER="Experiential-AI"; REPO="Real-Estate-Production"; ENV_NAME="AWS"; aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME" >/dev/null; FE=$(kubectl get svc frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}{.status.loadBalancer.ingress[0].ip}'); BE=$(kubectl get svc backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}{.status.loadBalancer.ingress[0].ip}'); [ -n "$FE" ] && [ -n "$BE" ] || { echo "LoadBalancer endpoint missing (still pending?)"; exit 1; }; FRONTEND_URL="http://$FE"; BACKEND_URL="http://$BE"; printf '%s' "$FRONTEND_URL" | gh secret set FRONTEND_URL --repo "$OWNER/$REPO" --env "$ENV_NAME"; printf '%s' "$BACKEND_URL" | gh secret set BACKEND_URL --repo "$OWNER/$REPO" --env "$ENV_NAME"; printf '%s' "$BACKEND_URL" | gh secret set NEXT_PUBLIC_BASE_API_URL --repo "$OWNER/$REPO" --env "$ENV_NAME"; echo "Set FRONTEND_URL=$FRONTEND_URL"; echo "Set BACKEND_URL=$BACKEND_URL"; echo "Set NEXT_PUBLIC_BASE_API_URL=$BACKEND_URL"
```

Run this in Cloudshell if there is an issue updating the API
URLS: `kubectl rollout restart deployment/frontend deployment/backend`
