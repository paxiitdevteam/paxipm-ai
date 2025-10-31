// ITIL Incident model (to avoid conflict with existing Issue model)
class ITILIncident {
  constructor(id, projectId, assetId, title, description, priority, status, reportedBy, assignedTo, slaId, resolution, resolvedAt) {
    this.id = id;
    this.projectId = projectId;
    this.assetId = assetId;
    this.title = title;
    this.description = description;
    this.priority = priority || 'Medium';
    this.status = status || 'Open';
    this.reportedBy = reportedBy;
    this.assignedTo = assignedTo;
    this.slaId = slaId;
    this.resolution = resolution;
    this.resolvedAt = resolvedAt;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static fromDb(row) {
    return new ITILIncident(
      row.id,
      row.project_id,
      row.asset_id,
      row.title,
      row.description,
      row.priority,
      row.status,
      row.reported_by,
      row.assigned_to,
      row.sla_id,
      row.resolution,
      row.resolved_at
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      assetId: this.assetId,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      reportedBy: this.reportedBy,
      assignedTo: this.assignedTo,
      slaId: this.slaId,
      resolution: this.resolution,
      resolvedAt: this.resolvedAt,
      isOverdue: this.status !== 'Resolved' && this.status !== 'Closed' && this.priority === 'Critical'
    };
  }
}

export default ITILIncident;

