# Source License Status Audit

This file records license status visible inside the attached source archives. It is not legal advice.

## Explicit license files found

- `dxdc/babynames` — MIT License; copied as `LICENSE_SOURCE_dxdc_babynames.txt`
- Giuliana Taylor `baby-name-generator` — MIT License; copied as `LICENSE_SOURCE_Giuliana_Taylor.txt`
- tentatshu `baby_name_generator` / RNN — MIT License; copied as `LICENSE_SOURCE_tentatshu_RNN.txt`
- APIVerve `babynamegenerator-api` — MIT License; top-level and SDK license copies preserved
- Faker locale source used by the previous package — MIT license preserved
- Babel / CLDR-related support used by the previous package — applicable license files preserved

## No explicit license file found in attached archive

- `Baby-name-generator-master` (HMM boys/girls list)
- `Markov-Baby-Name-Generator-master`
- Jason Duquain `Baby-Name-Generator-master`

Their source README files are preserved for attribution/audit. Name lists from the two HMM/Markov repositories are retained for lossless source fidelity, but the absence of a license file is explicitly recorded here so downstream redistribution decisions can be made knowingly.

The Jason Duquain repository did not contribute a static name corpus in this pass; its README/manifest information remains preserved as a source/reference donor.

## Runtime-linked external donor

The attached Jason Duquain repository references `thm/uinames` remotely rather than bundling its name JSON. The current upstream `uinames` repository states that the root `names.json` data file is MIT-licensed specifically. This external data is documented in `AUDIT_EXTERNAL_DEPENDENCIES.md` and is not counted as physically attached source data in the zero-loss union.
