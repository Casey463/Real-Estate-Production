terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

locals {
  manage_eks_infra    = !var.use_existing_eks_cluster
  active_cluster_name = trimspace(var.cluster_name)
}

# ECR repositories — pre-created by the workflow; use data sources to avoid duplicate resource errors
data "aws_ecr_repository" "frontend" {
  name = "real-estate-frontend"
}

data "aws_ecr_repository" "backend" {
  name = "real-estate-backend"
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  count    = local.manage_eks_infra ? 1 : 0
  name     = local.active_cluster_name
  role_arn = local.eks_cluster_role_arn

  vpc_config {
    subnet_ids = local.private_subnet_ids
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_AmazonEKSClusterPolicy]
}

# EKS Node Group
resource "aws_eks_node_group" "default" {
  count           = local.manage_eks_infra ? 1 : 0
  cluster_name    = local.manage_eks_infra ? aws_eks_cluster.main[0].name : local.active_cluster_name
  node_group_name = "default"
  node_role_arn   = local.eks_node_role_arn
  subnet_ids      = local.private_subnet_ids
  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  depends_on = [
    aws_route_table_association.private,
    aws_iam_role_policy_attachment.eks_node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.eks_node_AmazonEC2ContainerRegistryReadOnly,
    aws_iam_role_policy_attachment.eks_node_AmazonEKS_CNI_Policy
  ]
}

# IAM roles for EKS
resource "aws_iam_role" "eks_cluster" {
  count              = local.manage_eks_infra ? 1 : 0
  name               = "eksClusterRole"
  assume_role_policy = data.aws_iam_policy_document.eks_assume_role.json
}

resource "aws_iam_role" "eks_node" {
  count              = local.manage_eks_infra ? 1 : 0
  name               = "eksNodeRole"
  assume_role_policy = data.aws_iam_policy_document.eks_node_assume_role.json
}

locals {
  eks_cluster_role_arn  = local.manage_eks_infra ? aws_iam_role.eks_cluster[0].arn : null
  eks_node_role_arn     = local.manage_eks_infra ? aws_iam_role.eks_node[0].arn : null
  eks_cluster_role_name = local.manage_eks_infra ? aws_iam_role.eks_cluster[0].name : null
  eks_node_role_name    = local.manage_eks_infra ? aws_iam_role.eks_node[0].name : null
}

data "aws_iam_policy_document" "eks_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eks_node_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# Attach required policies to roles
resource "aws_iam_role_policy_attachment" "eks_cluster_AmazonEKSClusterPolicy" {
  count      = local.manage_eks_infra ? 1 : 0
  role       = local.eks_cluster_role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_node_AmazonEKSWorkerNodePolicy" {
  count      = local.manage_eks_infra ? 1 : 0
  role       = local.eks_node_role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_node_AmazonEC2ContainerRegistryReadOnly" {
  count      = local.manage_eks_infra ? 1 : 0
  role       = local.eks_node_role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "eks_node_AmazonEKS_CNI_Policy" {
  count      = local.manage_eks_infra ? 1 : 0
  role       = local.eks_node_role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

data "aws_eks_cluster" "selected" {
  name       = local.active_cluster_name
  depends_on = [aws_eks_cluster.main]
}

# Kubernetes provider
provider "kubernetes" {
  host                   = data.aws_eks_cluster.selected.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.selected.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.main.token
}

data "aws_eks_cluster_auth" "main" {
  name = data.aws_eks_cluster.selected.name
}

# Kubernetes Deployments and Services will be in separate files for clarity
