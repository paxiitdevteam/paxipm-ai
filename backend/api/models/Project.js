// Project model
class Project {
  constructor(id, title, description, client, startDate, endDate, status, userId, riskScore, budgetedAmount, spentAmount, currencyCode) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.client = client;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.userId = userId;
    this.riskScore = riskScore;
    this.budgetedAmount = budgetedAmount || 0;
    this.spentAmount = spentAmount || 0;
    this.currencyCode = currencyCode || 'USD';
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
      row.user_id,
      row.risk_score || null,
      parseFloat(row.budgeted_amount) || 0,
      parseFloat(row.spent_amount) || 0,
      row.currency_code || 'USD'
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
      userId: this.userId,
      riskScore: this.riskScore || null,
      budgetedAmount: this.budgetedAmount,
      spentAmount: this.spentAmount,
      currencyCode: this.currencyCode,
      remainingBudget: this.budgetedAmount - this.spentAmount,
      budgetUtilization: this.budgetedAmount > 0 ? (this.spentAmount / this.budgetedAmount) * 100 : 0
    };
  }
}

export default Project;

