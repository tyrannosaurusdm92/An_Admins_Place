# People/Places Scope Cleanup Audit

This build removes visual-creator recipe banks and assets. Removed data categories included pose presets, appearance hashes, compatibility hashes, target zones, garment layer anchors, accessory anchors, sprite-like positioning data, and image biome assets.

Runtime scope is people and locations. Person physical traits remain because they describe generated people in text and structured metadata; they do not drive a visual renderer. Narrative branching/storylet modules were also removed so the interaction layer remains focused on people, conversations, memory, movement and places.
