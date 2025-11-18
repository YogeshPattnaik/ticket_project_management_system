module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"
  
  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  cluster_endpoint_public_access = true
  
  eks_managed_node_groups = {
    main = {
      desired_size = 3
      max_size     = 10
      min_size     = 2
      
      instance_types = var.node_instance_types
      
      capacity_type = "ON_DEMAND"
    }
  }
  
  tags = {
    Environment = "production"
    Project     = "task-management"
  }
}

