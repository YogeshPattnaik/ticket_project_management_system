# File Service

SpringBoot service for file management with S3 integration.

## Features
- File upload/download
- S3 integration
- File metadata management
- File processing pipeline

## Configuration
- S3 bucket configuration
- MongoDB for file metadata
- File size limits
- Allowed file types

## API Endpoints
- POST /api/v1/files/upload
- GET /api/v1/files/{id}/download
- GET /api/v1/files/{id}/metadata
- DELETE /api/v1/files/{id}

