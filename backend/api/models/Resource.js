// Resource model
class Resource {
  constructor(id, projectId, name, role, email, allocationPercentage, startDate, endDate, hourlyRate) {
    this.id = id;
    this.projectId = projectId;
    this.name = name;
    this.role = role;
    this.email = email;
    this.allocationPercentage = allocationPercentage || 100;
    this.startDate = startDate;
    this.endDate = endDate;
    this.hourlyRate = hourlyRate;
    this.createdAt = new Date();
  }

  static fromDb(row) {
    return new Resource(
      row.id,
      row.project_id,
      row.name,
      row.role,
      row.email,
      row.allocation_percentage,
      row.start_date,
      row.end_date,
      parseFloat(row.hourly_rate) || null
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      name: this.name,
      role: this.role,
      email: this.email,
      allocationPercentage: this.allocationPercentage,
      startDate: this.startDate,
      endDate: this.endDate,
      hourlyRate: this.hourlyRate
    };
  }
}

export default Resource;

