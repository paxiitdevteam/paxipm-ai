// Change model (Change Management)
class Change {
  constructor(id, projectId, title, description, changeType, status, requestedBy, approvedBy, implementedBy, implementationDate, rollbackPlan, riskAssessment) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.changeType = changeType || 'Normal';
    this.status = status || 'Requested';
    this.requestedBy = requestedBy;
    this.approvedBy = approvedBy;
    this.implementedBy = implementedBy;
    this.implementationDate = implementationDate;
    this.rollbackPlan = rollbackPlan;
    this.riskAssessment = riskAssessment;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static fromDb(row) {
    return new Change(
      row.id,
      row.project_id,
      row.title,
      row.description,
      row.change_type,
      row.status,
      row.requested_by,
      row.approved_by,
      row.implemented_by,
      row.implementation_date,
      row.rollback_plan,
      row.risk_assessment
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      changeType: this.changeType,
      status: this.status,
      requestedBy: this.requestedBy,
      approvedBy: this.approvedBy,
      implementedBy: this.implementedBy,
      implementationDate: this.implementationDate,
      rollbackPlan: this.rollbackPlan,
      riskAssessment: this.riskAssessment
    };
  }
}

export default Change;

