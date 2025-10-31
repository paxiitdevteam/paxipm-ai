// Issue model
class Issue {
  constructor(id, projectId, title, description, severity, status, resolution, owner) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.severity = severity;
    this.status = status || 'Open';
    this.resolution = resolution;
    this.owner = owner;
    this.createdAt = new Date();
  }

  static fromDb(row) {
    return new Issue(
      row.id,
      row.project_id,
      row.title,
      row.description,
      row.severity,
      row.status,
      row.resolution,
      row.owner
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      severity: this.severity,
      status: this.status,
      resolution: this.resolution,
      owner: this.owner
    };
  }
}

export default Issue;

