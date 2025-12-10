-- Migration: Add comprehensive settings fields
-- Run this migration to add all settings keys for Business Info, Banking, Tax & Legal, and Rewards

-- Business Information Settings
INSERT INTO settings (key, value, type, description) VALUES
('retail_name', 'Retail Billing System', 'string', 'Name of the retail business'),
('tagline', 'Your trusted retail partner', 'string', 'Business tagline or slogan'),
('address', '123 Main Street', 'string', 'Business street address'),
('city', 'Mumbai', 'string', 'Business city'),
('state', 'Maharashtra', 'string', 'Business state/province'),
('zip_code', '400001', 'string', 'Business ZIP/postal code'),
('country', 'India', 'string', 'Business country'),
('phone', '+91 98765 43210', 'string', 'Business contact phone number'),
('email', 'contact@retailstore.com', 'string', 'Business contact email'),
('website', '', 'string', 'Business website URL'),
('currency', 'INR', 'string', 'Default currency code'),
('currency_symbol', '₹', 'string', 'Currency symbol to display')
ON CONFLICT (key) DO NOTHING;

-- Banking Details Settings
INSERT INTO settings (key, value, type, description) VALUES
('bank_name', 'State Bank of India', 'string', 'Bank name'),
('account_number', '', 'string', 'Bank account number'),
('account_name', '', 'string', 'Account holder name'),
('ifsc_code', '', 'string', 'IFSC code (for India)'),
('swift_code', '', 'string', 'SWIFT/BIC code')
ON CONFLICT (key) DO NOTHING;

-- Tax & Legal Settings
INSERT INTO settings (key, value, type, description) VALUES
('tax_rate', '18', 'number', 'Default tax rate percentage'),
('tax_id', '', 'string', 'Tax ID / VAT Number'),
('business_registration_number', '', 'string', 'Business registration number')
ON CONFLICT (key) DO NOTHING;

-- Rewards Program Settings
INSERT INTO settings (key, value, type, description) VALUES
('rewards_enabled', 'false', 'boolean', 'Enable rewards program'),
('rewards_points_per_100', '1', 'number', 'Points earned per ₹100 spent'),
('rewards_redemption_value', '1', 'number', 'Currency value of 1 reward point'),
('rewards_minimum_points', '50', 'number', 'Minimum points required to redeem')
ON CONFLICT (key) DO NOTHING;

-- Update descriptions for existing settings if they exist
UPDATE settings SET description = 'Name of the retail business' WHERE key = 'retail_name';
UPDATE settings SET description = 'Business tagline or slogan' WHERE key = 'tagline';
UPDATE settings SET description = 'Business street address' WHERE key = 'address';
UPDATE settings SET description = 'Business city' WHERE key = 'city';
UPDATE settings SET description = 'Business state/province' WHERE key = 'state';
UPDATE settings SET description = 'Business ZIP/postal code' WHERE key = 'zip_code';
UPDATE settings SET description = 'Business country' WHERE key = 'country';
UPDATE settings SET description = 'Business contact phone number' WHERE key = 'phone';
UPDATE settings SET description = 'Business contact email' WHERE key = 'email';
UPDATE settings SET description = 'Business website URL' WHERE key = 'website';
UPDATE settings SET description = 'Default currency code' WHERE key = 'currency';
UPDATE settings SET description = 'Currency symbol to display' WHERE key = 'currency_symbol';

