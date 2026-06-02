# Inventory Manager Archetype

## Purpose

Manage stock levels, item details, and low-stock operational states.

## Default Screens

- `inventory`: searchable inventory table.
- `item detail`: SKU, quantity, supplier, and notes.

## Entities

- `InventoryItem`: SKU, name, category, quantity, reorder point, supplier.

## Required Interactions

- Search items, filter by category/status, adjust quantity, and show low-stock states.

## Do Not Add Unless Requested

- Supplier APIs, barcode scanning, purchase orders, or warehouse integrations.
