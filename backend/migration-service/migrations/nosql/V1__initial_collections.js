// Initial MongoDB collections for task management system

async function up(db) {
  // Create notifications collection
  await db.createCollection('notifications', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'type', 'title', 'message', 'channels', 'read', 'createdAt'],
        properties: {
          userId: {
            bsonType: 'string',
            description: 'User ID is required and must be a string'
          },
          type: {
            bsonType: 'string',
            description: 'Notification type is required and must be a string'
          },
          title: {
            bsonType: 'string',
            description: 'Title is required and must be a string'
          },
          message: {
            bsonType: 'string',
            description: 'Message is required and must be a string'
          },
          channels: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
              enum: ['websocket', 'email', 'push']
            }
          },
          read: {
            bsonType: 'bool',
            description: 'Read status is required and must be a boolean'
          },
          createdAt: {
            bsonType: 'date',
            description: 'Created date is required'
          }
        }
      }
    }
  });

  // Create indexes
  await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('notifications').createIndex({ read: 1 });

  // Create audit logs collection
  await db.createCollection('audit_logs', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'action', 'resource', 'timestamp'],
        properties: {
          userId: {
            bsonType: 'string'
          },
          action: {
            bsonType: 'string'
          },
          resource: {
            bsonType: 'string'
          },
          resourceId: {
            bsonType: 'string'
          },
          metadata: {
            bsonType: 'object'
          },
          timestamp: {
            bsonType: 'date'
          }
        }
      }
    }
  });

  await db.collection('audit_logs').createIndex({ userId: 1, timestamp: -1 });
  await db.collection('audit_logs').createIndex({ resource: 1, resourceId: 1 });

  // Create activity feeds collection
  await db.createCollection('activity_feeds', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'type', 'content', 'timestamp'],
        properties: {
          userId: {
            bsonType: 'string'
          },
          type: {
            bsonType: 'string'
          },
          content: {
            bsonType: 'object'
          },
          timestamp: {
            bsonType: 'date'
          }
        }
      }
    }
  });

  await db.collection('activity_feeds').createIndex({ userId: 1, timestamp: -1 });

  // Create file metadata collection
  await db.createCollection('file_metadata', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['fileName', 'fileSize', 'mimeType', 'uploadedAt'],
        properties: {
          fileName: {
            bsonType: 'string'
          },
          fileSize: {
            bsonType: 'long'
          },
          mimeType: {
            bsonType: 'string'
          },
          s3Key: {
            bsonType: 'string'
          },
          uploadedBy: {
            bsonType: 'string'
          },
          uploadedAt: {
            bsonType: 'date'
          },
          metadata: {
            bsonType: 'object'
          }
        }
      }
    }
  });

  await db.collection('file_metadata').createIndex({ uploadedBy: 1, uploadedAt: -1 });
  await db.collection('file_metadata').createIndex({ s3Key: 1 }, { unique: true });
}

async function down(db) {
  await db.collection('file_metadata').drop();
  await db.collection('activity_feeds').drop();
  await db.collection('audit_logs').drop();
  await db.collection('notifications').drop();
}

// ROLLBACK
// module.exports = { up, down };

