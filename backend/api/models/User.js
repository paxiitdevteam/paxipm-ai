// User model
class User {
  constructor(id, name, email, role, passwordHash) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
  }

  static fromDb(row) {
    return new User(
      row.id,
      row.name,
      row.email,
      row.role,
      row.password_hash
    );
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role
    };
  }
}

export default User;

