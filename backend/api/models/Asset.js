// Asset model (ITAM)
class Asset {
  constructor(id, projectId, name, type, owner, status, location, serialNumber, purchaseDate, warrantyExpiry, cost) {
    this.id = id;
    this.projectId = projectId;
    this.name = name;
    this.type = type || 'Other';
    this.owner = owner;
    this.status = status || 'Active';
    this.location = location;
    this.serialNumber = serialNumber;
    this.purchaseDate = purchaseDate;
    this.warrantyExpiry = warrantyExpiry;
    this.cost = cost;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static fromDb(row) {
    return new Asset(
      row.id,
      row.project_id,
      row.name,
      row.type,
      row.owner,
      row.status,
      row.location,
      row.serial_number,
      row.purchase_date,
      row.warranty_expiry,
      parseFloat(row.cost) || null
    );
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      name: this.name,
      type: this.type,
      owner: this.owner,
      status: this.status,
      location: this.location,
      serialNumber: this.serialNumber,
      purchaseDate: this.purchaseDate,
      warrantyExpiry: this.warrantyExpiry,
      cost: this.cost,
      isWarrantyExpired: this.warrantyExpiry && new Date(this.warrantyExpiry) < new Date(),
      isWarrantyExpiringSoon: this.warrantyExpiry && 
        new Date(this.warrantyExpiry) >= new Date() && 
        new Date(this.warrantyExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }
}

export default Asset;

