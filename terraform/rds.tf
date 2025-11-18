resource "aws_db_subnet_group" "main" {
  name       = "task-management-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Name = "Task Management DB Subnet Group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier = "task-management-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = 1000
  storage_type          = "gp3"
  storage_encrypted      = true
  
  db_name  = "task_management"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  multi_az               = true
  publicly_accessible    = false
  
  skip_final_snapshot = false
  final_snapshot_identifier = "task-management-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name = "Task Management PostgreSQL"
  }
}

resource "aws_security_group" "rds" {
  name        = "task-management-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "Task Management RDS Security Group"
  }
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

