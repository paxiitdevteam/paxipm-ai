// SLA model (Service Level Management)
class SLA {
  constructor(id, projectId, name, serviceDescription, targetUptime, responseTimeTarget, resolutionTimeTarget, penaltyClause, aiRiskScore, status, startDate, endDate) {
    this.id = id;
    this.projectId = projectId;
    this.name = name;
    this.serviceDescription = serviceDescription;
    this.targetUptime = parseFloat(targetUptime) || 99.90;
    this.responseTimeTarget = parseInt(responseTimeTarget) || 60;
    this.resolutionTimeTarget = parseInt(resolutionTimeTarget) || 240;
    this.penaltyClause = penaltyClause;
    this.aiRiskScore = parseFloat(aiRiskScore) || 0.00;
    this.status = status || 'Active';
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static fromDb(row) {
    return new SLA(
      row.id,
      row.project_id,
      row.name,
      row.service_description,
      row.target_uptime,
      row.response_time_target,
      row.resolution_time_target,
      row.penalty_clause,
      row.ai_risk_score,
      row.status,
      row.start_date,
      row.end_date
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      name: this.name,
      serviceDescription: this.serviceDescription,
      targetUptime: this.targetUptime,
      responseTimeTarget: this.responseTimeTarget,
      resolutionTimeTarget: this.resolutionTimeTarget,
      penaltyClause: this.penaltyClause,
      aiRiskScore: this.aiRiskScore,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate
    };
  }
}

export default SLA;

