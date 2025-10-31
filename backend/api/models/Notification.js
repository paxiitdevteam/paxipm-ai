// Notification model
class Notification {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.projectId = data.project_id || data.projectId;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type || 'info';
    this.readStatus = data.read_status !== undefined ? Boolean(data.read_status) : data.readStatus || false;
    this.createdAt = data.created_at || data.createdAt;
  }

  static fromDb(row) {
    return new Notification(row);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      projectId: this.projectId,
      title: this.title,
      message: this.message,
      type: this.type,
      readStatus: this.readStatus,
      createdAt: this.createdAt
    };
  }
}

export default Notification;
