// Risk model
class Risk {
  constructor(id, projectId, title, description, probability, impact, riskScore, status, mitigationPlan, owner) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.probability = probability;
    this.impact = impact;
    this.riskScore = riskScore;
    this.status = status || 'Open';
    this.mitigationPlan = mitigationPlan;
    this.owner = owner;
    this.createdAt = new Date();
  }

  static fromDb(row) {
    return new Risk(
      row.id,
      row.project_id,
      row.title,
      row.description,
      row.probability,
      row.impact,
      row.risk_score,
      row.status,
      row.mitigation_plan,
      row.owner
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      probability: this.probability,
      impact: this.impact,
      riskScore: this.riskScore,
      status: this.status,
      mitigationPlan: this.mitigationPlan,
      owner: this.owner
    };
  }
}

export default Risk;

