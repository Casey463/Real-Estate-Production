resource "aws_vpc" "eks_vpc" {
  count                = !var.use_existing_eks_cluster ? 1 : 0
  cidr_block           = var.vpc_cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "eks-vpc"
  }
}

locals {
  vpc_id = var.use_existing_eks_cluster ? null : aws_vpc.eks_vpc[0].id
}

resource "aws_subnet" "private" {
  count             = !var.use_existing_eks_cluster ? length(var.private_subnet_cidrs) : 0
  vpc_id            = local.vpc_id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = element(var.availability_zones, count.index)
  tags = {
    Name = "eks-private-subnet-${count.index}"
  }
}

resource "aws_subnet" "public" {
  count                   = !var.use_existing_eks_cluster ? length(var.public_subnet_cidrs) : 0
  vpc_id                  = local.vpc_id
  cidr_block              = var.public_subnet_cidrs[count.index]
  map_public_ip_on_launch = true
  availability_zone       = element(var.availability_zones, count.index)
  tags = {
    Name = "eks-public-subnet-${count.index}"
  }
}

# Add internet and NAT egress for private subnets when this module creates the VPC/subnets.
resource "aws_internet_gateway" "eks" {
  count  = !var.use_existing_eks_cluster ? 1 : 0
  vpc_id = local.vpc_id

  tags = {
    Name = "eks-igw"
  }
}

resource "aws_eip" "nat" {
  count  = !var.use_existing_eks_cluster ? 1 : 0
  domain = "vpc"

  tags = {
    Name = "eks-nat-eip"
  }
}

resource "aws_nat_gateway" "eks" {
  count         = !var.use_existing_eks_cluster ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  depends_on = [aws_internet_gateway.eks]

  tags = {
    Name = "eks-nat"
  }
}

resource "aws_route_table" "public" {
  count  = !var.use_existing_eks_cluster ? 1 : 0
  vpc_id = local.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks[0].id
  }

  tags = {
    Name = "eks-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = !var.use_existing_eks_cluster ? length(aws_subnet.public) : 0
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}

resource "aws_route_table" "private" {
  count  = !var.use_existing_eks_cluster ? 1 : 0
  vpc_id = local.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.eks[0].id
  }

  tags = {
    Name = "eks-private-rt"
  }
}

resource "aws_route_table_association" "private" {
  count          = !var.use_existing_eks_cluster ? length(aws_subnet.private) : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[0].id
}

locals {
  private_subnet_ids = var.use_existing_eks_cluster ? [] : aws_subnet.private[*].id
  public_subnet_ids  = var.use_existing_eks_cluster ? [] : aws_subnet.public[*].id
}

# Outputs for EKS
output "vpc_id" {
  value = var.use_existing_eks_cluster ? null : local.vpc_id
}

output "public_subnet_ids" {
  value = local.public_subnet_ids
}

output "private_subnet_ids" {
  value = local.private_subnet_ids
}
