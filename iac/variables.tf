variable "vpc_cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}


# AWS and EKS configuration variables
variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "cluster_name" {
  description = "EKS Cluster name"
  type        = string
  validation {
    condition     = can(regex("^[0-9A-Za-z][0-9A-Za-z_-]*$", trimspace(var.cluster_name)))
    error_message = "cluster_name must start with an alphanumeric character and contain only letters, numbers, underscores, or hyphens."
  }
}

variable "use_existing_eks_cluster" {
  description = "When true, reuse an already-created EKS cluster and skip EKS/VPC/subnet/role provisioning in this module."
  type        = bool
  default     = false
}

variable "frontend_image_tag" {
  description = "Tag for the frontend Docker image"
  type        = string
}

variable "backend_image_tag" {
  description = "Tag for the backend Docker image"
  type        = string
}

variable "acm_certificate_arn" {
  description = "Optional ACM certificate ARN. When provided, frontend/backend LoadBalancer services expose HTTPS (443) with TLS termination."
  type        = string
  default     = ""
}

variable "backend_env_secret_values" {
  description = "Key/value pairs for the backend Kubernetes secret"
  type        = map(string)
  sensitive   = true
  default = {
    DB_NAME           = "replace_me"
    DB_USER           = "replace_me"
    DB_PASSWORD       = "replace_me"
    DB_HOST           = "replace_me"
    DB_PORT           = "5432"
    BACKEND_URL       = "https://replace-me.example.com"
    FRONTEND_URL      = "https://replace-me.example.com"
  }
}

variable "frontend_env_secret_values" {
  description = "Key/value pairs for the frontend Kubernetes secret"
  type        = map(string)
  sensitive   = true
  default = {
    NEXT_PUBLIC_BASE_API_URL = "https://replace-me.example.com"
  }
}
