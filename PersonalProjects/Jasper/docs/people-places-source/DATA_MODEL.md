# Data Model

## Person
A generated person may contain `name`, `settingProfile`, `life`, `identity`, `physicalDescription`, `personality`, `interests`, `mood`, `memory`, `knowledge`, `routine`, `currentPlaceId`, and `conversation`. `physicalDescription` is prose-oriented descriptive metadata only.

## Place
A generated place may contain `name`, `kind`, `mode`, `geography`, `descriptors`, `accessibility`, `ambience`, `capacity`, occupancy lists, and setting-specific assignment metadata such as decks/cabins on ships or stations.

## Relationship
Relationship edges connect person IDs and track type, romantic status, trust, closeness, tension, agreements and history.
