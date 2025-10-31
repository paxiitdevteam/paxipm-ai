# Budget Management & Multi-Currency Support

## Overview

PaxiPM AI includes comprehensive budget management with universal currency support, allowing users from any country to track project finances in their preferred currency.

## Features

### 1. Budget Tracking
- **Budgeted Amount**: Total allocated budget for the project
- **Spent Amount**: Actual amount spent to date
- **Remaining Budget**: Automatically calculated (Budgeted - Spent)
- **Budget Utilization**: Percentage of budget used (Spent / Budgeted × 100)

### 2. Multi-Currency Support

**Supported Currencies:**
- Major currencies: USD, EUR, GBP, JPY, CNY, INR, AUD, CAD, NZD
- Regional currencies: CHF, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN
- Asian currencies: SGD, HKD, TWD, KRW, THB, MYR, IDR, PHP, VND
- Middle Eastern: AED, SAR, ILS, TRY
- Latin American: MXN, BRL, ARS, CLP, COP
- African: ZAR, EGP, NGN, KES
- And 100+ additional currencies

**Currency Selection:**
- Set currency per project during creation
- Set default currency per organization (Phase 4)
- Currency cannot be changed after project creation (prevents data inconsistency)
- All budget amounts stored in selected currency

### 3. Budget Health Indicators

- **On Budget**: Spent ≤ Budgeted (within tolerance)
- **Under Budget**: Spent < Budgeted (good variance)
- **Over Budget**: Spent > Budgeted (alert threshold)
- **Critical Over Budget**: Spent > 110% of Budgeted (urgent alert)

### 4. Budget Reports

- Budget vs. Actual comparison
- Budget utilization trend charts
- Multi-currency financial dashboards
- Budget health by project status
- Export to Excel/PDF with currency formatting

## Database Schema

```sql
-- Projects table with budget fields
CREATE TABLE projects (
    ...
    budgeted_amount DECIMAL(15, 2) DEFAULT 0.00,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    currency_code VARCHAR(3) DEFAULT 'USD',
    ...
);
```

## API Endpoints

### Create Project with Budget
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Hardware Refresh Project",
  "description": "PC and device refresh cycle",
  "budgetedAmount": 50000.00,
  "currencyCode": "USD"
}
```

### Update Budget (Future)
```http
PATCH /api/projects/{id}/budget
Authorization: Bearer <token>
Content-Type: application/json

{
  "budgetedAmount": 55000.00,
  "spentAmount": 32000.00
}
```

## Implementation Status

### ✅ Phase 1 (Complete)
- Database schema with budget fields
- Project model with budget tracking
- API endpoints accept budget parameters
- Budget calculations (remaining, utilization)

### 📋 Phase 2 (Planned)
- Budget management UI in frontend
- Currency selector component
- Budget health indicators
- Budget dashboard widgets

### 📋 Phase 3 (Planned)
- AI-powered budget predictions
- Budget risk analysis
- Automated budget alerts

### 📋 Phase 4 (Planned)
- Organization-level default currency
- Multi-currency reports
- Currency conversion (optional, requires API)
- Budget approval workflows

## Migration

For existing databases, run:

```sql
-- Migration script
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS budgeted_amount DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'USD';
```

Or use the migration script:
```bash
mysql -u root -p paxipm < backend/db/migration_add_budget.sql
```

## Best Practices

1. **Currency Selection**: Choose the currency that matches your primary spending (vendor payments, contracts)
2. **Budget Setting**: Set realistic budgets based on historical data or AI predictions
3. **Regular Updates**: Update spent amounts regularly for accurate tracking
4. **Budget Reviews**: Review budget health weekly in project reviews
5. **Alerts**: Configure alerts for over-budget situations

## Currency Codes Reference

Standard ISO 4217 currency codes are used (3-letter codes):
- USD = United States Dollar
- EUR = Euro
- GBP = British Pound
- JPY = Japanese Yen
- CNY = Chinese Yuan
- INR = Indian Rupee
- AUD = Australian Dollar
- CAD = Canadian Dollar

Full list: https://en.wikipedia.org/wiki/ISO_4217

## Future Enhancements

- Real-time currency exchange rates (optional integration)
- Multi-currency portfolios (projects with different currencies)
- Budget templates by project type
- AI budget estimation during project setup
- Integration with accounting systems (QuickBooks, Xero)

