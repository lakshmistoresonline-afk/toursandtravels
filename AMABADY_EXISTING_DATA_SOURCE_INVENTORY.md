# AMABADY Existing Data Source Inventory

This document identifies every externally generated destination data file available in the AMBADY project workspace.

## 1. Authoritative Destination Records

| File Name | Path | Format | Records | Schema | Source Type | Geographic Coverage | Domain |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `destinations.json` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/01_MASTER/destinations.json` | JSON | 116 | spotId, canonicalName, aliases, topCategory, subcategory, stateUT, district, cityLocality, region, discoveryStatus, verificationStatus, source, importance | Incredile India Harvest | India (26 States/UTs) | PILGRIMAGE, TOURIST |
| `destinations.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/01_MASTER/destinations.csv` | CSV | 116 | (Same as JSON) | Incredile India Harvest | India (26 States/UTs) | PILGRIMAGE, TOURIST |

## 2. Reference & Identity Metadata

| File Name | Path | Format | Records | Schema | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `aliases.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/06_SEARCH/aliases.csv` | CSV | 125 | searchTerm, spotId, termType | Search term mapping / identity resolution |
| `states_ut.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/02_GEOGRAPHY/states_ut.csv` | CSV | 36 | region, state_ut, type | Official Indian geographic hierarchy |
| `categories.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/03_CATEGORIES/categories.csv` | CSV | 53 | topCategory, subcategory | Taxonomy mapping |
| `circuits.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/04_PILGRIMAGE/circuits.csv` | CSV | 9 | circuitId, name, tradition | Predefined pilgrimage routes |

## 3. Provenance & Workflow Metadata

| File Name | Path | Format | Purpose |
| :--- | :--- | :--- | :--- |
| `source_registry.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/07_SOURCES/source_registry.csv` | CSV | Registry of authoritative data sources |
| `current_web_evidence.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/07_SOURCES/current_web_evidence.csv` | CSV | Links to live web sources for validation |
| `verification_status.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/08_VERIFICATION/verification_status.csv` | CSV | Definition of verification lifecycle states |

## 4. Reports (Not Input Data)

| File Name | Path | Format | Purpose |
| :--- | :--- | :--- | :--- |
| `DATA_DICTIONARY.json` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/DATA_DICTIONARY.json` | JSON | Rules and field definitions |
| `state_coverage.csv` | `AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/09_REPORTS/state_coverage.csv` | CSV | Audit of record distribution across states |

---

### **TOTAL SOURCE RECORDS FOUND**: 116

*Note: While multiple formats exist (JSON/CSV), the unique record set is derived from the master destination files.*
