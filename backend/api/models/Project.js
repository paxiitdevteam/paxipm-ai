// Project model
class Project {
  constructor(id, title, description, client, startDate, endDate, status, userId) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.client = client;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.userId = userId;
    this.createdAt = new Date();
  }

  static fromDb(row) {
    return new Project(
      row.id,
      row.title,
      row.description,
      row.client,
      row.start_date,
      row.end_date,
      row.status,
      row.user_id
    );
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      client: this.client,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      userId: this.userId
    };
  }
}

export default Project;

