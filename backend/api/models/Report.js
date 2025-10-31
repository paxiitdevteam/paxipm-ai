// Report model
class Report {
  constructor(id, projectId, summary, createdAt) {
    this.id = id;
    this.projectId = projectId;
    this.summary = summary;
    this.createdAt = createdAt || new Date();
  }

  static fromDb(row) {
    return new Report(
      row.id,
      row.project_id,
      row.summary,
      row.created_at
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      summary: this.summary,
      createdAt: this.createdAt
    };
  }
}

export default Report;

