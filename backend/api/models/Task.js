// Task model
class Task {
  constructor(id, projectId, title, owner, progress, dueDate) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.owner = owner;
    this.progress = progress;
    this.dueDate = dueDate;
    this.createdAt = new Date();
  }

  static fromDb(row) {
    return new Task(
      row.id,
      row.project_id,
      row.title,
      row.owner,
      row.progress,
      row.due_date
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      owner: this.owner,
      progress: this.progress,
      dueDate: this.dueDate
    };
  }
}

export default Task;

