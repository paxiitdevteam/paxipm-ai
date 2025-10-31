// Milestone model
class Milestone {
  constructor(id, projectId, title, description, targetDate, status, completedDate) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.targetDate = targetDate;
    this.status = status || 'Pending';
    this.completedDate = completedDate;
    this.createdAt = new Date();
  }

  static fromDb(row) {
    return new Milestone(
      row.id,
      row.project_id,
      row.title,
      row.description,
      row.target_date,
      row.status,
      row.completed_date
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      targetDate: this.targetDate,
      status: this.status,
      completedDate: this.completedDate,
      isOverdue: this.targetDate && new Date(this.targetDate) < new Date() && this.status !== 'Completed',
      isDueSoon: this.targetDate && !this.isOverdue && new Date(this.targetDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && this.status !== 'Completed'
    };
  }
}

export default Milestone;

